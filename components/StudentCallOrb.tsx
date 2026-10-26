import { Check, Phone } from "lucide-react";
import type { VoiceCallActivity } from "@/lib/student-voice-call";

type StudentCallOrbProps = {
  phase: "incoming" | "active" | "completed";
  activity?: VoiceCallActivity;
};

export function StudentCallOrb({ phase, activity = "idle" }: StudentCallOrbProps) {
  return (
    <div className={`student-call-orb student-call-orb--${phase} student-call-orb--${activity}`} role="img" aria-label={orbLabel(phase, activity)}>
      <span className="call-orbit call-orbit--outer" />
      <span className="call-orbit call-orbit--inner" />
      <i className="call-particle call-particle--one" />
      <i className="call-particle call-particle--two" />
      <i className="call-particle call-particle--three" />
      {phase === "incoming" && <><span className="ringing-waves ringing-waves--left"><i /><i /><i /></span><span className="ringing-waves ringing-waves--right"><i /><i /><i /></span></>}
      <span className="call-orb-core">
        {phase === "active" ? <Waveform /> : <Phone size={74} strokeWidth={2.4} />}
      </span>
      {phase === "completed" && <span className="call-complete-check"><Check size={45} strokeWidth={3} /></span>}
    </div>
  );
}

function Waveform() {
  return <span className="call-waveform" aria-hidden="true">{[15, 30, 48, 70, 48, 30, 15].map((height, index) => <i key={index} style={{ height }} />)}</span>;
}

function orbLabel(phase: StudentCallOrbProps["phase"], activity: VoiceCallActivity) {
  if (phase === "incoming") return "Incoming role-play call";
  if (phase === "completed") return "Role-play call completed";
  return `Role-play call ${activity}`;
}
