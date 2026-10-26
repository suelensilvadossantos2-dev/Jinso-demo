export type VoiceCallActivity = "idle" | "listening" | "thinking" | "speaking";
export type VoiceCallStatus = "idle" | "active" | "ended";

export type VoiceCallSnapshot = {
  mode: "mock";
  status: VoiceCallStatus;
  activity: VoiceCallActivity;
  muted: boolean;
  speakerEnabled: boolean;
  startedAt?: number;
};

export interface StudentVoiceCallService {
  getSnapshot(): VoiceCallSnapshot;
  start(): VoiceCallSnapshot;
  end(): VoiceCallSnapshot;
  setMuted(muted: boolean): VoiceCallSnapshot;
  setSpeakerEnabled(enabled: boolean): VoiceCallSnapshot;
  setActivity(activity: VoiceCallActivity): VoiceCallSnapshot;
}

/**
 * UI-facing call service boundary. This demo implementation never requests
 * microphone permission and never opens an audio connection. A future
 * realtime provider can implement this interface without changing the lesson.
 */
export function createMockStudentVoiceCallService(): StudentVoiceCallService {
  let snapshot: VoiceCallSnapshot = {
    mode: "mock",
    status: "idle",
    activity: "idle",
    muted: false,
    speakerEnabled: true,
  };

  const update = (value: Partial<VoiceCallSnapshot>) => {
    snapshot = { ...snapshot, ...value };
    return snapshot;
  };

  return {
    getSnapshot: () => snapshot,
    start: () => update({ status: "active", activity: "speaking", startedAt: Date.now() }),
    end: () => update({ status: "ended", activity: "idle" }),
    setMuted: (muted) => update({ muted }),
    setSpeakerEnabled: (speakerEnabled) => update({ speakerEnabled }),
    setActivity: (activity) => update({ activity }),
  };
}

export function formatCallDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const studentVoiceIntegration = {
  enabled: false,
  mode: "mock" as const,
  activationRequirement: "An explicit realtime voice feature flag and a server-side voice provider implementation",
};
