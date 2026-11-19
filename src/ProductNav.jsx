import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Circuitry, Scan, DeviceMobile, Compass, ListChecks } from "@phosphor-icons/react";

const sections = [
  { id: "hardware", label: "Hardware", Icon: Circuitry },
  { id: "capabilities", label: "Core capabilities", Icon: Scan },
  { id: "app", label: "The app", Icon: DeviceMobile },
  { id: "everyday-tasks", label: "Everyday tasks", Icon: Compass },
  { id: "details", label: "Requirements", Icon: ListChecks },
];

export default function ProductNav() {
  const [active, setActive] = useState("hardware");
  const track = useRef(null);
  const anchor = useRef(null);
  const [hovered, setHovered] = useState(-1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const footer = document.querySelector("footer");
      const engaged = anchor.current?.getBoundingClientRect().top <= 0 &&
        (!footer || footer.getBoundingClientRect().top > 140);
      document.documentElement.classList.toggle("product-dock-engaged", Boolean(engaged));
      const boundary = Math.min(window.innerHeight * 0.35, 260);
      let current = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= boundary) current = section.id;
      }
      setActive(current);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      document.documentElement.classList.remove("product-dock-engaged");
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  useEffect(() => {
    const container = track.current;
    const link = container?.querySelector('[aria-current="location"]');
    if (!link) return;
    container.scrollTo({
      left: link.offsetLeft - container.clientWidth / 2 + link.offsetWidth / 2,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }, [active, reduceMotion]);

  return (
    <>
      <div ref={anchor} className="product-dock-anchor" aria-hidden="true" />
      <nav className="product-chapter-nav product-dock" aria-label="Product sections">
        <div className="product-chapter-track" ref={track} onPointerLeave={() => setHovered(-1)}>
          {sections.map(({ id, label, Icon }, index) => {
            const distance = Math.abs(index - hovered);
            const scale = hovered < 0 || reduceMotion ? 1 : distance === 0 ? 1.24 : distance === 1 ? 1.1 : 1;
            return (
              <a key={id} href={`#/product?section=${id}`}
                aria-current={active === id ? "location" : undefined}
                onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(index); }}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(-1)}>
                <motion.span className="product-dock-icon" animate={{ scale, y: (1 - scale) * 16 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}>
                  <Icon size={24} aria-hidden="true" />
                </motion.span>
                <span className="product-dock-label">{label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
