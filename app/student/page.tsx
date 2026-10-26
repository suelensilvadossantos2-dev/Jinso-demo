"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Headphones, Mic, MicOff, Phone, PhoneOff, Plane, RotateCcw, Sparkles, Target, Volume2, VolumeX } from "lucide-react";
import { BookDemo, Header } from "@/components/Header";
import { StudentCallOrb } from "@/components/StudentCallOrb";
import { StudentLessonSidebar } from "@/components/StudentLessonSidebar";
import { createMockStudentVoiceCallService, formatCallDuration, type VoiceCallActivity } from "@/lib/student-voice-call";
import type { StudentEvaluation } from "@/lib/types";
import { createTravelSession, grammarTargets, openingMessage, personalities, recapGuidance, replyTravelChallenge, type TravelPersonalityId, type TravelSessionState, vocabularyTargets } from "@/lib/travel-challenge";

type CallScreen = "intro" | "incoming" | "active" | "completed" | "recap";
const personalityIds: TravelPersonalityId[] = ["adventure", "food", "relaxation"];

export default function StudentPage() {
  const [screen, setScreen] = useState<CallScreen>("intro");
  const [session, setSession] = useState<TravelSessionState | null>(null);
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [grammar, setGrammar] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [activity, setActivity] = useState<VoiceCallActivity>("idle");
  const [showDevHarness, setShowDevHarness] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testResponse, setTestResponse] = useState(openingMessage);
  const [testPending, setTestPending] = useState(false);
  const [testError, setTestError] = useState("");
  const callService = useRef(createMockStudentVoiceCallService());

  useEffect(() => { setShowDevHarness(new URLSearchParams(window.location.search).get("callTest") === "1"); }, []);

  useEffect(() => {
    if (screen !== "active") return;
    const startedAt = callService.current.getSnapshot().startedAt ?? Date.now();
    const update = () => setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "active" || activity !== "speaking") return;
    const timer = window.setTimeout(() => { callService.current.setActivity("listening"); setActivity("listening"); }, 1800);
    return () => window.clearTimeout(timer);
  }, [screen, activity]);

  const activeSession = session ?? createTravelSession("adventure");

  function pickUp() {
    const personality = personalityIds[Math.floor(Math.random() * personalityIds.length)];
    setSession(createTravelSession(personality));
    setVocabulary([]); setGrammar([]); setSeconds(0); setMuted(false); setSpeakerEnabled(true);
    setTestInput(""); setTestResponse(openingMessage); setTestError("");
    callService.current = createMockStudentVoiceCallService();
    const snapshot = callService.current.start();
    setActivity(snapshot.activity);
    setScreen("active");
  }

  function finishCall() { callService.current.end(); setActivity("idle"); setScreen("completed"); }

  function reset() {
    callService.current = createMockStudentVoiceCallService();
    setSession(null); setVocabulary([]); setGrammar([]); setSeconds(0); setMuted(false); setSpeakerEnabled(true); setActivity("idle"); setScreen("intro");
  }

  function toggleMute() { const next = !muted; setMuted(next); callService.current.setMuted(next); }
  function toggleSpeaker() { const next = !speakerEnabled; setSpeakerEnabled(next); callService.current.setSpeakerEnabled(next); }
  function updateEvaluation(value: StudentEvaluation) {
    setVocabulary((current) => Array.from(new Set([...current, ...value.vocabulary])));
    setGrammar((current) => Array.from(new Set([...current, ...value.grammar])));
  }

  function sendDeveloperTurn(event: React.FormEvent) {
    event.preventDefault();
    const prompt = testInput.trim();
    if (!prompt || !session || testPending) return;
    setTestInput(""); setTestPending(true); setTestError(""); setActivity("thinking"); callService.current.setActivity("thinking");
    window.setTimeout(() => {
      const result = replyTravelChallenge(prompt, session);
      setTestResponse(result.content); setSession(result.state); updateEvaluation(result.evaluation);
      setActivity("speaking"); callService.current.setActivity("speaking");
      setTestPending(false);
      if (result.state.stage === "complete") window.setTimeout(finishCall, 1100);
    }, 260);
  }

  if (screen === "intro") return <StudentIntroduction onStart={() => setScreen("incoming")} />;
  if (screen === "recap" && session) return <StudentRecap session={session} vocabulary={vocabulary} grammar={grammar} onReset={reset} />;

  return <main className="app-page student-call-page">
    <Header trail="Student Experience · The Dream Vacation Challenge" />
    <div className="student-call-layout page-shell">
      <section className="student-call-panel">
        <LessonHeading />
        {screen === "incoming" && <IncomingCall onPickUp={pickUp} />}
        {screen === "active" && <ActiveCall activity={activity} seconds={seconds} muted={muted} speakerEnabled={speakerEnabled} onMute={toggleMute} onSpeaker={toggleSpeaker} onEnd={finishCall} />}
        {screen === "completed" && <CompletedCall onContinue={() => setScreen("recap")} />}
        {showDevHarness && screen === "active" && <form className="student-dev-harness" onSubmit={sendDeveloperTurn}>
          <div><strong>Internal conversation tester</strong><span>Hidden unless <code>?callTest=1</code> is present. No microphone or live audio is connected.</span></div>
          <p><strong>Jinso:</strong> {testResponse}</p>
          <label htmlFor="call-test-input">Simulated learner turn</label>
          <div><input id="call-test-input" value={testInput} onChange={(event) => setTestInput(event.target.value)} placeholder="Type a test response…" maxLength={1200} /><button disabled={testPending || !testInput.trim()}>{testPending ? "Testing…" : "Send"}</button></div>
          {testError && <small role="alert">{testError}</small>}
        </form>}
      </section>
      <StudentLessonSidebar vocabulary={vocabulary} grammar={grammar} milestones={activeSession.milestones} />
    </div>
  </main>;
}

