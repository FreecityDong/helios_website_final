import { useEffect, useRef, useState } from "react";
import { HandPointing, CheckCircle } from "@phosphor-icons/react";

const startupChecks = [
  "Camera connection",
  "Colour and depth signals",
  "Motion sensing and camera position",
  "Earphones and microphone",
  "Network connection",
  "AI model request",
  "Spoken feedback and obstacle assistance",
];

export default function AppStartDemo() {
  const [phase, setPhase] = useState("ready");
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef(null);
  const [completedChecks, setCompletedChecks] = useState(0);
  const state = useRef("ready");
  const change = (next) => { state.current = next; setPhase(next); };
  const cancel = () => { clearTimeout(holdTimer.current); holdTimer.current = null; setHolding(false); };
  useEffect(() => () => { clearTimeout(holdTimer.current); }, []);
  useEffect(() => {
    if (phase !== "checking") return;
    const timers = startupChecks.map((_, index) => setTimeout(() => setCompletedChecks(index + 1), (index + 1) * 1600));
    timers.push(setTimeout(() => change("active"), startupChecks.length * 1600 + 2200));
    return () => timers.forEach(clearTimeout);
  }, [phase]);
  const begin = () => {
    if (state.current === "checking" || holdTimer.current !== null) return;
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null; setHolding(false);
      if (state.current === "active") { change("ready"); return; }
      setCompletedChecks(0);
      change("checking");
    }, 600);
  };
  const active = phase === "active";
  const checking = phase === "checking";
  const steps = active
      ? ["Automatic device checks, spoken feedback and obstacle alerts", "Say “Hi Helios” to ask a question or find an object", "Possible-fall detection with a spoken check-in", "Continues with the screen off or another app open", "Press and hold Stop assistance to end"]
      : ["Open the app. A voice prompt says “Welcome to Helios”.", "When you’re ready, put on the device, connect it to your phone, then press and hold Start assistance."];
  return <div className={`app-start-demo phase-${phase}`}>
    <div className="app-demo-control">
    <button className={`app-demo-button${holding ? " is-holding" : ""}`} aria-disabled={checking} aria-label={checking ? "Checking devices" : active ? "Press and hold to stop assistance" : "Press and hold to start assistance"}
      onPointerDown={(e) => { if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); begin(); }}
      onPointerUp={cancel} onPointerCancel={cancel} onLostPointerCapture={cancel} onBlur={cancel}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin(); } }}
      onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); cancel(); } }}>
      {phase === "ready" && !holding && <span className="app-demo-hand" aria-hidden="true"><HandPointing size={34} weight="duotone" /><span>Press and hold</span></span>}
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="app-demo-track" cx="50" cy="50" r="46" /><circle className="app-demo-progress" cx="50" cy="50" r="46" pathLength="1" /></svg>
      <span className="app-demo-icon" aria-hidden="true">{checking ? "···" : active ? "■" : "▶"}</span>
      <strong>{checking ? "Checking devices" : active ? "Stop assistance" : "Start assistance"}</strong>
      <small>{checking ? "Automatically preparing" : holding ? "Keep holding…" : "Press and hold"}</small>
    </button>
    </div>
    <div className="app-demo-status" aria-live="polite" aria-atomic="true"><h3>{checking ? (completedChecks === startupChecks.length ? "All checks complete." : "Getting ready, step by step.") : active ? "Assistance is running." : "Before you begin."}</h3>{checking ? <ul className="app-start-checklist">{startupChecks.map((label, index) => {
      const done = index < completedChecks;
      const visible = index <= completedChecks;
      return <li key={label} className={`${visible ? "is-visible" : "is-pending"}${done ? " is-complete" : ""}`} aria-hidden={!visible}>
        <span className="app-check-icon" aria-hidden="true">{done ? <CheckCircle size={20} weight="fill"/> : <i/>}</span>
        <span className="app-check-text">{label}</span>
        <span className="app-check-state">{done ? (label === "Network connection" ? "Connected" : label === "AI model request" ? "Response received" : "Ready") : (label === "Network connection" ? "Connecting…" : label === "AI model request" ? "Requesting…" : "Checking…")}</span>
      </li>;
    })}</ul> : <ul>{steps.map((step,i)=><li key={step}><span aria-hidden="true">{active ? "✓" : `0${i+1}`}</span>{step}</li>)}</ul>}</div>
  </div>;
}
