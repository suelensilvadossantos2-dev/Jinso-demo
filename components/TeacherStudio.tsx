"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Library,
  MessageSquareText,
  PanelRightOpen,
  Plus,
  Save,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { learners } from "@/lib/data";
import { filterTeacherActivities, primarySkills, TeacherActivity, teacherActivityLibrary, teacherActivitySchema } from "@/lib/teacher-studio";

type StudioView = "ask" | "library" | "pulse";
type StudioMessage = { role: "assistant" | "user"; content: string };

const STARTERS = [
  { icon: Plus, label: "Create a learning activity", prompt: "Create an engaging 15-minute B2 speaking activity where students practice making recommendations." },
  { icon: WandSparkles, label: "Improve an existing activity", prompt: "Make this activity more interactive and include an unexpected challenge." },
  { icon: Target, label: "Plan my next class", prompt: "Based on my students' learning needs, what should I focus on in our next class?" },
];

const INSIGHT_PROMPT = "Create a 15-minute B2 speaking activity that helps my students compare alternatives and justify their recommendations.";

const pulseLearners = [
  { id: "lucia", grade: 61, status: "Needs academic support", strength: "Reading comprehension", support: "Spoken explanations and recent participation" },
  { id: "daniel", grade: 84, status: "On track", strength: "Workplace vocabulary", support: "Responding to counterarguments" },
  { id: "sofia", grade: 68, status: "Needs targeted support", strength: "Understanding task scenarios", support: "Written and spoken explanations" },
];

const reviewAlerts = [
  { id: "distress", category: "Possible distress", time: "2 days ago", summary: "A fictional learning conversation contains language suggesting that a learner may be experiencing distress.", detail: "The example includes a brief expression of feeling overwhelmed during a learning exchange. It is not a diagnosis or confirmed incident; a qualified staff member would need to review the context and decide whether any follow-up is appropriate." },
  { id: "content", category: "Inappropriate content", time: "4 days ago", summary: "A fictional conversation contains language that may fall outside the expected learning context and warrants review.", detail: "The example shows a conversation moving away from the assigned learning topic. The alert is intentionally neutral and does not classify the learner or imply harmful intent." },
];

function ActivityPreview({ activity, onSave, saved, libraryMode = false, onAdapt }: { activity: TeacherActivity | null; onSave?: () => void; saved?: boolean; libraryMode?: boolean; onAdapt?: () => void }) {
  if (!activity) return (
    <aside className="activity-preview activity-preview--empty" aria-label="Activity preview">
      <div className="preview-title"><span><FileText size={18} /></span><div><strong>Activity Preview</strong><small>Your teaching resource will appear here</small></div></div>
      <div className="preview-empty-illustration"><FileText size={28} /><i /><i /></div>
      <h2>Ready when you are</h2>
      <p>Ask Jinso to create an activity, then refine it through the conversation.</p>
    </aside>
  );

  return (
    <aside className="activity-preview" aria-label={`Preview of ${activity.title}`}>
      <div className="preview-toolbar">
        <div className="preview-title"><span><FileText size={18} /></span><div><strong>Activity Preview</strong><small>{activity.revisionNote || "Ready to use in class"}</small></div></div>
        {libraryMode && onAdapt ? <button className="studio-secondary studio-secondary--compact" onClick={onAdapt}><Sparkles size={15} /> Adapt with Ask Jinso</button> : onSave ? <button className={`save-activity ${saved ? "is-saved" : ""}`} onClick={onSave}><Save size={16} /> {saved ? "Saved" : "Save to Library"}</button> : null}
      </div>
      <div className={`preview-document ${activity.revisionNote ? "preview-document--updated" : ""}`}>
        {activity.revisionNote && <div className="updated-ribbon"><Check size={13} /> Updated · v{activity.version}</div>}
        <h2>{activity.title}</h2>
        <div className="activity-meta"><span>{activity.level}</span><span>{activity.primarySkill}</span><span><Clock3 size={14} /> {activity.duration} minutes</span></div>
        <section><small>Learning objective</small><p>{activity.objective}</p></section>
        <section><small>Teacher instructions</small><p>{activity.instructions}</p></section>
        <section><small>Activity structure</small><ol>{activity.stages.map((stage, index) => <li key={`${stage.title}-${index}`}><i>{index + 1}</i><div><strong>{stage.title}</strong><p>{stage.description}</p></div></li>)}</ol></section>
        <div className="preview-columns">
          <section><small>Learning focus</small><div className="learning-focus-tags">{activity.learningFocus.map((item) => <span key={item}>{item}</span>)}</div></section>
          <section><small>Formative assessment</small><ul>{activity.assessmentCriteria.map((item) => <li key={item}>{item}</li>)}</ul></section>
        </div>
      </div>
    </aside>
  );
}

