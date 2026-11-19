import { PersonSimpleWalk, WarningCircle, Microphone, PlugsConnected, Moon } from "@phosphor-icons/react";
import "@fontsource/baskervville/latin-400.css";
import { motion } from "motion/react";
import { useEffect } from "react";
import { TextLink } from "./components";
import { team } from "./data";
import { ContactForm } from "./pages";
import RoomStory from "./RoomStory";
import ProductSystem from "./ProductSystem";
import ProductCapabilities from "./ProductCapabilities";
import ProductTasks from "./ProductTasks";
import GuidesPage from "./GuidesPage";
import PixelCard from "./vendor/PixelCard";
const A = "./assets/";
export function Photo({ name, alt, note, priority = false, className = "" }) {
  return (
    <figure className={`editorial-photo ${className}`}>
      <img
        src={`${A}${name}`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      {note && <figcaption>{note}</figcaption>}
    </figure>
  );
}
function Intro({ label, title, text }) {
  return (
    <section className="container editorial-intro">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
export function NewHome({ reduce = false }) {
  useEffect(() => {
    if (reduce) return;
    const elements = document.querySelectorAll(
      [
        ".helios-home .home-value-copy > *",
        ".helios-home .home-value-row > figure",
        ".helios-home .editorial-team-teaser > figure",
        ".helios-home .editorial-team-teaser > div:not(.home-team-invitation) > *",
        ".helios-home .home-team-invitation > h2",
        ".helios-home .home-team-invitation > div > *",
      ].join(", "),
    );
    let frame = 0;
    const pending = new Set(elements);
    const measure = () => {
      frame = 0;
      for (const element of pending) {
        const top = element.getBoundingClientRect().top;
        const reveal = Math.max(0, Math.min(1, (window.innerHeight * 0.96 - top) / (window.innerHeight * 0.40)));
        element.style.setProperty("--reveal-progress", reveal);
        if (reveal === 1) {
          element.classList.add("is-revealed");
          pending.delete(element);
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    for (const element of elements) element.classList.add("home-reveal");
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      for (const element of elements) {
        element.classList.remove("home-reveal", "is-revealed");
        element.style.removeProperty("--reveal-progress");
      }
    };
  }, [reduce]);
  return (
    <>
      <section className="editorial-home">
        <img
          className="home-scene"
          src={`${A}home-wearing-v8.webp`}
          alt="Helios wearer in sunglasses, with a compact camera supported from below, concealed magnetic necklace, and cable connected to a phone in the same-side pocket."
          fetchPriority="high"
        />
        <div className="container home-copy">
          <h1
            className="home-slogan"
            aria-label="More Awareness. More Confidence. More Freedom."
          >
            {["Awareness", "Confidence", "Freedom"].map((word, index) => (
              <span
                className={`slogan-line slogan-line-${index + 1}`}
                key={word}
                aria-hidden="true"
                style={{ "--line-delay": `${index * 64}ms` }}
              >
                <span className="slogan-more">More</span>{" "}
                <span className="slogan-word">
                  {word}
                  <span className="slogan-period">.</span>
                </span>
              </span>
            ))}
          </h1>
        </div>
      </section>
      <RoomStory reduce={reduce} />
      <section className="home-values" aria-label="Awareness, confidence and freedom">
        <div className="container home-body-container">
          <article className="home-value-row">
            <div className="home-value-copy">
              <h2>More<br /><span>Awareness.</span></h2>
              <p><strong>Your hands stay free.</strong> The camera on your chest captures colour and measures depth.
                Its motion sensor (IMU) helps Helios tell when you’re walking
                and when you’ve stopped.</p>
              <TextLink to="/product?section=hardware">Explore the sensing system</TextLink>
            </div>
            <figure className="editorial-photo home-understanding-image">
              <img src={`${A}home-awareness-v5.webp`} loading="lazy" width="1448" height="1086"
                alt="Close-up of the obround depth camera with colour, depth and motion sensing illustrations." />
              <figcaption className="home-sensor-labels">
                <span>RGB · colour</span><span>Depth · distance</span><span>IMU · motion</span>
              </figcaption>
            </figure>
          </article>
          <article className="home-value-row home-value-row-reverse">
            <div className="home-value-copy">
              <h2>More<br /><span>Confidence.</span></h2>
              <p><strong>A heads-up about the chair ahead.</strong> As you walk, Helios keeps alerts brief. When you
                pause and ask about the room, a cloud-based language model
                describes how the furniture is arranged. Urgent alerts take
                priority over longer descriptions.</p>
              <TextLink to="/guides">Understand the feedback</TextLink>
            </div>
            <Photo name="home-confidence.webp"
              alt="A chair and dining table are outlined in the foreground, with a sofa farther back." />
          </article>
          <article className="home-value-row">
            <div className="home-value-copy">
              <h2>More<br /><span>Freedom.</span></h2>
              <p><strong>“What’s in front of me?”</strong> Pause beside a sculpture and
                ask Helios to describe it. Listen through your earphones, then
                decide what you’d like to explore next.</p>
              <TextLink to="/why-helios">Explore everyday possibilities</TextLink>
            </div>
            <Photo name="home-freedom-gallery.webp"
              alt="A visitor wearing Helios pauses beside the curved edge of a sculpture in a sunlit gallery." />
          </article>
        </div>
      </section>
      <section className="container home-body-container section editorial-team-teaser">
        <Photo
          name="team/group.webp"
          alt="The five members of the Helios team."
        />
        <div>
          <h2>Room for your own decisions.</h2>
          <p>
            Our team starts with a question: what would you want to know about
            this space? That shapes when Helios speaks, how much it says,
            and when it stays quiet.
          </p>
          <TextLink to="/team">Meet our team</TextLink>
        </div>
        <div className="home-team-invitation">
          <h2>Help shape what comes next.</h2>
          <div>
            <p>
              What would you like to try with Helios? Prepare a trial request
              for yourself or explore a partnership with your organisation.
            </p>
            <div className="button-row">
              <a className="button" href="#/experience">Try Helios</a>
              <TextLink to="/experience/partner">Partner with Us</TextLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
const appFeatures = [
  { Icon: Microphone, title: <>Just say<br /><span className="wake-phrase">“Hi Helios”.</span></>, text: "Scene descriptions, more detail and object finding.", type: "voice" },
  { Icon: PersonSimpleWalk, title: "Feedback that adapts.", text: "Motion-aware spoken obstacle alerts.", type: "motion" },
  { Icon: WarningCircle, title: "Urgent alerts first", text: "Important warnings take priority.", type: "priority" },
  { Icon: PlugsConnected, title: "Automatic checks", text: "Connected devices, monitored.", type: "devices" },
  { Icon: Moon, title: "Assistance continues", text: "Screen off. Another app open.", type: "background" },
];

export function NewProduct() {
  return (
    <div className="product-page">
      <section className="product-banner">
        <img src="./assets/product-banner-v3.webp" alt="Helios neck mount, magnetic pendant, depth camera connected to a phone, and Bluetooth earphones." fetchPriority="high" />
        <div className="container"><span className="eyebrow">The Helios system</span><h1>Small parts.<br />A wider perspective.</h1></div>
      </section>
      <ProductSystem />
      <ProductCapabilities />
      <section id="app" className="container section product-app product-app-overview">
        <div>
          <span className="eyebrow">The app</span>
          <h2>Assistance on your phone.</h2>
          <ul className="app-feature-bento" aria-label="Helios app features">
            {appFeatures.map(({ Icon, title, text, type }, index) => (
              <motion.li
                key={type}
                className={`app-bento-${type}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
              >
                <PixelCard
                  theme="light"
                  intro={false}
                  clickPulse={false}
                  noFocus
                  trigger="hover"
                  gap={8}
                  pixelSize={3}
                  opacity={0.22}
                  spotlight={0}
                  glow={0}
                  colors={type === "motion" || type === "background" ? ["#7b9aaa", "#adc0c9", "#d0dce2"] : ["#819c8b", "#a8bdaa", "#c6d5c8"]}
                />
                <Icon size={28} weight="duotone" aria-hidden="true" />
                {type === "voice" && <div className="app-bento-wave" aria-hidden="true">
                  {[10, 17, 28, 42, 30, 15, 7, 20, 35, 48, 31, 14, 8, 18, 28, 16, 7].map((height, i) => <i key={i} style={{ height }} />)}
                </div>}
                <div><h3>{title}</h3><p>{text}</p></div>
              </motion.li>
            ))}
          </ul>
          <TextLink to="/guides?section=app-demo">Guides &amp; Support</TextLink>
        </div>
        <figure className="product-app-screen"><img src="./assets/app-home.webp" alt="Helios app home screen with its Start assistance control." loading="lazy" width="873" height="1920" /></figure>
      </section>
      <ProductTasks />
      <section id="details" className="section container product-details">
        <div className="product-details-heading"><span className="eyebrow">Before you begin</span><h2>The details that matter.</h2><p>Device requirements and current support.</p><TextLink to="/privacy">Privacy &amp; Data</TextLink></div>
        <div className="product-detail-list">
          <dl>
            <div><dt>Camera</dt><dd>Orbbec Gemini 2 · 90 × 25 × 30 mm.<br /><a href="https://www.orbbec.com/products/structured-light-camera/gemini-2/" target="_blank" rel="noreferrer">Manufacturer specifications ↗</a></dd></div>
            <div><dt>Phone</dt><dd>USB Host / OTG and Bluetooth audio are required. Compatibility varies by phone model and system version.</dd></div>
            <div><dt>Connection &amp; power</dt><dd>A USB data cable is required. Some phones may need an external power accessory for the camera.</dd></div>
            <div><dt>Bluetooth earphones</dt><dd>Audio playback and a microphone are required for spoken feedback and voice questions. Compatibility varies by device combination.</dd></div>
            <div><dt>App access</dt><dd>Requires microphone and connected-device access. Background access enables assistance with the screen off.</dd></div>
            <div><dt>Internet</dt><dd>Scene understanding and object finding require internet access.</dd></div>
            <div><dt>AI models</dt><dd>Helios currently uses the DeepSeek API for cloud-assisted understanding and can be adapted to work with other large language models.</dd></div>
          </dl>
          <details className="product-use-note">
            <summary>Capabilities and limits</summary>
            <div className="product-use-note-body">
              <p>Recognition and distance estimates vary with lighting, visibility and camera connection. Continue using your usual mobility aids.</p>
              <p>Helios does not provide route planning. Suspected-fall alerts are local only, with no automatic calls or messages.</p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
export { default as WhyHelios } from "./WhyHelios";
export function Guides({ slug }) {
  return <GuidesPage slug={slug} />;
}
export function NewTeam({ reduce = false }) {
  const entrance = {
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  };
  return (
    <div className="team-page">
      <section className="team-banner">
        <div className="container">
          <motion.h1 {...entrance}>Behind Helios</motion.h1>
        </div>
      </section>
      <motion.section {...entrance} className="container team-story">
        <h2>Helping people understand<br />the space around them</h2>
        <div className="team-story-layout">
          <Photo name="team/group.webp" alt="The five Helios team members together." />
          <div className="team-story-copy">
            <p className="team-story-intro">We’re a team of five bringing together product design, sensing technology and spoken feedback to build wearable spatial assistance for blind and low-vision people.</p>
            <div className="team-principles">
        {[
          [
            "Start with everyday tasks",
            "Finding an object or understanding an unfamiliar room gives us a concrete starting point for design.",
          ],
          [
            "Respect individual choices",
            "We design feedback to help people understand their surroundings and decide what to do next.",
          ],
          [
            "Test and refine",
            "We test hardware and software together, then use what we learn to improve the experience.",
          ],
        ].map(([h, p]) => (
          <div key={h}>
            <h3>{h}</h3>
            <p>{p}</p>
          </div>
        ))}
            </div>
          </div>
        </div>
      </motion.section>
      <section className="container section team-people">
        <motion.div {...entrance} className="team-section-heading">
          <h2>Meet the team</h2>
        </motion.div>
        <div className="team-grid">
          {team.map((m) => (
            <motion.article {...entrance} className="member" key={m.name}>
              <div className="member-portrait real-portrait">
                <img src={m.photo} alt={m.name} loading="lazy" />
              </div>
              <div className="member-title">
                <h3>{m.name}</h3>
                <span>{m.role}</span>
              </div>
              <p>{m.text}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <motion.section {...entrance} className="container team-next">
        <div>
          <h2>Help shape Helios</h2>
          <p>We welcome perspectives from blind and low-vision people, accessibility professionals and technology partners.</p>
        </div>
        <div className="team-next-links">
          <a className="button" href="#/experience/partner">Partner with Us</a>
          <TextLink to="/product">Explore Helios</TextLink>
        </div>
      </motion.section>
    </div>
  );
}
export function Experience({ mode, compact = false }) {
  const partner = mode === "partner";
  return (
    <div className="experience-page">
      {!compact && <Intro
        label={partner ? "Partner with Us" : "Try Helios"}
        title={partner ? "Make more possible, together." : "What would you like to explore?"}
        text={partner ? "Bring your experience in accessibility, research or technology. Tell us where you see an opportunity to work together." : "Finding something at home. Understanding a new space. Tell us where Helios could make a difference in your day."}
      />}
      <section className="container involved-layout">
        <aside className="involved-aside">
          <div className="involved-tabs">
            <a href="#/experience" aria-current={!partner ? "page" : undefined}>
              For individuals
            </a>
            <a
              href="#/experience/partner"
              aria-current={partner ? "page" : undefined}
            >
              For organisations
            </a>
          </div>
          {!compact && <p>
            Prepare a note about your interests and download a copy to keep.
            You can review Privacy & Data for details about how this form works.
          </p>}
          {!compact && <TextLink to="/product">Back to the product</TextLink>}
        </aside>
        <div className="form-area">
          <div hidden={partner}>
            <ContactForm
              kind="test" compact={compact}
              onPrivacy={() => (location.hash = "/privacy")}
            />
          </div>
          <div hidden={!partner}>
            <ContactForm
              kind="partner" compact={compact}
              onPrivacy={() => (location.hash = "/privacy")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
export function Privacy() {
  const sections = [
    [
      "Processing on your phone",
      "Helios uses colour images, depth measurements and motion data to provide spatial assistance. Immediate obstacle assessment and speech recognition run on your phone. Regular voice interactions do not save raw audio recordings.",
    ],
    [
      "When you use cloud features",
      "Helios currently uses the DeepSeek API for cloud-assisted understanding. These features require cloud processing, and the app currently has no separate setting to disable it. Relevant request data is sent to the service for processing. DeepSeek’s privacy terms apply to the data it receives. Support for other large language models is planned.",
    ],
    [
      "Data stored on your phone",
      "App settings and service credentials are stored locally. Standard scene-description requests do not save image files on your phone.",
    ],
    [
      "Ending an assistance session",
      "End the assistance session in the app to stop Helios from using the camera and microphone. Assistance continues when you switch to another screen or turn off the phone’s display.",
    ],
    [
      "Website forms and downloads",
      "Information entered in the trial and partnership forms stays in the current page. Preparing a request creates a file that you can download to your device. This action does not send an application or your form entries to the Helios team. Refreshing or leaving the page clears the draft. Files you have downloaded remain on your device until you delete them.",
    ],
  ];
  return (
    <>
      <Intro
        label="Privacy & Data"
        title="Know what you share."
        text="Understand how the Helios app and this website use data, what is stored on your device, and when information is shared."
      />
      <article className="container privacy-article">
        {sections.map(([h, p]) => (
          <section key={h}>
            <h2>{h}</h2>
            <p>{p}</p>
          </section>
        ))}
        <section>
          <h2>Images, resources and licenses</h2>
          <p>
            The official Gemini 2 photograph on the Product page is sourced from{" "}
            <a href="https://store.orbbec.com/products/gemini-2">
              Orbbec’s official product page
            </a>
            . Copyright remains with Orbbec. Team and prototype photographs are
            supplied by the Helios team. Other product and scene illustrations
            are created for this website.
          </p>
          <p>
            Third-party software and retained resources keep their original
            license and attribution notices.
          </p>
        </section>
        <TextLink to="/guides">Back to Guides & Support</TextLink>
      </article>
    </>
  );
}
