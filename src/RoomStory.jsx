import { useCallback, useEffect, useRef, useState } from "react";
import "./room-story.css";
import RoomConversation from "./RoomConversation";
import { DEPTH_GRADIENT } from "./depth-palette";
const chapters = [
  {
    title: "Every space has a story.",
    text: "Wearable spatial assistance for blind and low-vision people. Start with the space around you.",
    label: "The space",
    progress: 0.195,
  },
  {
    title: "From where you stand.",
    text: "The camera faces the dining area from chest height.",
    label: "Camera view",
    progress: 0.2808,
  },
  {
    title: "Make sense of what’s ahead.",
    text: "A chair stands between you and the dining table.",
    label: "Visible objects",
    progress: 0.3666,
  },
  {
    title: "More than a name.",
    text: "The chair is closer than the table. Warm colours mark nearer surfaces; cool colours mark those farther away.",
    label: "Depth perception",
    progress: 0.5304,
  },
  {
    title: "A clearer way forward.",
    text: "Follow the open space between the dining chairs and the sofa in this example.",
    label: "A way through",
    progress: 0.72,
  },
  {
    title: "Beyond individual objects.",
    text: "The sofa beside the dining area suggests a room for both meals and conversation.",
    label: "Scene understanding",
    progress: 0.86,
  },
  {
    title: "Ask. Hear. Understand.",
    text: "Pause, ask about the room, and hear a description of the space ahead.",
    label: "Ask Helios",
    progress: 1,
  },
];
const storySteps = [
  { label: "Your surroundings", progress: 0.195 },
  { label: "What’s ahead", progress: 0.3666 },
  { label: "A sense of distance", progress: 0.5304 },
  { label: "A way through", progress: 0.72 },
  { label: "A fuller picture", progress: 0.86 },
  { label: "Ask Helios", progress: 1 },
];
const stepBounds = [0, 0.2028, 0.39, 0.56, 0.74, 0.88, 1];
const stepDuration = 6500;
const idleDelay = 1400;

