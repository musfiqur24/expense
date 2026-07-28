import React from "react";
import { ArrowRight, ChartNoAxesCombined, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

export function LoginPage() {
  function startGoogleLogin() {
    window.location.assign("/api/auth/google");
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand brand">
          <span className="brand__mark"><WalletCards size={22} /></span>
          <span>Northstar</span>
        </div>
        <div className="login-panel__copy">
          <span className="login-kicker">A calmer way to manage money</span>
          <h1>Know where your money is going.</h1>
          <p>Track everyday income, spending, and monthly budgets in one clear, private space.</p>
        </div>
        <button className="google-button" type="button" onClick={startGoogleLogin}>
          <span className="google-button__mark" aria-hidden="true">G</span>
          Continue with Google
          <ArrowRight size={18} />
        </button>
        <p className="login-privacy"><LockKeyhole size={15} /> We only use Google to securely sign you in.</p>
      </section>

      <aside className="login-showcase" aria-label="Northstar features">
        <div className="login-showcase__orb login-showcase__orb--one" />
        <div className="login-showcase__orb login-showcase__orb--two" />
        <div className="showcase-card showcase-card--balance">
          <span>Available this month</span>
          <strong>$2,840</strong>
          <small><i /> Up 12% from last month</small>
        </div>
        <div className="showcase-card showcase-card--chart">
          <div className="showcase-card__title"><ChartNoAxesCombined size={18} /><span>Spending trend</span></div>
          <div className="mini-bars" aria-hidden="true">
            <i style={{ height: "32%" }} /><i style={{ height: "50%" }} /><i style={{ height: "38%" }} /><i style={{ height: "68%" }} /><i style={{ height: "48%" }} /><i style={{ height: "78%" }} /><i style={{ height: "58%" }} />
          </div>
        </div>
        <div className="showcase-card showcase-card--budget">
          <div><span className="showcase-icon"><ShieldCheck size={18} /></span><strong>Food budget</strong></div>
          <p><span /><small>68% used</small></p>
        </div>
        <p className="login-showcase__note">Built for steady progress, not spreadsheet stress.</p>
      </aside>
    </main>
  );
}
