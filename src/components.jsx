import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Play,
  Pause,
  ArrowLeft,
  CheckCircle,
} from "@phosphor-icons/react";
import { findingSteps } from "./data";
export function TextLink({ to, children }) {
  return (
    <a className="text-link" href={`#${to}`}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
  reduce = false,
}) {
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? "footer-brand" : ""}`}
      href="#/"
      aria-label="Helios home"
    >
      <span className="brand-mark" aria-hidden="true">
        <img src="./assets/helios-mark.webp" alt="" width="512" height="512" />
      </span>
      <span>Helios</span>
    </a>
  );
}
export function SectionHeading({ title, text, eyebrow, light = false }) {
  return (
    <div className={`section-heading ${light ? "on-dark" : ""}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
export function Wave({ small = false }) {
  return (
    <span className={`wave ${small ? "small" : ""}`} aria-hidden="true">
      {[12, 23, 34, 18, 28, 42, 30, 19, 33, 24, 14, 29, 40, 25, 15].map(
        (h, i) => (
          <i key={i} style={{ height: h, animationDelay: `${i * 50}ms` }} />
        ),
      )}
    </span>
  );
}
export function SceneDemo({ reduce = false, compact = false }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing || reduce) return;
    if (step === 3) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => s + 1), 3600);
    return () => clearTimeout(id);
  }, [playing, reduce, step]);
  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);
  const item = findingSteps[step];
  return (
    <div className={`scene-demo ${compact ? "compact" : ""}`}>
      <div className={`scene-view scene-step-${step}`}>
        <img
          src="./assets/room-story-v3.webp"
          alt="A living room used to illustrate a Helios object-finding task."
          width="1800"
          height="1157"
          loading="lazy"
        />
        <div className="scene-shade" />
        {step === 1 ? (
          <div
            className="scan-line"
            aria-hidden="true"
            style={{ animationPlayState: playing ? "running" : "paused" }}
          />
        ) : null}
        <div
          className={`target-frame ${step >= 2 ? "visible" : ""}`}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="scene-topline">
          <span>Object finding</span>
          <span>Step {step + 1} / 4</span>
        </div>
        <div className="voice-caption">
          <Wave small />
          <p aria-live="polite">{item.quote}</p>
        </div>
      </div>
      <div className="demo-controls">
        <div className="step-tabs" aria-label="Object-finding steps">
          {findingSteps.map((s, i) => (
            <button
              key={s.title}
              aria-label={`Step ${i + 1}: ${s.title}`}
              onClick={() => {
                setStep(i);
                setPlaying(false);
              }}
              aria-pressed={step === i}
            >
              <span className="step-no">0{i + 1}</span>
              {s.title}
            </button>
          ))}
        </div>
        <div className="playback">
          <button
            className="icon-button"
            aria-label="Previous step"
            disabled={step === 0}
            onClick={() => {
              setPlaying(false);
              setStep((s) => s - 1);
            }}
          >
            <ArrowLeft size={18} />
          </button>
          {!reduce ? (
            <button
              className="icon-button solid"
              aria-label={
                playing
                  ? "Pause demo"
                  : step === 3
                    ? "Replay demo"
                    : "Play demo"
              }
              onClick={() => {
                if (step === 3) setStep(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? (
                <Pause size={18} weight="fill" />
              ) : (
                <Play size={18} weight="fill" />
              )}
            </button>
          ) : null}
          <button
            className="icon-button"
            aria-label="Next step"
            disabled={step === 3}
            onClick={() => {
              setPlaying(false);
              setStep((s) => s + 1);
            }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <p className="step-description">{item.text}</p>
      <p className="media-note">
        AI-generated scene and illustrative sequence, not live detection.
        English captions translate example interactions; the current app
        recognizes Chinese voice commands.
      </p>
    </div>
  );
}
export function ProductPortrait({ priority = false }) {
  return (
    <figure className="product-portrait">
      <img
        src="./assets/helios-kit-concept.webp"
        alt="Concept illustration of a neck mount, magnetic necklace, stereo depth camera, and connected smartphone."
        width="1536"
        height="1024"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      <figcaption>
        Product configuration concept · Final hardware appearance may differ
      </figcaption>
    </figure>
  );
}
export function HardwareDiagram() {
  return (
    <div className="kit-components" aria-label="Helios wearable components">
      {[
        [
          "01",
          "Neck mount",
          "An action-camera-style collar for the wearable setup.",
        ],
        [
          "02",
          "Magnetic necklace",
          "The magnetic attachment component worn at the chest.",
        ],
        ["03", "Depth camera", "Captures the view ahead and measures depth."],
        [
          "04",
          "Your smartphone",
          "Runs Helios and coordinates spoken guidance.",
        ],
      ].map(([number, title, text]) => (
        <div key={number}>
          <span>{number}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
export function StatusMark({ children }) {
  return (
    <span className="status-mark">
      <CheckCircle size={18} weight="fill" />
      {children}
    </span>
  );
}

export function PageBanner({
  image,
  alt,
  eyebrow,
  title,
  text,
  note,
  children,
  kind = "",
}) {
  const [view, setView] = useState(0);
  const home = kind === "home";
  const sources = {
    home: "./assets/spatial-room.webp",
    product: "./assets/helios-kit-concept.webp",
    technology: "./assets/spatial-room.webp",
    team: "./assets/team/group.webp",
  };
  const captions = ["An object.", "A location.", "More context."];
  return (
    <section className={`page-banner banner-${kind}`}>
      <div className="container banner-grid">
        <div className="banner-content">
          <span className="banner-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{text}</p>
          {children || home ? (
            <div className="button-row">
              {home && (
                <a className="button" href="#/get-involved/test">
                  Apply to Test
                  <ArrowRight size={18} />
                </a>
              )}
              {children}
            </div>
          ) : null}
        </div>
        <div className="banner-visual">
          <img
            className="banner-image"
            src={sources[kind] || `./assets/banners/${image}.webp`}
            alt={
              home || kind === "technology"
                ? "Concept cutaway of a living room, with a remote and cup on the coffee table. Not live sensor output."
                : kind === "team"
                  ? "The five members of the Helios team together."
                  : alt
            }
            width={kind === "team" ? "1672" : "1536"}
            height={kind === "team" ? "941" : "864"}
            fetchPriority="high"
          />
          {home && (
            <>
              <div
                className={`perception-view perception-view-${view}`}
                aria-hidden="true"
              >
                <span />
                <i />
              </div>
              <div
                className="hero-view-controls"
                role="group"
                aria-label="Spatial illustration views"
              >
                {["Object", "Direction", "Distance"].map((label, i) => (
                  <button
                    key={label}
                    aria-pressed={view === i}
                    onClick={() => setView(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="hero-view-caption" aria-live="polite">
                {captions[view]}
              </span>
            </>
          )}
          <span className="banner-note">
            {kind === "team"
              ? "The Helios team"
              : home || kind === "technology"
                ? "AI-generated spatial illustration · Not live sensor output"
                : note}
          </span>
        </div>
      </div>
    </section>
  );
}
