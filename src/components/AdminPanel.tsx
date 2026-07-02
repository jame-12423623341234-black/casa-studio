import { useState, useRef, useCallback } from "react";
import {
  Upload, Trash2, Edit3, Download, FileText, X, Check,
  BarChart2, Users, RefreshCw, AlertCircle, Plus
} from "lucide-react";
import {
  getFiles,
  saveFile,
  deleteFile,
  getSignInHistory,
  deleteSignInHistoryEntry,
  deleteUserSignInHistory,
  getConsultationEnquiries,
  markConsultationEnquiryStatus,
  deleteConsultationEnquiry,
  getPropertyListings,
  savePropertyListing,
  deletePropertyListing,
  type DownloadFile,
  type SignInHistoryEntry,
  type ConsultationEnquiry,
  type PropertyListing,
} from "@/lib/auth";
import { apiUrl } from "@/lib/api";

interface AdminPanelProps {
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"files" | "users" | "crm">("files");
  const [signinHistory, setSigninHistory] = useState<SignInHistoryEntry[]>(() =>
    getSignInHistory().slice().sort((a, b) => Date.parse(b.signedInAt) - Date.parse(a.signedInAt))
  );
  const [enquiries, setEnquiries] = useState<ConsultationEnquiry[]>(() => getConsultationEnquiries());
  const [propertyListings, setPropertyListings] = useState<PropertyListing[]>(() => getPropertyListings());
  const [listingDraft, setListingDraft] = useState({ title: "", location: "", price: "", status: "Live" as PropertyListing["status"] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    try {
      const res = await fetch(apiUrl('/api/files'));
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      setFiles(getFiles());
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setUploading(true);

    for (const file of Array.from(uploadedFiles)) {
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const extension = file.name.split(".").pop()?.toLowerCase();
          const mimeType =
            file.type ||
            (extension === "exe"
              ? "application/x-msdownload"
              : "application/octet-stream");

          const payload = {
            name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            fileName: file.name,
            description: "Uploaded file — click Edit to add a description.",
            size: formatBytes(file.size),
            dataUrl: reader.result,
            mimeType,
          };

          try {
            await fetch(apiUrl('/api/files'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch (err) {
            // fallback to local save
            const newFile: DownloadFile = {
              id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: payload.name,
              description: payload.description,
              size: payload.size,
              uploadedAt: new Date().toISOString(),
              downloadCount: 0,
              dataUrl: payload.dataUrl as string,
              mimeType: payload.mimeType,
              fileName: payload.fileName,
            };
            saveFile(newFile);
          }

          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    await refresh();
    setUploading(false);
    showToast(`${uploadedFiles.length} file(s) uploaded successfully.`);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    []
  );

  const handleDelete = (id: string) => {
    if (!confirm("Delete this file?")) return;
    deleteFile(id);
    refresh();
    showToast("File deleted.");
  };

  const startEdit = (file: DownloadFile) => {
    setEditingId(file.id);
    setEditName(file.name);
    setEditDesc(file.description);
  };

  const saveEdit = (file: DownloadFile) => {
    saveFile({ ...file, name: editName, description: editDesc });
    setEditingId(null);
    refresh();
    showToast("File updated.");
  };

  const totalDownloads = files.reduce((s, f) => s + f.downloadCount, 0);
  const newLeads = enquiries.filter((item) => item.status === "new").length;

  const refreshHistory = () => {
    setSigninHistory(
      getSignInHistory()
        .slice()
        .sort((a, b) => Date.parse(b.signedInAt) - Date.parse(a.signedInAt))
    );
  };

  const handleDeleteHistoryEntry = (id: string, email: string) => {
    if (!confirm(`Delete this history entry for ${email}?`)) return;
    deleteSignInHistoryEntry(id);
    refreshHistory();
    showToast("History entry deleted.");
  };

  const handleDeleteUserHistory = (email: string) => {
    if (!confirm(`Delete all history for ${email}?`)) return;
    deleteUserSignInHistory(email);
    refreshHistory();
    showToast("User history deleted.");
  };

  const refreshCrm = () => {
    setEnquiries(getConsultationEnquiries());
    setPropertyListings(getPropertyListings());
  };

  const handleEnquiryStatusChange = (id: string, status: ConsultationEnquiry["status"]) => {
    markConsultationEnquiryStatus(id, status);
    refreshCrm();
    showToast("Lead status updated.");
  };

  const handleDeleteEnquiry = (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    deleteConsultationEnquiry(id);
    refreshCrm();
    showToast("Enquiry removed.");
  };

  const handleAddListing = (event: React.FormEvent) => {
    event.preventDefault();
    if (!listingDraft.title || !listingDraft.location || !listingDraft.price) return;

    const listing: PropertyListing = {
      id: listingDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24),
      title: listingDraft.title,
      location: listingDraft.location,
      price: listingDraft.price,
      status: listingDraft.status,
      createdAt: new Date().toISOString(),
    };

    savePropertyListing(listing);
    refreshCrm();
    setListingDraft({ title: "", location: "", price: "", status: "Live" });
    showToast("Listing saved.");
  };

  const handleDeleteListing = (id: string) => {
    if (!confirm("Delete this listing?")) return;
    deletePropertyListing(id);
    refreshCrm();
    showToast("Listing removed.");
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-secondary/95 backdrop-blur-sm">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] flex items-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-sm font-medium text-white shadow-luxe animate-fade-up">
          <Check className="h-4 w-4 text-green-400" /> {toast}
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Admin Dashboard
            </p>
            <h1 className="mt-1 font-display text-4xl font-medium">
              File Manager
            </h1>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-soft transition hover:bg-secondary"
          >
            <X className="h-4 w-4" /> Exit Admin
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {[
            { icon: FileText, label: "Total Files", value: files.length },
            { icon: Download, label: "Total Downloads", value: totalDownloads },
            { icon: Users, label: "New Leads", value: newLeads },
            { icon: BarChart2, label: "Live Listings", value: propertyListings.filter((item) => item.status === "Live" || item.status === "Featured").length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-white p-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-display text-3xl font-medium">
                  {stat.value}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("files")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === "files" ? "bg-charcoal text-white" : "bg-white text-foreground hover:bg-secondary"}`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === "users" ? "bg-charcoal text-white" : "bg-white text-foreground hover:bg-secondary"}`}
          >
            Users & History
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === "crm" ? "bg-charcoal text-white" : "bg-white text-foreground hover:bg-secondary"}`}
          >
            CRM & Listings
          </button>
        </div>

        {activeTab === "files" && (
          <>
            {/* Upload Zone */}
            <div
              className={`mb-8 rounded-3xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-charcoal bg-secondary"
                  : "border-border bg-white hover:border-charcoal/40 hover:bg-secondary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Uploading…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                    <Plus className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drop files here or click to upload
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Any file type supported
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* File List */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-medium">Uploaded Files</h2>

              {files.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-10 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No files uploaded yet. Upload your first file above.
                  </p>
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-2xl border border-border bg-white p-6 shadow-soft transition hover:shadow-luxe"
                  >
                    {editingId === file.id ? (
                      /* Edit mode */
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            File Name
                          </label>
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-charcoal focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Description
                          </label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none resize-none focus:border-charcoal focus:bg-white"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => saveEdit(file)}
                            className="flex items-center gap-1.5 rounded-xl bg-charcoal px-4 py-2 text-sm font-medium text-white transition hover:bg-charcoal/90"
                          >
                            <Check className="h-3.5 w-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-secondary"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                            <FileText className="h-4 w-4 text-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {file.name}
                            </p>
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                              {file.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>{file.size}</span>
                              <span>
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {file.downloadCount} downloads
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => startEdit(file)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/20 text-destructive transition hover:bg-destructive/5"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Download Link Info */}
            {files.length > 0 && (
              <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 p-6">
                <h3 className="font-display text-lg font-medium mb-2">
                  Auto-Download URLs
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share these URLs — clicking them triggers an instant download.
                </p>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                      <code className="flex-1 min-w-0 truncate text-xs text-muted-foreground">
                        {window.location.origin}/download/{file.id}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/download/${file.id}`
                          );
                          showToast("Link copied!");
                        }}
                        className="shrink-0 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium transition hover:bg-border"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "crm" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-medium">Lead pipeline</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Track consultation requests and move them from new to contacted.</p>
                </div>
                <div className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-foreground">{enquiries.length} enquiries</div>
              </div>
              <div className="mt-6 space-y-3">
                {enquiries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">No consultation enquiries yet.</div>
                ) : enquiries.map((enquiry) => (
                  <div key={enquiry.id} className="rounded-2xl border border-border bg-secondary/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{enquiry.name}</p>
                        <p className="text-sm text-muted-foreground">{enquiry.email} · {enquiry.topic}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={enquiry.status} onChange={(event) => handleEnquiryStatusChange(enquiry.id, event.target.value as ConsultationEnquiry["status"])} className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none">
                          <option value="new">New</option>
                          <option value="follow-up">Follow-up</option>
                          <option value="contacted">Contacted</option>
                        </select>
                        <button onClick={() => handleDeleteEnquiry(enquiry.id)} className="rounded-xl border border-destructive/20 px-3 py-2 text-sm font-medium text-destructive">Delete</button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{enquiry.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-medium">Property listings</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Create and manage live listings from the admin dashboard.</p>
                </div>
              </div>

              <form onSubmit={handleAddListing} className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input required value={listingDraft.title} onChange={(event) => setListingDraft({ ...listingDraft, title: event.target.value })} placeholder="Listing title" className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none" />
                <input required value={listingDraft.location} onChange={(event) => setListingDraft({ ...listingDraft, location: event.target.value })} placeholder="Location" className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none" />
                <input required value={listingDraft.price} onChange={(event) => setListingDraft({ ...listingDraft, price: event.target.value })} placeholder="Price" className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none" />
                <select value={listingDraft.status} onChange={(event) => setListingDraft({ ...listingDraft, status: event.target.value as PropertyListing["status"] })} className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none">
                  <option value="Live">Live</option>
                  <option value="Featured">Featured</option>
                  <option value="Hidden">Hidden</option>
                </select>
                <button type="submit" className="md:col-span-2 xl:col-span-4 rounded-2xl bg-charcoal px-4 py-3 text-sm font-medium text-white">Add listing</button>
              </form>

              <div className="mt-6 grid gap-3">
                {propertyListings.map((listing) => (
                  <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/40 p-4">
                    <div>
                      <p className="font-medium text-foreground">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">{listing.location} · {listing.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground">{listing.status}</span>
                      <button onClick={() => handleDeleteListing(listing.id)} className="rounded-xl border border-destructive/20 px-3 py-2 text-sm font-medium text-destructive">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-xl font-medium">Visitor Activity</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Review visitor activity, device details, IP addresses, and auto-download status.
              </p>
            </div>

            {signinHistory.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">
                No visitor activity has been recorded yet.
              </div>
            ) : (
              Object.entries(
                signinHistory.reduce<Record<string, SignInHistoryEntry[]>>((groups, entry) => {
                  const key = entry.userEmail.trim().toLowerCase();
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(entry);
                  return groups;
                }, {})
              ).map(([key, entries]) => {
                const userEmail = entries[0]?.userEmail ?? key;
                return (
                  <div key={key} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{userEmail}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {entries.length} activity record{entries.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteUserHistory(userEmail)}
                        className="flex items-center gap-2 rounded-xl border border-destructive/20 px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete history
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {entries.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Signed in {new Date(entry.signedInAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${entry.downloadStatus === "downloaded" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                                {entry.downloadStatus === "downloaded" ? "Downloaded" : "Not downloaded"}
                              </span>
                              <button
                                onClick={() => handleDeleteHistoryEntry(entry.id, userEmail)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-white hover:text-foreground"
                                title="Delete this entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                            <div>
                              <p className="text-xs uppercase tracking-wider text-muted-foreground">Device</p>
                              <p className="mt-1 text-foreground">{entry.platform} · {entry.deviceType}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-muted-foreground">IP Address</p>
                              <p className="mt-1 text-foreground">{entry.ipAddress}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-muted-foreground">Download</p>
                              <p className="mt-1 text-foreground">{entry.lastDownloadAt ? new Date(entry.lastDownloadAt).toLocaleString() : "Not yet"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
