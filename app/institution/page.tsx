"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronRight, GraduationCap, Sparkles, Target, TrendingUp, X } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { DetailPanel } from "@/components/DetailPanel";
import {
  b2InstitutionalOutcomes,
  courses,
  deriveInstitutionMetrics,
  institutionInsight,
  institutionPeriods,
  type AcademicOutcome,
  type Course,
} from "@/lib/data";
import { DemoNotice, InsightCard, MetricCard, SuggestedPrompts } from "@/components/Ui";

const prompts = [
  "Which institutional learning outcomes are students struggling to achieve?",
  "Are our B2 learners meeting our curriculum standards?",
  "Which courses show the strongest improvement against their learning targets?",
  "What assessment evidence supports these conclusions?",
];

export default function InstitutionPage() {
  const [period, setPeriod] = useState<keyof typeof institutionPeriods>("Term");
  const [selected, setSelected] = useState<Course | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const periodData = institutionPeriods[period];
  const metrics = deriveInstitutionMetrics(periodData);

  useEffect(() => {
    if (!chatOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setChatOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [chatOpen]);

  return <main className="app-page institution-page"><Header trail="Institutional Leader Experience · Americas Language Center" /><div className="institution-dashboard-shell page-shell">
    <div className="dashboard-main">
      <div className="dashboard-title-row institution-title-row"><div><div className="eyebrow-row"><DemoNotice /><span>1,250 learners · 48 classes · 12 courses · A1–C1</span></div><h1>Americas Language Center</h1><p>Institutional outcomes and standards attainment</p></div><div className="title-actions"><div className="period-control" aria-label="Reporting period">{(["Month", "Term", "Year"] as const).map((value) => <button className={period === value ? "active" : ""} onClick={() => setPeriod(value)} aria-pressed={period === value} key={value}>{value}</button>)}</div></div></div>

      <div className="metrics-grid">
        <MetricCard icon={<Target />} value={`${metrics.learnerAttainment}%`} label="Learners meeting expected outcomes" tooltip={`${periodData.learnersMeetingOutcomes} of ${periodData.assessedLearners} assessed learners met the institution's applicable outcome criteria in this ${period.toLowerCase()} view.`} />
        <MetricCard icon={<TrendingUp />} value={`+${metrics.improvement} pp`} label="Improvement from baseline" tooltip={`Percentage-point change from the comparable ${period.toLowerCase()} baseline (${periodData.baselineAttainment}%) to the current attainment rate (${metrics.learnerAttainment}%).`} />
        <MetricCard tone="red" icon={<AlertTriangle />} value={`${metrics.learnersForReview}`} label="Learners requiring academic review" tooltip="Assessed learners below at least one applicable institutional benchmark; this does not mean they missed every outcome." />
        <MetricCard tone="gold" icon={<GraduationCap />} value={`${metrics.standardsMeetingTarget}%`} label="Assessed outcome measures meeting target" tooltip={`${periodData.outcomeMeasuresMeetingTarget} of ${periodData.applicableOutcomeMeasures} applicable institutional outcome measures meet or exceed their course-specific targets.`} />
      </div>

      <InsightCard>{institutionInsight}</InsightCard>

      <div className="dashboard-grid institution-charts">
        <section className="data-card outcome-card"><div className="card-title"><div><h2>Learning Outcomes by Institutional Standard</h2><p>B2 Academic English · Institutional criteria aligned with CEFR competencies</p></div></div><OutcomeBars outcomes={b2InstitutionalOutcomes} /></section>
        <section className="data-card"><div className="card-title"><div><h2>Learning Outcome Attainment Over Time</h2><p>{period} view · comparable rubric checkpoints · current n={periodData.assessedLearners}</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={periodData.trend} margin={{ top: 18, right: 18, left: -12, bottom: 0 }}><CartesianGrid stroke="#e8f0f8" vertical={false}/><XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={12}/><YAxis domain={[50, 90]} axisLine={false} tickLine={false} unit="%" fontSize={12}/><Tooltip formatter={(value) => [`${value}%`, "Learners meeting criteria"]} labelFormatter={(label) => `${label} assessment`} contentStyle={{ borderRadius: 12, border: "1px solid #e1ebf6" }}/><ReferenceLine y={periodData.benchmark} stroke="#f0b429" strokeDasharray="5 5" label={{ value: `Institutional benchmark ${periodData.benchmark}%`, position: "insideTopRight", fill: "#8a6716", fontSize: 11 }}/><Line type="monotone" dataKey="attainment" name="Meeting outcome criteria" stroke="#4b91e7" strokeWidth={3} dot={{ r: 4, fill: "#4b91e7", strokeWidth: 0 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div><p className="chart-definition">Rates show assessed learners meeting applicable institutional rubric thresholds at comparable checkpoints. They are not CEFR scores and do not establish causation.</p></section>
      </div>

      <section className="data-card course-card"><div className="card-title"><div><h2>Course outcomes against institutional targets</h2><p>Each course is evaluated against its own curriculum outcomes and benchmarks</p></div><span>Featured 5 of 12</span></div><div className="course-head outcome-course-grid"><span>COURSE</span><span>CEFR</span><span>ASSESSED</span><span>OUTCOMES AT TARGET</span><span>ACADEMIC STATUS</span><span /></div>{courses.map((course) => <button className="course-row outcome-course-grid" key={course.id} onClick={() => setSelected(course)}><span>{course.name}</span><span>{course.level}</span><span>{course.assessedLearners}</span><span className="mini-progress"><i><b style={{ width: `${(course.outcomesMeetingTarget / course.totalOutcomes) * 100}%` }} /></i>{course.outcomesMeetingTarget}/{course.totalOutcomes}</span><span className={`status status--${statusTone(course)}`}>{course.status}</span><ChevronRight size={17} /></button>)}</section>
    </div>
  </div>

  {!chatOpen && <button className="institution-ask-launcher" onClick={() => setChatOpen(true)} aria-expanded={false} aria-controls="institution-ask-drawer"><span><Sparkles size={19} /></span><strong>Ask Jinso</strong></button>}

  <div className={`institution-ai-root ${chatOpen ? "open" : ""}`} aria-hidden={!chatOpen}>
    <button className="institution-ai-backdrop" onClick={() => setChatOpen(false)} aria-label="Close Ask Jinso" tabIndex={chatOpen ? 0 : -1} />
    <aside id="institution-ask-drawer" className="institution-ai-drawer" role="dialog" aria-modal="true" aria-label="Ask Jinso institutional assistant">
      <div className="institution-ai-head"><div className="ask-panel-head"><span><Sparkles /></span><div><h2>Ask Jinso</h2><p>Explore course performance and academic priorities</p></div></div><button className="icon-button" onClick={() => setChatOpen(false)} aria-label="Close Ask Jinso" tabIndex={chatOpen ? 0 : -1}><X size={19} /></button></div>
      <div className="institution-ai-body"><SuggestedPrompts prompts={prompts} onSelect={setPrompt} /><Chat compact context="institution" placeholder="Ask about institutional outcomes…" externalPrompt={prompt} onPromptConsumed={() => setPrompt(null)} initial={[{ role: "assistant", content: "Ask me about institutional benchmarks, CEFR-aligned mappings, assessment evidence, or academic priorities in this illustrative dataset." }]} /></div>
    </aside>
  </div>

  <CourseOutcomePanel course={selected} onClose={() => setSelected(null)} />
  </main>;
}

function OutcomeBars({ outcomes }: { outcomes: AcademicOutcome[] }) {
  return <div className="outcome-bars">{outcomes.map((outcome) => {
    const gap = outcome.attainment - outcome.benchmark;
    return <div className={`outcome-row ${gap < 0 ? "outcome-row--attention" : ""}`} key={outcome.id}><div className="outcome-label"><span><strong>{outcome.shortLabel}</strong><small>{outcome.title}</small></span><b>{outcome.attainment}%</b></div><div className="outcome-track"><span style={{ width: `${outcome.attainment}%` }} /><i style={{ left: `${outcome.benchmark}%` }} title={`Institutional target ${outcome.benchmark}%`} /></div><div className="outcome-meta"><span>{outcome.learnersMeetingCriteria ? `${outcome.learnersMeetingCriteria} of ${outcome.assessedLearners} learners` : `n=${outcome.assessedLearners}`} · {outcome.attainment}% meeting criteria</span><span>Target {outcome.benchmark}% · Gap {gap >= 0 ? "+" : "−"}{Math.abs(gap)} pp</span></div></div>;
  })}</div>;
}

function CourseOutcomePanel({ course, onClose }: { course: Course | null; onClose: () => void }) {
  return <DetailPanel open={!!course} onClose={onClose} eyebrow="ILLUSTRATIVE COURSE OUTCOMES" title={course ? `${course.level} ${course.name}` : "Course"}>{course && <>
    <div className="drawer-facts drawer-facts--outcomes"><div><strong>{course.assessedLearners}</strong><span>Learners assessed</span></div><div><strong>{course.outcomesMeetingTarget}/{course.totalOutcomes}</strong><span>Outcomes at target</span></div><div><strong>{course.aggregateAttainment}%</strong><span>Aggregate attainment</span></div><div><strong>+{course.improvement} pp</strong><span>From baseline</span></div></div>
    <section className="drawer-section"><h3>Institutional curriculum objective</h3><p>{course.curriculumObjective}</p></section>
    <section className="drawer-section"><h3>Learning outcomes and standards evidence</h3><div className="drawer-outcomes">{course.outcomes.map((outcome) => <article key={outcome.id}><div><strong>{outcome.title}</strong><span className={outcome.attainment >= outcome.benchmark ? "meets" : "below"}>{outcome.attainment}% / target {outcome.benchmark}%</span></div><small>{outcome.cefrMapping}</small><p><b>Assessment criteria:</b> {outcome.assessmentCriteria}</p><p><b>{outcome.evidence.type}:</b> {outcome.evidence.description}</p><em>{outcome.evidence.source}</em></article>)}</div></section>
    <section className="drawer-section"><h3>Identified learning gaps</h3><ul className="academic-list">{course.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></section>
    <section className="drawer-section drawer-section--action"><h3>Suggested academic priority</h3><p>{course.academicPriority}</p></section>
    <p className="drawer-footnote">Illustrative data only. CEFR mappings are paraphrased contextual references, not official descriptor codes or certification. Practice signals and AI-assisted observations are supporting context; attainment percentages shown here come from the identified assessed evidence.</p>
  </>}</DetailPanel>;
}

function statusTone(course: Course) {
  if (course.status === "Meeting expectations") return "good";
  if (course.status === "Monitor") return "monitor";
  return "alert";
}
