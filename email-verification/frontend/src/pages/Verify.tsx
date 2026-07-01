import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authApi } from "../services/api";

function Verify() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const result = await authApi.verify({ email, code });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    }
  }

  async function handleResend() {
    setMessage(null);
    setError(null);

    try {
      const result = await authApi.resendVerification({ email });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend code.");
    }
  }

  return (
    <section className="card">
      <h2>Verify your email</h2>
      <form onSubmit={handleVerify}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>

        <label>
          Verification code
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
        </label>

        <button type="submit">Verify account</button>
      </form>

      <button className="link-button" onClick={handleResend}>Resend code</button>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
    </section>
  );
}

export default Verify;
