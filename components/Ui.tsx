"use client";

import { ReactNode } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function MetricCard({ icon, value, label, tone = "blue" }: { icon: ReactNode; value: string; label: string; tone?: "blue" | "gold" | "red" }) {
  return <div className="metric-card"><span className={`metric-icon metric-icon--${tone}`}>{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>;
}

export function InsightCard({ title = "What Jinso noticed", children }: { title?: string; children: ReactNode }) {
  return <section className="insight-card"><span className="insight-icon"><Sparkles size={20} /></span><div><h3>{title}</h3><p>{children}</p></div></section>;
}

export function SkillBars({ values, compact = false }: { values: Record<string, number>; compact?: boolean }) {
  return <div className={`skill-bars ${compact ? "skill-bars--compact" : ""}`}>{Object.entries(values).map(([name, value]) => <div className="skill-row" key={name}><div className="skill-label"><span>{name}</span><strong>{value}%</strong></div><div className="bar-track"><span style={{ width: `${value}%` }} /></div></div>)}</div>;
}

export function SuggestedPrompts({ prompts, onSelect }: { prompts: string[]; onSelect: (prompt: string) => void }) {
  return <div className="suggestions">{prompts.map((p) => <button key={p} onClick={() => onSelect(p)} className="suggestion focus-ring"><span>{p}</span><ArrowRight size={16} /></button>)}</div>;
}

export function DemoNotice() {
  return <span className="demo-notice">Illustrative demo data</span>;
}
