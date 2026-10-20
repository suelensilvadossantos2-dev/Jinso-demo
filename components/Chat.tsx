"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Keyboard, MicOff, Sparkles } from "lucide-react";
import { ChatContext, ChatMessage, StudentEvaluation } from "@/lib/types";

type Props = {
  context: ChatContext;
  initial: ChatMessage[];
  placeholder: string;
  onLearnerRef?: (id: string) => void;
  onEvaluation?: (evaluation: StudentEvaluation) => void;
  compact?: boolean;
  suggested?: string[];
  externalPrompt?: string | null;
  onPromptConsumed?: () => void;
  immersive?: boolean;
};

const EMPTY_SUGGESTIONS: string[] = [];

export function Chat({ context, initial, placeholder, onLearnerRef, onEvaluation, compact, suggested = EMPTY_SUGGESTIONS, externalPrompt, onPromptConsumed, immersive = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (externalPrompt) { void send(externalPrompt); onPromptConsumed?.(); } }, [externalPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(value: string) {
    const text = value.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages); setInput(""); setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, messages: nextMessages.slice(-10) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Jinso is unavailable right now.");
      setMessages((current) => [...current, data.message]);
      if (data.evaluation) onEvaluation?.(data.evaluation);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "Jinso is unavailable right now." }]);
    } finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(input); }

  return <div className={`chat ${compact ? "chat--compact" : ""} ${immersive ? "chat--immersive" : ""}`}>
    <div className="chat-scroll" ref={scrollRef} aria-live="polite">
      {messages.map((message, index) => <article className={`message message--${message.role}`} key={`${message.role}-${index}`}>
        {message.role === "assistant" && <span className="message-avatar"><Sparkles size={16} /></span>}
        <div><small>{message.role === "assistant" ? "Jinso" : "You"}</small><p>{message.content}</p>{message.learnerRef && <button className="inline-link" onClick={() => onLearnerRef?.(message.learnerRef!)}>View learner details →</button>}</div>
      </article>)}
      {loading && <div className="message message--assistant"><span className="message-avatar"><Sparkles size={16} /></span><div><small>Jinso</small><span className="typing" aria-label="Jinso is thinking"><i /><i /><i /></span></div></div>}
    </div>
    {suggested.length > 0 && messages.length < 3 && <div className="chat-chips">{suggested.map((p) => <button key={p} onClick={() => void send(p)}>{p}</button>)}</div>}
    <form className="chat-input" onSubmit={submit}>
      <button type="button" className="voice-placeholder" title={immersive ? "Text conversation" : "Voice mode is coming later"} aria-label={immersive ? "Text conversation" : "Voice mode is not yet available"}>{immersive ? <Keyboard size={18} /> : <MicOff size={18} />}</button>
      <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} aria-label={placeholder} maxLength={1200} />
      <button type="submit" className="send-button" disabled={!input.trim() || loading} aria-label="Send message"><ArrowUp size={20} /></button>
    </form>
  </div>;
}
