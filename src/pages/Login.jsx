import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Field } from "../components/PortalUI";
export default function Login() {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (!sent) {
        const r = await api("/auth/request", {
          method: "POST",
          body: { email },
        });
        setSent(true);
        setMessage(r.message);
      } else {
        const user = await api("/auth/verify", {
          method: "POST",
          body: { email, code },
        });
        const next = params.get("next");
        navigate(
          next?.startsWith("/projects/")
            ? next
            : user.studio
              ? "/studio"
              : "/dashboard",
        );
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="portal portal-narrow">
      <p className="eyebrow">Your private studio space</p>
      <h1>{sent ? "Check your inbox" : "Access your projects"}</h1>
      <p className="portal-intro">
        Use the email invited by the studio or registered by the project owner.
        No password needed.
      </p>
      <form className="portal-card" onSubmit={submit}>
        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={sent}
        />
        {sent && (
          <Field
            label="Six-digit email code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        )}
        <button className="primary" disabled={busy}>
          {busy
            ? "Please wait…"
            : sent
              ? "Verify & continue"
              : "Send sign-in code"}
        </button>
        {sent && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setSent(false);
              setCode("");
            }}
          >
            Change email or request a new code
          </button>
        )}
        <p role="status">{message}</p>
      </form>
      <p>
        New customer? Open your studio invitation, verify your email, and add
        your permitted recipients.
      </p>
      <p>
        <Link to="/privacy">Privacy policy</Link> ·{" "}
        <Link to="/terms">Terms & conditions</Link>
      </p>
    </main>
  );
}
