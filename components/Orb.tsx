"use client";

import Image from "next/image";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

export function Orb({ state = "idle", size = "large", brandIcon = false }: { state?: OrbState; size?: "small" | "large"; brandIcon?: boolean }) {
  const label = state === "idle" ? "Jinso is ready" : `Jinso is ${state}`;
  return (
    <div className={`orb-stage orb-stage--${size} orb--${state}`} role="img" aria-label={label}>
      <span className="orb-ring orb-ring--one" />
      <span className="orb-ring orb-ring--two" />
      <span className="orb-particle p1" /><span className="orb-particle p2" /><span className="orb-particle p3" />
      <span className={`orb-core ${brandIcon ? "orb-core--brand" : ""}`}>
        {brandIcon ? <Image className="orb-brand-icon" src="/jinso-icon.png" alt="" width={640} height={640} priority /> : <span className="waveform" aria-hidden="true">
          {[8, 18, 30, 14, 24, 42, 22, 13, 32, 18, 8].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
        </span>}
      </span>
    </div>
  );
}