function StudentIntroduction({ onStart }: { onStart: () => void }) {
  return <main className="app-page"><Header trail="Student Experience" /><section className="lesson-intro page-shell">
    <div className="lesson-kicker"><span><BookOpen size={18} /></span>B2 English</div>
    <h1>The Dream Vacation<br />Challenge</h1>
    <p className="lesson-lede">Become a travel agent and help Jinso plan the perfect getaway.</p>
    <p className="lesson-description">You&apos;re about to take part in a live phone-call role-play with Jinso, who will play a customer planning a vacation. Ask questions, discover their preferences, recommend a destination, and be ready for an unexpected change of plans.</p>
    <div className="lesson-meta"><span><Clock3 size={18} /> Approximately 3 minutes</span><span><Target size={18} /> One focused objective</span></div>
    <section className="goal-preview"><span><Sparkles size={20} /></span><div><small>YOUR GOAL</small><p>Discover a traveler&apos;s preferences, recommend a suitable destination, explain your choice, and adapt your recommendation when circumstances change.</p></div></section>
    <button className="primary-button" onClick={onStart}>Start the challenge <ArrowRight size={18} /></button>
  </section></main>;
}

function LessonHeading() {
  return <header className="student-lesson-heading"><span className="student-plane-icon"><Plane size={28} fill="currentColor" /></span><div><h1>The Dream Vacation Challenge</h1><p>You&apos;re a travel agent. Help Jinso plan the perfect getaway.</p><div className="lesson-badges"><span>B2 English</span><span><Clock3 size={16} /> ~ 3 minutes</span></div></div></header>;
}

function IncomingCall({ onPickUp }: { onPickUp: () => void }) {
  return <div className="call-state call-state--incoming"><div className="incoming-call-label"><span><Phone size={23} /></span><div><strong>Client is calling</strong><small>Travel agency role-play</small></div></div><StudentCallOrb phase="incoming" /><button className="call-primary-action" onClick={onPickUp}><Phone size={25} fill="currentColor" /> Pick up</button><p className="call-helper">Start the role-play call with Jinso.</p></div>;
}

