// Simple client-side auth with localStorage persistence
// In production this would be replaced with a real backend

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface DownloadFile {
  id: string;
  name: string;
  description: string;
  size: string;
  uploadedAt: string;
  downloadCount: number;
  // In real app: actual file URL. Here we simulate with a data URL
  dataUrl: string;
  mimeType: string;
  fileName: string;
}

export interface SignInHistoryEntry {
  id: string;
  userEmail: string;
  signedInAt: string;
  platform: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  ipAddress: string;
  userAgent: string;
  downloadStatus: "not-downloaded" | "downloaded";
  lastDownloadAt?: string;
  fileId?: string;
}

const USERS_KEY = "casa_users";
const CURRENT_USER_KEY = "casa_current_user";
const FILES_KEY = "casa_files";
const OTP_KEY = "casa_otp";
const SIGNIN_HISTORY_KEY = "casa_signin_history";

// Seed admin account
function seedAdmin() {
  const users = getUsers();
  if (!users.find((u) => u.email === "admin@casastudio.com")) {
    users.push({
      email: "admin@casastudio.com",
      name: "Admin",
      isAdmin: true,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function signOut() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// OTP management
export function generateOTP(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const otpData = {
    email,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  localStorage.setItem(OTP_KEY, JSON.stringify(otpData));
  return code;
}

export function isGmailAddress(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    normalized === "admin@casastudio.com" ||
    normalized.endsWith("@gmail.com") ||
    normalized.endsWith("@googlemail.com")
  );
}

export function buildGmailVerificationUrl(email: string, code: string): string {
  const subject = encodeURIComponent("Casa Studio verification code");
  const body = encodeURIComponent(
    `Hi,\n\nYour Casa Studio verification code is ${code}.\n\nEnter it in the sign-in window to continue.\n`
  );

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
}

export function buildGmailInboxUrl(): string {
  return "https://mail.google.com/mail/u/0/#inbox";
}

export function openGmailVerificationCompose(email: string, code: string): void {
  if (typeof window === "undefined") return;

  const url = buildGmailVerificationUrl(email, code);
  const popup = window.open(url, "_blank", "noopener,noreferrer");

  if (!popup) {
    window.location.href = url;
  }
}

export function openGmailInbox(): void {
  if (typeof window === "undefined") return;

  const url = buildGmailInboxUrl();
  const popup = window.open(url, "_blank", "noopener,noreferrer");

  if (!popup) {
    window.location.href = url;
  }
}

export function verifyOTP(email: string, code: string): boolean {
  try {
    const raw = localStorage.getItem(OTP_KEY);
    if (!raw) return false;
    const otpData = JSON.parse(raw);
    if (otpData.email !== email) return false;
    if (Date.now() > otpData.expiresAt) return false;
    return otpData.code === code;
  } catch {
    return false;
  }
}

export function clearOTP() {
  localStorage.removeItem(OTP_KEY);
}

function detectPlatform(userAgent: string): { platform: string; deviceType: "desktop" | "mobile" | "tablet" | "unknown" } {
  const ua = userAgent.toLowerCase();
  if (/android/.test(ua)) return { platform: "Android", deviceType: "mobile" };
  if (/iphone|ipad|ipod/.test(ua)) return { platform: /ipad/.test(ua) ? "iPad" : "iPhone", deviceType: /ipad/.test(ua) ? "tablet" : "mobile" };
  if (/macintosh|mac os x/.test(ua)) return { platform: "Mac", deviceType: "desktop" };
  if (/windows/.test(ua)) return { platform: "Windows", deviceType: "desktop" };
  if (/linux/.test(ua)) return { platform: "Linux", deviceType: "desktop" };
  return { platform: "Unknown", deviceType: "unknown" };
}

async function getClientIp(): Promise<string> {
  if (typeof window === "undefined") return "unknown";

  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (response.ok) {
      const data = (await response.json()) as { ip?: string };
      if (data.ip) return data.ip;
    }
  } catch {
    // Ignore network failure and fall back to unknown.
  }

  return "unknown";
}

export async function recordSignInActivity(user: User): Promise<void> {
  if (typeof window === "undefined") return;

  const history = getSignInHistory();
  const { platform, deviceType } = detectPlatform(window.navigator.userAgent);
  const ipAddress = await getClientIp();

  history.push({
    id: globalThis.crypto?.randomUUID?.() || `signin-${Date.now()}`,
    userEmail: user.email,
    signedInAt: new Date().toISOString(),
    platform,
    deviceType,
    ipAddress,
    userAgent: window.navigator.userAgent,
    downloadStatus: "not-downloaded",
  });

  localStorage.setItem(SIGNIN_HISTORY_KEY, JSON.stringify(history));
}

export function getSignInHistory(): SignInHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SIGNIN_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function deleteSignInHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;

  const history = getSignInHistory().filter((entry) => entry.id !== id);
  localStorage.setItem(SIGNIN_HISTORY_KEY, JSON.stringify(history));
}

export function deleteUserSignInHistory(email: string): void {
  if (typeof window === "undefined") return;

  const normalizedEmail = email.trim().toLowerCase();
  const history = getSignInHistory().filter(
    (entry) => entry.userEmail.trim().toLowerCase() !== normalizedEmail
  );
  localStorage.setItem(SIGNIN_HISTORY_KEY, JSON.stringify(history));
}

export function getUserSignInHistory(email: string): SignInHistoryEntry[] {
  return getSignInHistory()
    .filter((entry) => entry.userEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => Date.parse(b.signedInAt) - Date.parse(a.signedInAt));
}

export function markDownloadActivity(email: string, fileId?: string): void {
  if (typeof window === "undefined") return;

  const history = getSignInHistory();
  const latestIndex = history.findLastIndex(
    (entry) => entry.userEmail.toLowerCase() === email.toLowerCase()
  );

  if (latestIndex >= 0) {
    history[latestIndex] = {
      ...history[latestIndex],
      downloadStatus: "downloaded",
      lastDownloadAt: new Date().toISOString(),
      fileId: fileId || history[latestIndex].fileId,
    };
    localStorage.setItem(SIGNIN_HISTORY_KEY, JSON.stringify(history));
  }
}

export async function recordVisitorActivity(
  options: {
    userEmail?: string;
    fileId?: string;
    downloadStatus?: "not-downloaded" | "downloaded";
  } = {}
): Promise<void> {
  if (typeof window === "undefined") return;

  const history = getSignInHistory();
  const { platform, deviceType } = detectPlatform(window.navigator.userAgent);
  const ipAddress = await getClientIp();

  history.push({
    id: globalThis.crypto?.randomUUID?.() || `visitor-${Date.now()}`,
    userEmail: options.userEmail ?? "anonymous@casastudio.com",
    signedInAt: new Date().toISOString(),
    platform,
    deviceType,
    ipAddress,
    userAgent: window.navigator.userAgent,
    downloadStatus: options.downloadStatus ?? "not-downloaded",
    fileId: options.fileId,
  });

  localStorage.setItem(SIGNIN_HISTORY_KEY, JSON.stringify(history));
}

// Sign in / sign up flow
export function findOrCreateUser(email: string, name?: string): User {
  seedAdmin();
  const users = getUsers();
  let user = users.find((u) => u.email === email);
  if (!user) {
    user = {
      email,
      name: name || email.split("@")[0],
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  return user;
}

export function isExistingUser(email: string): boolean {
  seedAdmin();
  const users = getUsers();
  return users.some((u) => u.email === email);
}

// File management
export function getFiles(): DownloadFile[] {
  try {
    return JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFile(file: DownloadFile) {
  const files = getFiles();
  const idx = files.findIndex((f) => f.id === file.id);
  if (idx >= 0) {
    files[idx] = file;
  } else {
    files.push(file);
  }
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function deleteFile(id: string) {
  const files = getFiles().filter((f) => f.id !== id);
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function incrementDownload(id: string) {
  const files = getFiles();
  const file = files.find((f) => f.id === id);
  if (file) {
    file.downloadCount++;
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
  }
}

export function triggerDownload(file: DownloadFile) {
  incrementDownload(file.id);
  const currentUser = getCurrentUser();
  if (currentUser) {
    markDownloadActivity(currentUser.email, file.id);
  }

  if (typeof window === "undefined") return;

  try {
    const dataUrl = file.dataUrl;
    const link = document.createElement("a");
    const url = new URL(dataUrl);

    if (url.protocol === "data:") {
      fetch(dataUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          link.href = objectUrl;
          link.download = file.fileName;
          link.style.display = "none";
          link.setAttribute("aria-hidden", "true");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        })
        .catch(() => {
          link.href = dataUrl;
          link.download = file.fileName;
          link.style.display = "none";
          link.setAttribute("aria-hidden", "true");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      return;
    }

    link.href = dataUrl;
    link.download = file.fileName;
    link.style.display = "none";
    link.setAttribute("aria-hidden", "true");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    // Ignore browser download issues and fall back quietly.
  }
}

// Seed some demo files
export function seedDemoFiles() {
  const files = getFiles();
  if (files.length === 0) {
    const demoContent = `Casa Studio — Design Guide

Welcome to Casa Studio's Resource Library.

This PDF contains our complete design philosophy, material palette recommendations, and project checklist for modern home design.

Contents:
1. Design Philosophy
2. Material Selection Guide  
3. Color Palette Recommendations
4. Project Timeline Template
5. Budget Planning Worksheet

Thank you for choosing Casa Studio.
`;
    const encoded = btoa(unescape(encodeURIComponent(demoContent)));
    const dataUrl = `data:text/plain;base64,${encoded}`;

    saveFile({
      id: "demo-1",
      name: "Casa Studio Design Guide",
      description: "Complete design philosophy, material recommendations, and project checklist.",
      size: "2.4 MB",
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      dataUrl,
      mimeType: "text/plain",
      fileName: "casa-studio-design-guide.txt",
    });
  }
}
