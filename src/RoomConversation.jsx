import { useEffect, useState } from "react";

function ChatAvatar({ user = false }) {
  return (
    <span
      className={`room-chat-avatar${user ? " is-user" : ""}`}
      aria-hidden="true"
    >
      {user ? (
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="12" r="6" fill="#b48c72" />
          <path d="M5 31v-3a11 11 0 0 1 22 0v3" fill="#6d847e" />
          <path d="M10 10c0-7 12-7 12 0l-3-2-9 2Z" fill="#34413e" />
          <path d="M10 11h5v3h-5zm7 0h5v3h-5z" fill="#203443" />
          <path d="M15 12h2" stroke="#203443" />
        </svg>
      ) : (
        <img src="./assets/helios-mark.webp" alt="" />
      )}
    </span>
  );
}

export default function RoomConversation({
  active,
  ready,
  failed,
  reduce,
  capture,
}) {
  const [photo, setPhoto] = useState(null);
  const [phase, setPhase] = useState("question");
  useEffect(() => {
    if (!active) return;
    setPhoto(null);
    setPhase("question");
    if (failed) {
      setPhase("unavailable");
      return;
    }
    if (!ready) return;
    const timers = [];
    const shoot = () => {
      try {
        const image = capture();
        if (!image) throw new Error("No camera image");
        setPhoto(image);
        setPhase(reduce ? "answer" : "flash");
        if (!reduce) {
          timers.push(setTimeout(() => setPhase("photo"), 240));
          timers.push(setTimeout(() => setPhase("answer"), 1400));
        }
      } catch {
        setPhase("unavailable");
      }
    };
    if (reduce) shoot();
    else timers.push(setTimeout(shoot, 650));
    return () => timers.forEach(clearTimeout);
  }, [active, ready, failed, reduce, capture]);
  if (!active) return null;
  return (
    <aside
      className="room-conversation"
      aria-label="Scene conversation demonstration"
    >
      <div className="room-message room-message-outgoing">
        <div className="room-question">
          <p>Hi Helios, what kind of place am I in?</p>
        </div>
        <ChatAvatar user />
      </div>
      <div className="room-message room-message-incoming">
        <ChatAvatar />
        <div className="room-message-stack">
          <div
            className={`room-camera-photo ${phase === "flash" ? "is-capturing" : ""}`}
          >
            {photo ? (
              <img
                src={photo}
                alt="First-person camera photo of the dining table and chairs ahead"
              />
            ) : (
              <div className="room-photo-placeholder">
                {phase === "unavailable"
                  ? "Camera view unavailable"
                  : "Looking ahead…"}
              </div>
            )}
            {photo && <span className="room-photo-caption">Camera view</span>}
            {phase === "flash" && !reduce && (
              <i className="room-shutter" aria-hidden="true" />
            )}
          </div>
          <div aria-live="polite" className="room-answer">
            {phase === "answer" ? (
              <>
                <p>
                  You’re in a living and dining area. A dining table and chairs
                  are in front of you.
                </p>
              </>
            ) : phase === "unavailable" ? (
              <p>Please refresh the page to try again.</p>
            ) : (
              <span className="room-thinking">
                {photo ? "Understanding the scene…" : "Preparing to capture"}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