function ActiveCall({ activity, seconds, muted, speakerEnabled, onMute, onSpeaker, onEnd }: { activity: VoiceCallActivity; seconds: number; muted: boolean; speakerEnabled: boolean; onMute: () => void; onSpeaker: () => void; onEnd: () => void }) {
  return <div className="call-state call-state--active"><StudentCallOrb phase="active" activity={activity} /><div className="caller-label"><strong>Jinso</strong><span>Your travel client</span></div><div className="call-status"><span><i /> On call</span><time>{formatCallDuration(seconds)}</time></div><p className="mock-call-note"><Headphones size={14} /> Demo simulation · no live audio connected</p><div className="call-controls" aria-label="Call controls"><button className={muted ? "active" : ""} onClick={onMute} aria-pressed={muted}>{muted ? <MicOff /> : <Mic />}<span>{muted ? "Unmute" : "Mute"}</span></button><button className="end-call-control" onClick={onEnd}><span><PhoneOff size={30} fill="currentColor" /></span><b>End Call</b></button><button className={!speakerEnabled ? "active" : ""} onClick={onSpeaker} aria-pressed={!speakerEnabled}>{speakerEnabled ? <Volume2 /> : <VolumeX />}<span>Speaker</span></button></div></div>;
}

function CompletedCall({ onContinue }: { onContinue: () => void }) {
  return <div className="call-state call-state--completed"><StudentCallOrb phase="completed" /><h2>Call completed!</h2><p>Your travel conversation has ended.</p><button className="call-primary-action" onClick={onContinue}>Continue <ArrowRight size={23} /></button></div>;
}

function StudentRecap({ session, vocabulary, grammar, onReset }: { session: TravelSessionState; vocabulary: string[]; grammar: string[]; onReset: () => void }) {
  const profile = personalities[session.personality];
  const guidance = recapGuidance(session, vocabulary, grammar);
  const nextPractice = useMemo(() => !session.milestones.includes(2) ? "Practice making one specific destination recommendation and linking it to a customer preference." : !session.milestones.includes(3) ? "Practice adapting a recommendation after a customer introduces a new constraint." : "Practice stating one trade-off before confidently finalizing your recommendation.", [session]);
  return <main className="app-page student-recap-page"><Header trail="Student Experience · Learning Recap" /><section className="student-recap page-shell"><span className="recap-badge"><Check size={34} /></span><small>PERSONALIZED LEARNING RECAP</small><h1>Your travel call, unpacked.</h1><p>This summary reflects only what was demonstrated in this practice conversation.</p>
    <div className="student-recap-context"><div><span>Customer personality</span><strong>{profile.name}</strong><small>{profile.character}</small></div><div><span>Destination discussed</span><strong>{session.recommendation || "No destination finalized"}</strong><small>{session.recommendation ? "Captured from your recommendation" : "Try again to practice a complete recommendation"}</small></div></div>
    <div className="student-recap-feedback"><article><span>What went well</span><h2>Your strength</h2><p>{guidance.strength}</p></article><article><span>One improvement</span><h2>Try this next</h2><p>{guidance.improvement}</p></article><article><span>Useful language</span><h2>A stronger example</h2><p>“{guidance.example}”</p></article></div>
    <section className="language-evidence"><div><h2>Language demonstrated</h2><p>Only phrases and grammar detected in this conversation are marked as demonstrated.</p></div><div className="evidence-columns"><div><h3>Vocabulary</h3>{vocabularyTargets.map((item) => <EvidenceTag key={item} label={item} demonstrated={vocabulary.includes(item)} />)}</div><div><h3>Grammar</h3>{grammarTargets.map((item) => <EvidenceTag key={item} label={item} demonstrated={grammar.includes(item)} />)}</div></div></section>
    <section className="next-practice"><Plane size={23} /><div><small>NEXT PRACTICE SUGGESTION</small><p>{nextPractice}</p></div></section><p className="evidence-note">This practice recap is not a formal CEFR evaluation, score, or certification.</p><div className="button-row"><button className="secondary-button" onClick={onReset}><RotateCcw size={17} /> Try Again</button><Link href="/" className="secondary-button"><ArrowLeft size={17} /> Home</Link><BookDemo compact /></div></section></main>;
}

function EvidenceTag({ label, demonstrated }: { label: string; demonstrated: boolean }) {
  return <span className={`evidence-tag ${demonstrated ? "demonstrated" : ""}`}>{demonstrated && <Check size={13} />}{label}<small>{demonstrated ? "Demonstrated" : "Not yet demonstrated"}</small></span>;
}
