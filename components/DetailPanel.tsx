"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function DetailPanel({ open, title, eyebrow, onClose, children }: { open: boolean; title: string; eyebrow: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { if (!open) return; const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [open, onClose]);
  if (!open) return null;
  return <div className="drawer-root open">
    <button className="drawer-backdrop" onClick={onClose} aria-label="Close details" />
    <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${title} details`}>
      <div className="drawer-head"><div><small>{eyebrow}</small><h2>{title}</h2></div><button onClick={onClose} className="icon-button" aria-label="Close"><X /></button></div>
      <div className="drawer-body">{children}</div>
    </aside>
  </div>;
}
