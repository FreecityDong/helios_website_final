import { useEffect, useId, useRef, useState } from "react";
import "./product-system.css";

const steps = [
  { name: "The wearable mount", title: "Supported. Hands free.", text: "A neck mount supports the camera from below. The concealed magnetic necklace helps hold it at chest height, leaving your hands free.", detail: "Neck mount + magnetic necklace" },
  { name: "The depth camera", title: "More than an image.", text: "Colour, depth and IMU sensing capture your surroundings, distance, movement and orientation.", detail: "RGB + depth + motion" },
  { name: "Your phone", title: "The system, connected.", text: "Your phone receives image, depth and IMU data through USB-C. The app turns these inputs into spatial understanding and spoken feedback.", detail: "USB-C connection · Helios app" },
  { name: "Your earphones", title: "Information you can hear.", text: "Hear descriptions and timely alerts through Bluetooth earphones, with your phone in your pocket.", detail: "Bluetooth audio · spoken feedback" },
];
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));

export default function ProductSystem() {
  const section = useRef(null);
  const controller = useRef(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches || document.documentElement.classList.contains("reduce-motion"));
    update();
    media.addEventListener("change", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { media.removeEventListener("change", update); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (reduced) return;
    let value = 0, frame, previous = performance.now(), lastInput = previous, visible = false;
    const publish = (n) => { value = clamp(n, 0, 4); setProgress(value); };
    const measure = () => {
      const rect = section.current.getBoundingClientRect();
      const travel = Math.max(1, rect.height - (window.innerHeight - 100));
      visible = rect.top <= 115 && rect.bottom >= window.innerHeight - 30;
      lastInput = performance.now();
      publish((100 - rect.top) / travel * 4);
    };
    controller.current = (index) => {
      const rect = section.current.getBoundingClientRect();
      const travel = Math.max(1, rect.height - (window.innerHeight - 100));
      window.scrollTo({ top: window.scrollY + rect.top - 100 + travel * index / 4, behavior: "instant" });
      publish(index);
      lastInput = performance.now() - 1000;
    };
    const tick = (now) => {
      const dt = Math.min(now - previous, 80); previous = now;
      if (visible && !document.hidden && !window.location.hash.includes("experience") && now - lastInput > 800 && value < 4) publish(value + dt / 3800);
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => { previous = performance.now(); lastInput = previous; };
    measure(); frame = requestAnimationFrame(tick);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); document.removeEventListener("visibilitychange", visibility); controller.current = null; };
  }, [reduced]);
  const active = Math.min(3, Math.floor(progress));
  const current = steps[active];
  return <section id="hardware" ref={section} className={`product-system-story${reduced ? " is-static" : ""}`} aria-label="One system, working together">
    <div className="product-system-sticky container">
      <div className="product-system-copy">
        <span className="eyebrow">One system. Working together.</span>
        <div className="product-system-description" key={active}><h2>{current.title}</h2><p>{current.text}</p><span className="product-system-detail">{current.detail}</span></div>
        <nav aria-label="Explore the system components" className="product-system-steps">
          {steps.map((step, index) => <button key={step.name} aria-current={active === index ? "step" : undefined} onClick={() => reduced ? setProgress(index) : controller.current?.(index)}><span className="system-step-number">0{index + 1}</span><span>{step.name}</span>{active === index && !reduced && <svg className="system-step-ring" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="9" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - clamp(progress - active, 0, 1)} /></svg>}</button>)}
        </nav>
      </div>
      <figure className="product-system-art">
        <svg viewBox="805 30 1150 730" role="img" aria-label="Neck mount, magnetic necklace, depth camera, connected phone and Bluetooth earphones gradually changing from outline to finished products">
          <defs>
            <filter id={`${id}-ink`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .28  0 0 0 0 .32  0 0 0 0 .32  -1 -1 -1 0 2.65" /></filter>
            <filter id={`${id}-soft`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9" /></filter>
            <mask id={`${id}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width="1984" height="794">
              <g fill="white" filter={`url(#${id}-soft)`}>
                <rect x="825" y="45" width="610" height="535" rx="30" opacity={reduced ? 1 : clamp(progress,0,1)} />
                <rect x="900" y="585" width="345" height="140" rx="24" opacity={reduced ? 1 : clamp(progress-1,0,1)} />
                <path d="M1445 70 H1700 V735 H1245 V595 H1445 Z" opacity={reduced ? 1 : clamp(progress-2,0,1)} />
                <rect x="1710" y="225" width="240" height="360" rx="24" opacity={reduced ? 1 : clamp(progress-3,0,1)} />
              </g>
            </mask>
            <mask id={`${id}-outline`} maskUnits="userSpaceOnUse" x="0" y="0" width="1984" height="794">
              <rect width="1984" height="794" fill="white" />
              <g fill="black" filter={`url(#${id}-soft)`}>
                <rect x="825" y="45" width="610" height="535" rx="30" opacity={reduced ? 1 : clamp(progress,0,1)} />
                <rect x="900" y="585" width="345" height="140" rx="24" opacity={reduced ? 1 : clamp(progress-1,0,1)} />
                <path d="M1445 70 H1700 V735 H1245 V595 H1445 Z" opacity={reduced ? 1 : clamp(progress-2,0,1)} />
                <rect x="1710" y="225" width="240" height="360" rx="24" opacity={reduced ? 1 : clamp(progress-3,0,1)} />
              </g>
            </mask>
          </defs>
          <image href="./assets/product-system-outline-v1.webp" width="1984" height="794" filter={`url(#${id}-ink)`} mask={`url(#${id}-outline)`} />
          <image href="./assets/product-system-cutout-v1.webp" width="1984" height="794" mask={`url(#${id}-reveal)`} />
        </svg>
      </figure>
    </div>
  </section>;
}
