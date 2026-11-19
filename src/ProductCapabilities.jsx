import { useEffect, useRef, useState } from "react";

const capabilities = [
  { name: "Recognition & distance", title: "Know what is ahead.", text: "Object detection and depth analysis identify nearby objects and estimate distance. IMU motion and orientation data add information about your movement and posture.", image: "product-recognition-v1.webp", alt: "Three-part illustration of object detection, colour-coded depth and IMU orientation.", position: "48% center", points: ["Recognise nearby objects", "Estimate distance with depth", "Sense movement and posture with IMU"] },
  { name: "Scene understanding", title: "Understand the whole scene.", text: "Large language model–based understanding connects objects with their surroundings to describe a place, answer questions and help find supported objects.", image: "product-scene-v1.webp", alt: "A reading lounge with tables, bookshelves and connected seating areas.", position: "60% center", points: ["Understand places with AI", "Ask about your surroundings", "Find supported everyday objects"] },
  { name: "Feedback decisions", title: "Hear what matters, when it matters.", text: "The task, surroundings and your movement shape what Helios says. Urgent warnings come first, feedback stays brief while moving, and questions invite more detail.", image: "product-feedback-v1.webp", alt: "A person wearing Helios and earphones, paused to listen in a reading lounge.", position: "50% center", points: ["Urgent warnings come first", "Brief feedback while moving", "More detail when you ask"] },
];
export default function ProductCapabilities() {
  const [active, setActive] = useState(0);
  const cards = useRef(null);
  const lastAction = useRef(0);
  const focusWithin = useRef(false);
  const noteAction = () => { lastAction.current = Date.now(); };
  useEffect(() => {
    let visible = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; lastAction.current = Date.now(); }, { threshold: .45 });
    observer.observe(cards.current);
    const reset = () => { lastAction.current = Date.now(); };
    document.addEventListener("visibilitychange", reset);
    const timer = window.setInterval(() => {
      if (!visible || document.hidden || media.matches || document.documentElement.classList.contains("reduce-motion") || focusWithin.current || location.hash.includes("experience")) { reset(); return; }
      if (Date.now() - lastAction.current >= 6000) {
        setActive(current => current === null ? 0 : (current + 1) % capabilities.length);
        reset();
      }
    }, 250);
    return () => { clearInterval(timer); observer.disconnect(); document.removeEventListener("visibilitychange", reset); };
  }, []);
  return <section id="capabilities" className="container section product-core product-core-gallery">
    <span id="sensing" className="product-core-anchor" />
    <header className="core-gallery-heading"><span className="eyebrow">Three connected capabilities</span><h2>From sensing to understanding.</h2></header>
    <div className="core-image-cards" ref={cards} onPointerMove={noteAction} onPointerDown={noteAction} onFocusCapture={(event) => { focusWithin.current = event.target.matches(":focus-visible"); noteAction(); }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) focusWithin.current = false; noteAction(); }}>
      {capabilities.map((item,index)=>{
        const expanded = active === index;
        return <article key={item.name} className={`core-image-card${expanded ? " is-expanded" : ""}`}>
          <img src={`./assets/${item.image}`} alt={item.alt} loading="lazy" style={{objectPosition:item.position}} />
          <span className="core-card-tag">{item.name}</span>
          <button className="core-card-toggle" aria-label={`${expanded ? "Collapse" : "Expand"} ${item.name}`} aria-expanded={expanded} aria-controls={`core-card-description-${index}`} onClick={()=>{ noteAction(); setActive(expanded ? null : index); }}><span aria-hidden="true">{expanded ? "×" : "+"}</span></button>
          <div className="core-card-copy"><h3>{item.title}</h3><div id={`core-card-description-${index}`} className="core-card-description" hidden={!expanded}><ul>{item.points.map(point => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}</ul></div></div>
        </article>;
      })}
    </div>
    <p className="core-gallery-note">Immediate obstacle assessment runs on the phone. Scene questions and object finding use selected observations with the DeepSeek API and require internet access.</p>
  </section>;
}