function headerBottom() {
  return Math.max(
    0,
    document.querySelector(".site-header .nav-inner")?.getBoundingClientRect()
      .bottom || 0,
  );
}
export default function RoomStory({ reduce = false }) {
  const section = useRef(null);
  const canvasHost = useRef(null);
  const playFrom = useRef(null);
  const [restart, setRestart] = useState(0);
  const sceneApi = useRef(null);
  const latestProgress = useRef(reduce ? 1 : 0);
  const capture = useCallback(() => sceneApi.current?.capture(), []);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(reduce ? 1 : 0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (reduce) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const node = section.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const offset = headerBottom();
      node.style.setProperty("--room-header", `${offset}px`);
      const pinHeight = window.innerHeight - offset;
      const travel = Math.max(1, rect.height - pinHeight);
      setProgress(Math.max(0, Math.min(1, (offset - rect.top) / travel)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reduce]);
  useEffect(() => {
    if (!loaded || reduce || failed) return;
    const node = section.current;
    let timer = 0;
    let frame = 0;
    let expectedY = null;
    let held = false;
    let position = 0;
    let start = 0;
    let travel = 0;
    let previous = 0;

    function stop() {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      expectedY = null;
    }
    function tick(now) {
      if (document.querySelector(".experience-drawer")) { arm(); return; }
      const index = stepBounds.findIndex(bound => bound > position) - 1;
      if (index < 0) return;
      const span = stepBounds[index + 1] - stepBounds[index];
      position = Math.min(1, position + span * Math.max(0, Math.min(now - previous, 80)) / stepDuration);
      previous = now;
      expectedY = Math.round(start + position * travel);
      window.scrollTo({ top: expectedY, behavior: "instant" });
      if (position < 1) frame = requestAnimationFrame(tick);
    }
    function arm() {
      stop();
      if (held || document.hidden) return;
      timer = window.setTimeout(() => {
        const rect = node.getBoundingClientRect();
        const offset = headerBottom();
        travel = rect.height - (window.innerHeight - offset);
        start = window.scrollY + rect.top - offset;
        if (travel <= 1 || rect.top > offset + 1 || window.scrollY >= start + travel - 0.5) return;
        position = Math.max(0, (window.scrollY - start) / travel);
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }, idleDelay);
    }
    function onScroll() {
      if (expectedY === null || Math.abs(window.scrollY - expectedY) > 1) arm();
    }
    function hold() { held = true; stop(); }
    function release() { held = false; arm(); }
    playFrom.current = (target) => {
      stop();
      const rect = node.getBoundingClientRect();
      const offset = headerBottom();
      start = window.scrollY + rect.top - offset;
      travel = rect.height - (window.innerHeight - offset);
      position = target;
      expectedY = Math.ceil(start + target * travel);
      window.scrollTo({ top: expectedY, behavior: "instant" });
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const events = [
      ["scroll", onScroll], ["wheel", arm], ["keydown", arm], ["resize", arm],
      ["pointerdown", hold], ["pointerup", release], ["pointercancel", release],
    ];
    for (const [type, handler] of events) window.addEventListener(type, handler, { passive: true });
    document.addEventListener("visibilitychange", arm);
    arm();
    return () => {
      playFrom.current = null;
      stop();
      for (const [type, handler] of events) window.removeEventListener(type, handler);
      document.removeEventListener("visibilitychange", arm);
    };
  }, [loaded, reduce, failed]);
  useEffect(() => {
    latestProgress.current = progress;
    sceneApi.current?.update(progress);
  }, [progress]);
  useEffect(() => {
    let cancelled = false;
    const host = canvasHost.current;
    const start = async () => {
      try {
        const { createRoomScene } = await import("./room-scene");
        if (cancelled) return;
        const api = await createRoomScene(host, latestProgress.current);
        if (cancelled) {
          api.dispose();
          return;
        }
        sceneApi.current = api;
        api.update(latestProgress.current);
        setLoaded(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    let observer;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            start();
          }
        },
        { rootMargin: "600px" },
      );
      observer.observe(host);
    } else if (typeof WebGLRenderingContext !== "undefined") start();
    return () => {
      cancelled = true;
      observer?.disconnect();
      sceneApi.current?.dispose();
      sceneApi.current = null;
    };
  }, []);
  const chapter =
    progress < 0.2028
      ? 0
      : progress < 0.312
        ? 1
        : progress < 0.39
          ? 2
          : progress < 0.56
            ? 3
            : progress < 0.74
              ? 4
              : progress < 0.88
                ? 5
                : 6;
  const step = [0, 1, 1, 2, 3, 4, 5][chapter];
  const copyChapter = chapter;
  const copy = chapters[copyChapter];
  return (
    <section
      ref={section}
      id="room-demo"
      className={`room-story${reduce || failed ? " room-story-static" : ""}${progress >= 0.39 && progress < 0.602 && loaded ? " room-story-depth" : ""}`}
      aria-label="Explore an indoor space"
    >
      <div className="room-story-pin">
        <div className="room-art" aria-hidden="true">
          {!loaded && <img src="./assets/room-scene-poster.webp" alt="" />}
          <div
            ref={canvasHost}
            className={`room-canvas${loaded ? " is-ready" : ""}`}
          />
        </div>
        <div className="room-story-copy">
          <div className="room-copy-meta">
            <span>How Helios helps</span>
          </div>
          <div
            key={`${restart}-${copyChapter}`}
            className={`room-copy-frame${reduce ? " is-still" : ""}`}
          >
            <h2 aria-label={copy.title}>
              {copy.title.split(" ").map((word, i) => (
                <span key={i} style={{ "--word-delay": `${i * 35}ms` }}>
                  {word}{" "}
                </span>
              ))}
            </h2>
            <p>{copy.text}</p>
          </div>
          {failed && <p>Explore the room in this still view.</p>}
          <nav className="room-chapters" aria-label="Room scene stages">
            {storySteps.map((item, index) => (
              <button
                key={item.label}
                aria-pressed={step === index}
                onClick={() => {
                  setRestart(value => value + 1);
                  if (reduce || failed) {
                    setProgress(item.progress);
                    return;
                  }
                  const target = stepBounds[index];
                  setProgress(target);
                  if (playFrom.current) {
                    playFrom.current(target);
                  } else {
                    const rect = section.current.getBoundingClientRect();
                    const offset = headerBottom();
                    const travel = rect.height - (window.innerHeight - offset);
                    window.scrollTo({
                      top: Math.ceil(window.scrollY + rect.top - offset + target * travel),
                      behavior: "instant",
                    });
                  }
                }}
              >
                <span aria-hidden="true">0{index + 1}</span>
                <span className="room-step-label">
                  {item.label}
                  {index === step && loaded && !reduce && !failed && progress < 0.9999 && (
                    <svg className="room-step-ring" viewBox="0 0 32 32" aria-hidden="true">
                  <circle className="room-ring-track" cx="16" cy="16" r="13" />
                  <circle cx="16" cy="16" r="13" pathLength="1" strokeDasharray="1"
                    strokeDashoffset={1 - (progress - stepBounds[step]) / (stepBounds[step + 1] - stepBounds[step])}
                    transform="rotate(-90 16 16)" />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>
        {chapter === 3 && loaded && (
          <div
            className="room-depth-key"
            aria-label="Relative depth: near red through yellow, green and cyan to far blue"
          >
            <span>Near</span>
            <i style={{ background: DEPTH_GRADIENT }} />
            <span>Far</span>
          </div>
        )}
        <RoomConversation
          key={restart}
          active={chapter === 6}
          ready={loaded}
          failed={failed}
          reduce={reduce}
          capture={capture}
        />
        {reduce && (
          <div className="room-story-bottom">
            <span>Choose a view to explore</span>
          </div>
        )}
      </div>
    </section>
  );
}
