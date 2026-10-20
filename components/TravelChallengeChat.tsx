"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, MapPin, MicOff, Sparkles } from "lucide-react";
import type { ChatMessage, StudentEvaluation } from "@/lib/types";
import type { DestinationCard, TravelSessionState } from "@/lib/travel-challenge";

type TravelMessage = ChatMessage & { destinationCard?: DestinationCard };

type Props = {
  initial: TravelMessage[];
  session: TravelSessionState;
  onEvaluation: (evaluation: StudentEvaluation) => void;
  onStateChange: (state: TravelSessionState) => void;
};

export function TravelChallengeChat({ initial, session, onEvaluation, onStateChange }: Props) {
  const [messages, setMessages] = useState<TravelMessage[]>(initial);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function send(value: string) {
    const text = value.trim();
    if (!text || loading || session.stage === "complete") return;
    const nextMessages: TravelMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 520));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "student",
          messages: nextMessages.map(({ role, content }) => ({ role, content })).slice(-10),
          studentScenario: session,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Jinso is unavailable right now.");
      setMessages((current) => [...current, { ...data.message, destinationCard: data.destinationCard }]);
      if (data.evaluation) onEvaluation(data.evaluation);
      if (data.studentState) onStateChange(data.studentState);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "Jinso is unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(input); }

  return <div className="chat travel-chat">
    <div className="chat-scroll" ref={scrollRef} aria-live="polite">
      {messages.map((message, index) => <article className={`message message--${message.role}`} key={`${message.role}-${index}`}>
        {message.role === "assistant" && <span className="message-avatar"><Sparkles size={16} /></span>}
        <div>
          <small>{message.role === "assistant" ? "Jinso" : "You"}</small>
          <p>{message.content}</p>
          {message.destinationCard && <DestinationPreview card={message.destinationCard} />}
        </div>
      </article>)}
      {loading && <div className="message message--assistant"><span className="message-avatar"><Sparkles size={16} /></span><div><small>Jinso</small><span className="typing" aria-label="Jinso is thinking"><i /><i /><i /></span></div></div>}
    </div>
    {session.stage === "complete" && <p className="challenge-complete-note"><Sparkles size={15} /> Role-play complete. Finish the lesson to see your recap.</p>}
    <form className="chat-input" onSubmit={submit}>
      <button type="button" className="voice-placeholder" title="Voice mode is coming later" aria-label="Voice mode is not yet available"><MicOff size={18} /></button>
      <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={session.stage === "complete" ? "Role-play complete" : "Ask a question or make your recommendation…"} aria-label="Your response" maxLength={1200} disabled={session.stage === "complete"} />
      <button type="submit" className="send-button" disabled={!input.trim() || loading || session.stage === "complete"} aria-label="Send message"><ArrowUp size={20} /></button>
    </form>
  </div>;
}

function DestinationPreview({ card }: { card: DestinationCard }) {
  return <aside className={`destination-preview ${card.image ? "destination-preview--image" : ""}`} aria-label={`Destination: ${card.name}`}>
    {card.image && <Image src={card.image} alt="" width={280} height={150} sizes="280px" />}
    <div><span><MapPin size={14} /> Destination idea</span><strong>{card.name}</strong><small>{card.subtitle}</small></div>
  </aside>;
}
