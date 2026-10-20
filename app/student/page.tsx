"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, RotateCcw, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { Header, BookDemo } from "@/components/Header";
import { TravelChallengeChat } from "@/components/TravelChallengeChat";
import type { StudentEvaluation } from "@/lib/types";
import {
  createTravelSession,
  grammarTargets,
  openingMessage,
  personalities,
  recapGuidance,
  travelMilestones,
  type TravelPersonalityId,
  type TravelSessionState,
  vocabularyTargets,
} from "@/lib/travel-challenge";

const personalityIds: TravelPersonalityId[] = ["adventure", "food", "relaxation"];

export default function StudentPage() {
  const [screen, setScreen] = useState<"intro" | "practice" | "recap">("intro");
  const [session, setSession] = useState<TravelSessionState | null>(null);
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [grammarDone, setGrammarDone] = useState<string[]>([]);

  function startChallenge() {
    const personality = personalityIds[Math.floor(Math.random() * personalityIds.length)];
    setSession(createTravelSession(personality));
    setVocabulary([]);
    setGrammarDone([]);
    setScreen("practice");
  }

  function updateEvaluation(value: StudentEvaluation) {
    setVocabulary((current) => Array.from(new Set([...current, ...value.vocabulary])));
    setGrammarDone((current) => Array.from(new Set([...current, ...value.grammar])));
  }

  function reset() {
    setSession(null);
    setVocabulary([]);
    setGrammarDone([]);
    setScreen("intro");
  }

  if (screen === "intro") return <main className="app-page"><Header trail="Student Experience" /><section className="lesson-intro page-shell">
    <div className="lesson-kicker"><span><BookOpen size={18} /></span>B2 English</div>
    <h1>The Dream Vacation<br />Challenge</h1>
    <p className="lesson-lede">Become a travel agent and help Jinso plan the perfect getaway.</p>
    <p className="lesson-description">Jinso needs your help planning a vacation! Ask questions, discover what matters most, and recommend the perfect destination. But be ready—your customer might have a surprise for you.</p>
    <div className="lesson-meta"><span><Clock3 size={18} /> Approximately 3 minutes</span><span><Target size={18} /> One focused objective</span></div>
    <section className="goal-preview"><span><Sparkles size={20} /></span><div><small>YOUR GOAL</small><p>Discover a traveler&apos;s preferences, recommend a suitable destination, explain your choice, and adapt your recommendation when circumstances change.</p></div></section>
    <button className="primary-button" onClick={startChallenge}>Start the challenge <ArrowRight size={18} /></button>
    <p className="support-copy">Create your own responses by typing. No travel expertise required.</p>
  </section></main>;

  if (!session) return null;
  const completedSteps = session.milestones;
  const profile = personalities[session.personality];
  const guidance = recapGuidance(session, vocabulary, grammarDone);

  if (screen === "recap") return <main className="app-page"><Header trail="Lesson Recap" /><section className="recap page-shell">
    <span className="recap-badge"><Check /></span><small>CHALLENGE RECAP</small><h1>Your travel pitch, unpacked.</h1><p>You met <strong>{profile.name}</strong>{session.recommendation ? <> and recommended <strong>{session.recommendation}</strong></> : " and practiced discovering what a traveler needs"}.</p>
    <div className="recap-grid recap-grid--travel">
      <section><h3>Milestones completed</h3>{travelMilestones.map((milestone, index) => <div className={completedSteps.includes(index + 1) ? "recap-item done" : "recap-item"} key={milestone}><Check size={15} /> {milestone}</div>)}</section>
      <section><h3>Language demonstrated</h3><p><strong>{vocabulary.length}</strong> target expressions</p><div className="mini-tags">{vocabulary.length ? vocabulary.map((item) => <span key={item}>{item}</span>) : <small>No target expressions demonstrated yet</small>}</div><p className="grammar-summary"><strong>{grammarDone.length}</strong> grammar areas</p><div className="mini-tags mini-tags--blue">{grammarDone.map((item) => <span key={item}>{item}</span>)}</div></section>
    </div>
    <section className="recap-feedback recap-feedback--three"><div><small>WHAT WENT WELL</small><p>{guidance.strength}</p></div><div><small>TRY NEXT</small><p>{guidance.improvement}</p></div><div><small>A STRONGER EXAMPLE</small><p>“{guidance.example}”</p></div></section>
    <p className="evidence-note">This recap reflects only the language demonstrated in this conversation; it is not a formal CEFR evaluation or certification.</p>
    <div className="button-row"><button className="secondary-button" onClick={reset}><RotateCcw size={17} /> Try again</button><Link href="/" className="secondary-button"><ArrowLeft size={17} /> Home</Link><BookDemo compact /></div>
  </section></main>;

  return <main className="app-page student-practice"><Header trail="B2 English · The Dream Vacation Challenge" /><div className="student-layout page-shell">
    <section className="student-chat-panel"><div className="panel-heading"><div><small>TRAVEL-AGENT ROLE-PLAY</small><h1>The Dream Vacation Challenge</h1></div><button className="finish-button" onClick={() => setScreen("recap")}>Finish lesson</button></div>
      <TravelChallengeChat initial={[{ role: "assistant", content: openingMessage }]} session={session} onEvaluation={updateEvaluation} onStateChange={setSession} />
    </section>
    <aside className="student-sidebar">
      <section className="side-card side-card--goal"><h3><Target size={19} /> Your goal</h3><p>Discover a traveler&apos;s preferences, recommend a destination, and explain why it&apos;s the right choice—even when plans change.</p></section>
      <section className="side-card"><h3><BookOpen size={19} /> Try these words</h3><div className="word-cloud">{vocabularyTargets.map((word) => { const done = vocabulary.includes(word); return <span className={done ? "used" : ""} key={word}>{word}{done && <Check size={13} />}</span>; })}</div></section>
      <section className="side-card"><h3><Sparkles size={19} /> Grammar focus</h3>{grammarTargets.map((item) => <div className={`check-line ${grammarDone.includes(item) ? "done" : ""}`} key={item}><span>{grammarDone.includes(item) && <Check size={13} />}</span>{item}</div>)}</section>
      <section className="side-card"><div className="side-card-title"><h3>Lesson progress</h3><small>{completedSteps.length} of 4</small></div><div className="segments">{travelMilestones.map((_, index) => <span className={completedSteps.includes(index + 1) ? "done" : ""} key={index} />)}</div>{travelMilestones.map((item, index) => <div className={`check-line ${completedSteps.includes(index + 1) ? "done" : ""}`} key={item}><span>{completedSteps.includes(index + 1) && <Check size={13} />}</span>{index + 1}. {item}</div>)}</section>
    </aside>
  </div></main>;
}
