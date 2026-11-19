import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MotionConfig } from "motion/react";
import { List, X, ArrowUpRight, ArrowUp } from "@phosphor-icons/react";
import { Brand } from "./components";
import {
  NewHome,
  NewProduct,
  WhyHelios,
  Guides,
  NewTeam,
  Experience,
  Privacy,
} from "./editorial";
const nav = [
  ["/product", "Product"],
  ["/why-helios", "Why Helios"],
  ["/guides", "Guides & Support"],
  ["/team", "Our Team"],
];
function getRoute() {
  return window.location.hash.slice(1) || "/";
}
const pageTitles = {
  "/": "Helios — Everyday spatial assistance",
  "/product": "Product — Helios",
  "/why-helios": "Why Helios — Helios",
  "/guides": "Guides & Support — Helios",
  "/team": "Our Team — Helios",
  "/experience": "Try Helios — Helios",
  "/privacy": "Privacy & Data — Helios",
};
export default function App() {
  const [route, setRoute] = useState(getRoute);
  const backgroundRoute = useRef(getRoute().startsWith("/experience") ? "/" : getRoute());
  const drawerWasOpen = useRef(false);
  const returnFocus = useRef(null);
  const [menu, setMenu] = useState(false);
  const main = useRef(null);
  const headerTrigger = useRef(null);
  const menuToggle = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const first = useRef(true);
  const [reduce, setReduce] = useState(() => {
    try {
      const value = localStorage.getItem("helios-waymo-motion-v1");
      return value === null
        ? matchMedia("(prefers-reduced-motion: reduce)").matches
        : value === "reduced";
    } catch {
      return true;
    }
  });
  const [path, query = ""] = route.split("?");
  const rawPage = "/" + (path.split("/").filter(Boolean)[0] || "");
  const normalized =
    rawPage === "/get-involved"
      ? "/experience"
      : rawPage === "/how-it-works"
        ? "/guides"
        : rawPage;
  const mode = path.split("/")[2] || "test";
  const section = new URLSearchParams(query).get("section");
  useEffect(() => {
    function change() {
      const next = getRoute();
      if (!next.startsWith("/experience") && !next.startsWith("/get-involved")) backgroundRoute.current = next;
      setRoute(next);
      setMenu(false);
    }
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = pageTitles[normalized] || "Page not found — Helios";
    if (normalized === "/experience") {
      if (!drawerWasOpen.current) returnFocus.current = document.activeElement;
      drawerWasOpen.current = true;
      return;
    }
    if (drawerWasOpen.current) {
      drawerWasOpen.current = false;
      returnFocus.current?.focus?.({ preventScroll: true });
      return;
    }
    if (section)
      document
        .getElementById(section)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    else window.scrollTo({ top: 0, behavior: "instant" });
    if (!first.current) main.current?.focus({ preventScroll: true });
    first.current = false;
  }, [route, normalized, section]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduce);
    try {
      localStorage.setItem(
        "helios-waymo-motion-v1",
        reduce ? "reduced" : "full",
      );
    } catch {
      /* Preference still works without storage. */
    }
  }, [reduce]);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = (e) => {
      if (e.matches) setReduce(true);
    };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!menu) return;
    function escape(event) {
      if (event.key === "Escape") {
        setMenu(false);
        menuToggle.current?.focus();
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [menu]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(!entry.isIntersecting);
    });
    if (headerTrigger.current) observer.observe(headerTrigger.current);
    return () => observer.disconnect();
  }, []);
  const displayPage = normalized === "/experience"
    ? "/" + (backgroundRoute.current.split("?")[0].split("/").filter(Boolean)[0] || "")
    : normalized;
  let content;
  switch (displayPage) {
    case "/":
      content = <NewHome reduce={reduce} />;
      break;
    case "/product":
      content = <NewProduct />;
      break;
    case "/why-helios":
      content = <WhyHelios />;
      break;
    case "/guides":
      content = <Guides slug={mode === "test" ? "" : mode} />;
      break;
    case "/team":
      content = <NewTeam reduce={reduce} />;
      break;
    case "/experience":
      content = <Experience mode={mode} />;
      break;
    case "/privacy":
      content = <Privacy />;
      break;
    default:
      content = (
        <section className="page-hero container">
          <h1>A different path?</h1>
          <p>We couldn’t find that page.</p>
          <a className="button" href="#/">
            Back to Home
            <ArrowUpRight size={18} />
          </a>
        </section>
      );
  }
  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to main content
      </a>
      <div
        className="header-scroll-trigger"
        ref={headerTrigger}
        aria-hidden="true"
      />
      <header
        className={`site-header${scrolled ? " is-scrolled" : ""}${menu ? " menu-open" : ""}`}
      >
        <div className="nav-shell">
          <div className="container nav-inner">
            <button
              ref={menuToggle}
              className="icon-button menu-button"
              onClick={() => setMenu(!menu)}
              aria-expanded={menu}
              aria-controls="mobile-nav"
              aria-label={menu ? "Close menu" : "Open menu"}
            >
              {menu ? <X size={22} /> : <List size={22} />}
            </button>
            <Brand />
            <nav aria-label="Main navigation" className="desktop-nav">
              {nav.map(([url, label]) => (
                <a
                  key={url}
                  href={`#${url}`}
                  aria-current={normalized === url ? "page" : undefined}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="nav-actions">
              <a className="nav-cta" href="#/experience">
                Try Helios
              </a>
            </div>
          </div>
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            hidden={!menu}
            className="mobile-nav"
          >
            {nav.map(([url, label]) => (
              <a
                href={`#${url}`}
                key={url}
                aria-current={normalized === url ? "page" : undefined}
              >
                {label}
                <ArrowUpRight size={18} />
              </a>
            ))}
            <a href="#/experience">
              Try Helios
              <ArrowUpRight size={18} />
            </a>
            <a href="#/experience/partner">
              Partner with Us
              <ArrowUpRight size={18} />
            </a>
          </nav>
        </div>
      </header>
      <main id="main" className={displayPage === "/" ? "helios-home" : undefined} tabIndex={-1} ref={main} key={displayPage}>
        {content}
      </main>
      {normalized !== "/" && normalized !== "/experience" && normalized !== "/privacy" && normalized !== "/team" && normalized !== "/product" && normalized !== "/why-helios" && normalized !== "/guides" && (
        <section className="participate-section">
          <div className="container participate-inner">
            <h2>
              Help shape what
              <br />
              comes next.
            </h2>
            <div>
              <p>
                Interested in trying Helios? Explore a trial and prepare a note
                about what matters in your daily life.
              </p>
              <div className="button-row">
                <a className="button" href="#/experience">
                  Try Helios
                  <ArrowUpRight size={18} />
                </a>
                <a className="text-link" href="#/experience/partner">
                  Partner with Us
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
      <footer className="site-footer">
        <div className="container home-body-container footer-top">
          <div>
            <Brand footer />
            <p>More Awareness. More Confidence.<br />More Freedom.</p>
            <small>Wearable spatial assistance for blind<br />and low-vision people.</small>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <div>
              <span>Explore</span>
              <a href="#/product">Product</a>
              <a href="#/why-helios">Why Helios</a>
              <a href="#/guides">Guides &amp; Support</a>
            </div>
            <div>
              <span>Get involved</span>
              <a href="#/experience">Try Helios</a>
              <a href="#/experience/partner">Partner with Us</a>
              <a className="footer-privacy" href="#/privacy">Privacy &amp; Data</a>
            </div>
          </nav>
        </div>
        <div className="container home-body-container footer-bottom">
          <div>
            <span>© 2026 Helios.</span>
            <button
              className="back-top icon-button"
              aria-label="Back to top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: reduce ? "instant" : "smooth",
                })
              }
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </footer>
      <Dialog.Root open={normalized === "/experience"} onOpenChange={open => {
        if (!open) window.location.hash = backgroundRoute.current;
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="experience-overlay" />
          <Dialog.Content className="experience-drawer" aria-describedby="experience-description"
            onCloseAutoFocus={event => {
              event.preventDefault();
              returnFocus.current?.focus?.({ preventScroll: true });
            }}>
            <div className="experience-drawer-heading">
            <img className="experience-drawer-mark" src="./assets/helios-mark.webp" width="44" height="44" alt="" />
            <Dialog.Close className="icon-button experience-close" aria-label="Close experience form">
              <X size={22} />
            </Dialog.Close>
            <Dialog.Title>{mode === "partner" ? "Partner with Helios" : "Try Helios"}</Dialog.Title>
            <Dialog.Description id="experience-description">
              {mode === "partner" ? "Tell us what you would like to work on together." : "Tell us what you would like to explore."}
            </Dialog.Description>
            </div>
            <Experience mode={mode} compact />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </MotionConfig>
  );
}
