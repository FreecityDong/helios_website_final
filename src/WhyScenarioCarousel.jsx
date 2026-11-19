import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SpeakerHigh, WarningCircle } from "@phosphor-icons/react";

// Four selectable images expand within a fixed square; copy follows the active scene.
const scenes = [
  { name: "Obstacle awareness", title: "Less to listen to.\nMore to act on.", detail: "Brief movement cues", text: "Movement, depth and nearby objects inform brief distance and direction cues. Urgent warnings take priority.", quote: "Obstacle ahead on your left. Move slightly to the right.", image: "task-obstacle-v3.webp", alt: "A chair extending into an indoor walkway with room to pass beside it." },
  { name: "Scene understanding", title: "Pause. Get the\nbigger picture.", detail: "Richer spatial context", text: "When you stop, scene understanding can describe the space and how objects are arranged. Ask for more detail about what interests you.", quote: "A reading area, with tables ahead and bookshelves to your right.", image: "task-place-v2.webp", alt: "Tables and bookshelves in a sunlit reading lounge." },
  { name: "Object finding", title: "A clearer idea of\nwhere to look.", detail: "Feedback focused on your task", text: "Ask for an object. Feedback focuses on its location, nearby reference points and distance when reliable.", quote: "The keys are on the table, beside the notebook.", image: "task-find-v2.webp", alt: "Keys beside a notebook on a wooden table." },
  { name: "Possible fall", title: "A check-in when\nyou may need help.", detail: "Motion sensing · confirmation · local help", text: "Motion and orientation data help detect a possible fall. Helios asks how you are. If you ask for help or do not respond, it can sound a local help prompt to draw attention nearby.", quote: "A possible fall was detected. Are you okay, or do you need help?", image: "why-check-in-v2.webp", alt: "A Helios wearer on her side after a stumble, bracing one hand on the floor and reaching for the sofa.", position: "64% center" },
];
const DURATION = 8500;
export default function WhyScenarioCarousel() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const root = useRef(null);
  const elapsed = useRef(0);
  const inView = useRef(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const touch = useRef(null);
  const select = (index) => { elapsed.current = 0; setActive((index + scenes.length) % scenes.length); };
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { inView.current = entry.isIntersecting; }, { threshold: .3 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now(); const delta = Math.min(now - previous, 200); previous = now;
      if (reduce || !inView.current || (hovered.current || focused.current) || document.hidden || document.documentElement.classList.contains("reduce-motion")) return;
      elapsed.current += delta;
      if (elapsed.current >= DURATION) { elapsed.current = 0; setActive(value => (value + 1) % scenes.length); }
    }, 80);
    return () => clearInterval(timer);
  }, [reduce]);
  return <section id="adaptive-feedback" className="container why-carousel" ref={root} aria-labelledby="adaptive-heading" aria-roledescription="carousel">
    <header className="why-carousel-heading"><div><span className="eyebrow">The Helios difference</span><h2 id="adaptive-heading">What matters changes.<br /><em>So does the feedback.</em></h2></div></header>
    <div className="why-mosaic-layout" onMouseEnter={() => { hovered.current = true; }} onMouseLeave={() => { hovered.current = false; }} onFocusCapture={() => { focused.current = true; }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }}>
      <div className="why-mosaic" data-active={active} onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => { if (touch.current !== null) { const distance = event.changedTouches[0].clientX - touch.current; if (Math.abs(distance) > 45) select(active + (distance < 0 ? 1 : -1)); touch.current = null; } }}>
        {scenes.map((item,index) => {
          const rank = scenes.map((_, i) => i).filter(i => i !== active).indexOf(index);
          const positions = [
            { top: "0%", height: "calc(43% - 5px)" },
            { top: "calc(43% + 5px)", height: "calc(33% - 10px)" },
            { top: "calc(76% + 5px)", height: "calc(24% - 5px)" },
          ];
          const bounds = index === active
            ? { left: "0%", top: "0%", width: "calc(64% - 5px)", height: "100%" }
            : { left: "calc(64% + 5px)", width: "calc(36% - 5px)", ...positions[rank] };
          return <motion.button key={item.name} layout={!reduce} initial={false} style={bounds} transition={{layout: {duration: reduce ? 0 : .6, ease: [.22,1,.36,1]}}} type="button" className={`why-mosaic-tile${active === index ? " is-current" : ""}`} aria-pressed={active === index} aria-label={`Show ${item.name}`} aria-controls="why-scenario-copy" onClick={() => select(index)}>
          <img src={`./assets/${item.image}`} alt={item.alt} loading="lazy" style={{objectPosition:item.position || "center"}} />
          <span className="why-mosaic-label"><small>0{index + 1}</small><span>{item.name}</span></span>
        </motion.button>; })}
      </div>
      <div id="why-scenario-copy" className="why-mosaic-copy-shell">
        <div className="why-carousel-copy-stack">
        {scenes.map((scene, index) => <motion.article key={scene.name} className="why-carousel-copy" aria-hidden={active !== index} initial={false} animate={{opacity: active === index ? 1 : 0, y: reduce || active === index ? 0 : 8}} transition={{duration: reduce ? 0 : .3}}>
          <span className="why-carousel-tag">0{index + 1} / {scene.name}</span><h3>{scene.title}</h3><span className="why-carousel-detail">{scene.detail}</span><p>{scene.text}</p><div className="why-carousel-voice"><SpeakerHigh size={20} aria-hidden="true" /><div><span>Spoken feedback · example</span><blockquote>“{scene.quote}”</blockquote></div></div>
        </motion.article>)}
        </div>
    <p className="why-carousel-priority"><WarningCircle size={20} aria-hidden="true" /><span><strong>Urgent warnings come first.</strong> They can interrupt descriptions or object-finding feedback.</span></p>
      </div>
    </div>
  </section>;
}
