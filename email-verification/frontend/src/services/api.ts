const BASE_URL = "http://localhost:4000/api/auth";

async function request(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Server error");
  }

  return payload;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) => request("register", data),
  verify: (data: { email: string; code: string }) => request("verify", data),
  login: (data: { email: string; password: string }) => request("login", data),
  resendVerification: (data: { email: string }) => request("resend-verification", data),
};
