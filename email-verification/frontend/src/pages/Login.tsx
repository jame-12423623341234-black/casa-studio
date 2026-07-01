import { FormEvent, useState } from "react";
import { authApi } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const result = await authApi.login({ email, password });
      setToken(result.token);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    }
  }

  return (
    <section className="card">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Gmail address
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>
        <button type="submit">Login</button>
      </form>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      {token && (
        <div className="token-box">
          <strong>JWT Token</strong>
          <pre>{token}</pre>
        </div>
      )}
    </section>
  );
}

export default Login;
