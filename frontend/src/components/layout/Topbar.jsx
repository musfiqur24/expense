import React from "react";
import { CalendarDays, Plus, WalletCards } from "lucide-react";
import { initials } from "../../utils/format";
import { Button } from "../ui/Button";

function profileName(user = {}) {
  return user.name || user.displayName || user.email?.split("@")[0] || "Your account";
}

export function Topbar({ user, month, onMonthChange, onAddTransaction }) {
  const name = profileName(user);
  const image = user.avatarUrl || user.picture || user.avatar || user.photoURL;

  return (
    <header className="topbar">
      <div className="topbar__mobile-brand brand">
        <span className="brand__mark"><WalletCards size={19} /></span>
        <span>Budget Buddy</span>
      </div>

      <label className="month-picker" aria-label="Select reporting month">
        <CalendarDays size={17} />
        <input type="month" value={month} onChange={(event) => onMonthChange(event.target.value)} />
      </label>

      <div className="topbar__actions">
        <Button className="topbar__add" onClick={onAddTransaction}>
          <Plus size={18} />
          <span>Add transaction</span>
        </Button>
        <div className="profile" title={name}>
          {image ? <img src={image} alt="" /> : <span>{initials(name)}</span>}
          <div className="profile__copy">
            <strong>{name}</strong>
            <small>{user.email || "Personal account"}</small>
          </div>
        </div>
      </div>
    </header>
  );
}
