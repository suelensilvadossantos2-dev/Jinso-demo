import { MicOff } from "lucide-react";
import { Header } from "@/components/Header";
import { Orb } from "@/components/Orb";
import { Chat } from "@/components/Chat";

const prompts = [
  "How could Jinso support a learner?",
  "How could Jinso help my classroom?",
  "What can leaders learn from Jinso?",
  "I want to explore a use case.",
];

export default function AskJinsoPage() {
  return <main className="ask-anything-page">
    <Header trail="Ask Jinso Anything" />
    <section className="ask-immersive page-shell">
      <div className="orb-atmosphere" aria-hidden="true">
        <svg className="ambient-wave ambient-wave--back" viewBox="0 0 1600 280" preserveAspectRatio="none">
          <path d="M0 150 C130 55 235 235 360 145 S585 60 720 148 S950 235 1090 145 S1350 45 1600 150" />
        </svg>
        <svg className="ambient-wave ambient-wave--front" viewBox="0 0 1600 280" preserveAspectRatio="none">
          <path d="M0 152 C120 242 260 65 390 154 S620 235 785 150 S1010 62 1165 151 S1410 235 1600 145" />
        </svg>
        <div className="wave-ticks">{Array.from({ length: 44 }, (_, index) => <i key={index} />)}</div>
      </div>

      <div className="ask-orb-wrap"><Orb state="idle" size="large" /></div>
      <span className="orb-caption"><i /> Ready when you are</span>
      <h1>Ask Jinso anything.</h1>
      <p className="ask-immersive-lede">Have a thoughtful conversation about Jinso.<br />Ask questions, explore ideas, and get grounded answers.</p>

      <div className="voice-coming-soon">
        <button type="button" disabled aria-label="Voice mode is coming later"><MicOff size={26} /></button>
        <span>Voice mode coming later</span>
      </div>

      <section className="immersive-chat-shell" aria-label="Ask Jinso text conversation">
        <Chat immersive context="general" placeholder="Type your question about Jinso…" suggested={prompts} initial={[]} />
      </section>
    </section>
  </main>;
}