function ClassroomPulse({ onCreate }: { onCreate: () => void }) {
  const [learnerOpen, setLearnerOpen] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState<string | null>(null);

  return <section className="pulse-workspace" aria-label="Classroom Pulse workspace">
    <div className="pulse-page-heading"><div><small>SAMPLE CLASSROOM · FICTIONAL DATA</small><h1>Classroom Pulse</h1><p>Business English — B2 · 25 learners · A concise view of strengths, learning needs, and conversations requiring human review.</p></div></div>
    <div className="pulse-metrics"><article><strong>78%</strong><span>Classroom average grade</span></article><article><strong>5</strong><span>Learners needing academic support</span></article><article><strong>2</strong><span>Conversations flagged for human review</span></article></div>
    <div className="pulse-insight-grid">
      <section className="pulse-card pulse-strength"><small>What students are doing well</small><h2>Reading and workplace vocabulary</h2><p>Students are showing stronger performance in reading comprehension and workplace vocabulary.</p></section>
      <section className="pulse-card pulse-focus"><div className="pulse-focus-title"><span><Target size={17} /></span><div><small>Suggested focus for the next class</small><h2>Compare alternatives and justify recommendations</h2></div></div><p>Several learners need more support explaining choices and comparing alternatives during speaking activities.</p><button onClick={onCreate}><Sparkles size={16} /> Create activity with Ask Jinso <ArrowRight size={16} /></button></section>
    </div>
    <div className="pulse-detail-grid">
      <section className="pulse-card pulse-learners"><div className="pulse-section-title"><div><small>Learner profiles</small><h2>Where support may help</h2></div><span>3 fictional examples</span></div><div className="pulse-learner-list">{pulseLearners.map((profile) => {
          const learner = learners.find((item) => item.id === profile.id);
          const expanded = learnerOpen === profile.id;
          return <article key={profile.id}><button onClick={() => setLearnerOpen(expanded ? null : profile.id)} aria-expanded={expanded}><i>{learner?.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i><span><strong>{learner?.name}</strong><small>{profile.status}</small></span><b>{profile.grade}%</b><ChevronDown size={17} /></button>{expanded && <div><p><strong>Strength:</strong> {profile.strength}</p><p><strong>Support:</strong> {profile.support}</p><small>Latest assessed grade shown for this fictional example.</small></div>}</article>;
        })}</div></section>
      <section className="pulse-card review-section"><div className="pulse-section-title"><div><small>Illustrative concept</small><h2>Conversations for Review</h2></div><ShieldAlert size={18} /></div><p className="concept-note">These fictional alerts demonstrate a possible human-review workflow. They are not live monitoring and require human judgment.</p>{reviewAlerts.map((alert) => {
          const expanded = alertOpen === alert.id;
          return <article key={alert.id}><div><span><AlertTriangle size={15} /></span><div><strong>{alert.category}</strong><small>{alert.time} · Needs human review</small></div></div><p>{alert.summary}</p><button onClick={() => setAlertOpen(expanded ? null : alert.id)}>{expanded ? "Hide details" : "View details"}</button>{expanded && <div className="alert-detail">{alert.detail}</div>}</article>;
        })}</section>
    </div>
    <p className="pulse-footnote">All names, grades, insights, and alerts in Classroom Pulse are fictional sample data created for this standalone demo.</p>
  </section>;
}

export function TeacherStudio() {
  const [view, setView] = useState<StudioView>("ask");
  const [activity, setActivity] = useState<TeacherActivity | null>(null);
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedActivities, setSavedActivities] = useState<TeacherActivity[]>([]);
  const [savedVersion, setSavedVersion] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState("All levels");
  const [skillFilter, setSkillFilter] = useState("All skills");
  const [libraryPreview, setLibraryPreview] = useState<TeacherActivity>(teacherActivityLibrary[0]);
  const chatScroll = useRef<HTMLDivElement>(null);

  useEffect(() => { chatScroll.current?.scrollTo({ top: chatScroll.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const allActivities = useMemo(() => [...savedActivities, ...teacherActivityLibrary], [savedActivities]);
  const filteredActivities = useMemo(() => filterTeacherActivities(allActivities, levelFilter, skillFilter), [allActivities, levelFilter, skillFilter]);

  useEffect(() => {
    if (view !== "library" || !filteredActivities.length || filteredActivities.some((item) => item.id === libraryPreview.id)) return;
    setLibraryPreview(filteredActivities[0]);
  }, [filteredActivities, libraryPreview.id, view]);

  async function sendPrompt(raw: string) {
    const prompt = raw.trim();
    if (!prompt || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content: prompt }];
    setMessages(nextMessages); setInput(""); setLoading(true); setSavedVersion(null);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: "teacher", messages: nextMessages.slice(-10), teacherStudio: { currentActivity: activity || undefined, classroomContext: prompt === INSIGHT_PROMPT ? "Fictional Classroom Pulse: learners need practice comparing alternatives and justifying recommendations." : undefined } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Jinso is unavailable right now.");
      setMessages((current) => [...current, { role: "assistant", content: data.message.content }]);
      if (data.activity) setActivity(teacherActivitySchema.parse(data.activity));
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "Jinso is unavailable right now." }]);
    } finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void sendPrompt(input); }

  function saveActivity() {
    if (!activity) return;
    const saved = { ...activity, id: `saved-${activity.id.replace(/^saved-/, "")}`, revisionNote: activity.version > 1 ? `Saved revision · v${activity.version}` : "Created with Ask Jinso" };
    setSavedActivities((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    setSavedVersion(`${activity.id}-${activity.version}`);
  }

  function adaptActivity(selected: TeacherActivity) {
    setActivity(teacherActivitySchema.parse(selected));
    setMessages([{ role: "assistant", content: `I've loaded “${selected.title}” as our working draft. Tell me what you would like to change—level, timing, interaction, challenge, or language focus.` }]);
    setSavedVersion(null); setView("ask");
  }

  function createFromInsight() {
    setView("ask"); void sendPrompt(INSIGHT_PROMPT);
  }

  return <>
    <div className="teacher-studio page-shell">
      <nav className="studio-nav" aria-label="Teacher Studio"><div><span className="studio-mark"><Sparkles size={17} /></span><div><small>Jinso</small><strong>Teacher Studio</strong></div></div><div className="studio-tabs"><button className={view === "ask" ? "active" : ""} onClick={() => setView("ask")}><MessageSquareText size={17} /> Ask Jinso</button><button className={view === "library" ? "active" : ""} onClick={() => setView("library")}><Library size={17} /> Activity Library</button><button className={view === "pulse" ? "active" : ""} onClick={() => setView("pulse")}><PanelRightOpen size={17} /> Classroom Pulse <i>5</i></button></div></nav>

      {view === "ask" ? <div className="studio-workspace">
        <section className="studio-chat-card">
          <div className="studio-chat-head"><div><span><Sparkles size={17} /></span><div><small>AI TEACHING WORKSPACE</small><h1>Ask Jinso</h1></div></div><span className="mock-pill">Interactive demo</span></div>
          <div className={`studio-chat-body ${messages.length ? "has-messages" : ""}`} ref={chatScroll} aria-live="polite">
            {messages.length === 0 ? <div className="studio-empty"><span className="studio-spark"><Sparkles size={23} /></span><h2>What would you like to create today?</h2><p>Ask Jinso to create activities, adapt materials, or help plan your next class.</p><div className="studio-starters">{STARTERS.map(({ icon: Icon, label, prompt }) => <button key={label} onClick={() => void sendPrompt(prompt)}><span><Icon size={18} /></span><div><strong>{label}</strong><small>{prompt}</small></div><ArrowRight size={17} /></button>)}</div></div> : messages.map((message, index) => <article className={`studio-message studio-message--${message.role}`} key={`${message.role}-${index}`}>{message.role === "assistant" && <span><Sparkles size={15} /></span>}<div><small>{message.role === "assistant" ? "Jinso" : "You"}</small><p>{message.content}</p></div></article>)}
            {loading && <article className="studio-message studio-message--assistant"><span><Sparkles size={15} /></span><div><small>Jinso</small><div className="typing"><i /><i /><i /></div></div></article>}
          </div>
          {activity && messages.length > 0 && <div className="refinement-chips"><span>Try a refinement</span>{["Add an unexpected objection", "Adapt it for B1 students", "Reduce it to 10 minutes"].map((label) => <button key={label} onClick={() => void sendPrompt(label)}>{label}</button>)}</div>}
          <form className="studio-composer" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Jinso anything about your teaching..." maxLength={1200} aria-label="Ask Jinso anything about your teaching" /><button aria-label="Send to Jinso" disabled={!input.trim() || loading}><Send size={18} /></button></form>
          <p className="studio-mode-note">Mock mode is active by default. Sample classroom context is fictional.</p>
        </section>
        <ActivityPreview activity={activity} onSave={saveActivity} saved={!!activity && savedVersion === `${activity.id}-${activity.version}`} />
      </div> : view === "library" ? <div className="library-workspace">
        <section className="library-main"><div className="library-heading"><div><small>TEACHING RESOURCES</small><h1>Activity Library</h1><p>Preview a ready-to-use activity or bring it into Ask Jinso to adapt it.</p></div><div className="library-filters"><select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Filter by level"><option>All levels</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select><select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} aria-label="Filter by skill"><option>All skills</option>{primarySkills.map((skill) => <option key={skill}>{skill}</option>)}</select></div></div>
          {savedActivities.length > 0 && <div className="session-library-note"><Check size={15} /> {savedActivities.length} activity {savedActivities.length === 1 ? "is" : "are"} saved in this demo session.</div>}
          <div className="activity-grid">{filteredActivities.map((item) => <article className={`activity-card ${libraryPreview.id === item.id ? "selected" : ""}`} key={item.id}><div className="activity-card-top"><span className="activity-level">{item.level}</span>{item.id.startsWith("saved-") && <span className="session-badge">Created in this session</span>}</div><h2>{item.title}</h2><p>{item.objective}</p><div className="activity-card-meta"><span>{item.primarySkill}</span><span><Clock3 size={13} /> {item.duration} min</span></div><div className="learning-focus-tags learning-focus-tags--card">{item.learningFocus.map((focus) => <span key={focus}>{focus}</span>)}</div><div className="activity-card-actions"><button onClick={() => setLibraryPreview(item)}><BookOpen size={15} /> Preview</button><button onClick={() => adaptActivity(item)}><Sparkles size={15} /> Adapt</button></div></article>)}</div>
        </section>
        <ActivityPreview activity={libraryPreview} libraryMode onAdapt={() => adaptActivity(libraryPreview)} />
      </div> : <ClassroomPulse onCreate={createFromInsight} />}
    </div>
  </>;
}

