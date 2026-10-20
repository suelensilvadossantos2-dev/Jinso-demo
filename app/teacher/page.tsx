"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, ChevronRight, MessageCircle, MoreHorizontal, Sparkles, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { DetailPanel } from "@/components/DetailPanel";
import { DemoNotice, InsightCard, MetricCard, SkillBars, SuggestedPrompts } from "@/components/Ui";
import { Learner, learners, teacherSkills } from "@/lib/data";

const prompts = ["Which students need my attention?", "What is my class struggling with?", "Why should I check on Lucia?", "What activity should I plan next?"];

export default function TeacherPage() {
  const [selected, setSelected] = useState<Learner | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [prompt, setPrompt] = useState<string | null>(null);
  const visible = useMemo(() => learners.slice(0, 8), []);
  function openLearner(id: string) { const learner = learners.find((item) => item.id === id); if (learner) setSelected(learner); }
  return <main className="app-page"><Header trail="Teacher Experience · Business English — B2" /><div className={`dashboard-shell page-shell ${chatOpen ? "with-chat" : ""}`}>
    <div className="dashboard-main">
      <div className="dashboard-title-row"><div><div className="eyebrow-row"><DemoNotice /><span>Current course</span></div><h1>Business English — B2</h1><p>25 learners · Mar 4 – Apr 3</p></div><button className="ask-toggle" onClick={() => setChatOpen((value) => !value)}><MessageCircle size={18} /> {chatOpen ? "Hide Ask Jinso" : "Ask Jinso"}</button></div>
      <div className="teacher-summary"><div className="metrics-grid metrics-grid--teacher"><MetricCard icon={<Users />} value="25" label="Enrolled learners" /><MetricCard icon={<BarChart3 />} value="76%" label="Active this week" /><MetricCard tone="red" icon={<AlertTriangle />} value="5" label="Need attention" /></div><InsightCard>Speaking is the lowest illustrative skill indicator in this class, and five learners show engagement or performance signals worth reviewing.</InsightCard></div>
      <div className="dashboard-grid"><section className="data-card"><div className="card-title"><div><h2>Learning progress by skill</h2><p>Illustrative average class performance indicators</p></div></div><SkillBars values={teacherSkills} /></section>
        <section className="data-card learner-card"><div className="card-title"><div><h2>Learners</h2><p>Select a learner for recent evidence and next steps</p></div><span>Showing 8 of 25</span></div><div className="table-list table-head"><span>LEARNER</span><span>PROGRESS</span><span>STATUS</span><span /></div>{visible.map((learner) => <button className="table-row" key={learner.id} onClick={() => setSelected(learner)}><span className="learner-name"><i>{learner.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i>{learner.name}</span><span className="mini-progress"><i><b style={{ width: `${learner.progress}%` }} /></i>{learner.progress}%</span><span className={`status status--${learner.status === "On track" ? "good" : "alert"}`}>{learner.status}</span><MoreHorizontal size={18} /></button>)}</section>
      </div>
    </div>
    <aside className={`ask-panel ${chatOpen ? "open" : ""}`}><div className="ask-panel-head"><span><Sparkles /></span><div><h2>Ask Jinso</h2><p>Explore this fictional class and ideas for what to do next.</p></div></div><SuggestedPrompts prompts={prompts} onSelect={setPrompt} /><Chat compact context="teacher" placeholder="Ask about your class…" externalPrompt={prompt} onPromptConsumed={() => setPrompt(null)} onLearnerRef={openLearner} initial={[{ role: "assistant", content: "I’m ready to help you interpret this illustrative B2 classroom. Choose a question or ask your own." }]} /></aside>
    <DetailPanel open={!!selected} onClose={() => setSelected(null)} eyebrow="ILLUSTRATIVE LEARNER PROFILE" title={selected?.name || "Learner"}>{selected && <><div className="drawer-status"><span className={`status status--${selected.status === "On track" ? "good" : "alert"}`}>{selected.status}</span><span>{selected.active}</span></div><section className="drawer-section"><h3>Skill profile</h3><SkillBars compact values={selected.skills} /></section><section className="drawer-section"><h3>What Jinso noticed</h3><p>{selected.observation}</p></section><section className="drawer-section drawer-section--action"><h3>Suggested next teaching action</h3><p>{selected.action}</p></section><p className="drawer-footnote">This profile uses fictional information created for the Jinso Live demo.</p></>}</DetailPanel>
  </div></main>;
}
