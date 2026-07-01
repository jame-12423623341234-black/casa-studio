import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText, ShieldCheck } from "lucide-react";
import { getFiles, getSignInHistory } from "@/lib/auth";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [{ title: "My Activity — Casa Studio" }],
  }),
  component: UsersPage,
});

function UsersPage() {
  const history = getSignInHistory();
  const files = getFiles();

  return (
    <div className="min-h-screen bg-secondary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-white p-8 shadow-luxe">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              User Activity
            </p>
            <h1 className="mt-1 font-display text-3xl font-medium">Downloads & Activity</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Resources are available directly from the homepage, and recent downloads appear here for reference.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-border bg-secondary/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
              <ShieldCheck className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Open access</p>
              <p className="text-sm text-muted-foreground">Download guides directly without signing in.</p>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">
            No activity recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => {
              const downloadedFile = files.find((file) => file.id === entry.fileId);
              return (
                <div key={entry.id} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Signed in {new Date(entry.signedInAt).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.platform} · {entry.deviceType}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${entry.downloadStatus === "downloaded" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {entry.downloadStatus === "downloaded" ? "Downloaded" : "Pending download"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">IP Address</p>
                      <p className="mt-1 text-foreground">{entry.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Device</p>
                      <p className="mt-1 text-foreground">{entry.platform}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Download</p>
                      <p className="mt-1 flex items-center gap-1 text-foreground">
                        <Download className="h-3.5 w-3.5" />
                        {entry.lastDownloadAt ? new Date(entry.lastDownloadAt).toLocaleString() : "Not yet"}
                      </p>
                    </div>
                  </div>
                  {entry.downloadStatus === "downloaded" && downloadedFile && (
                    <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText className="h-4 w-4" />
                        {downloadedFile.name}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {downloadedFile.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
