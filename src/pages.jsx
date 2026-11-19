import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Users,
  Headphones,
  DeviceMobile,
  Waveform,
  PersonSimpleWalk,
  Eye,
  Microphone,
  WifiHigh,
  WifiSlash,
  Warning,
  Scan,
  Download,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  HardwareDiagram,
  ProductPortrait,
  PageBanner,
  TextLink,
  Reveal,
  SectionHeading,
  SceneDemo,
  Wave,
  StatusMark,
} from "./components";
import { team, scenes, faqs } from "./data";

export function Home({ reduce }) {
  return (
    <>
      <PageBanner
        kind="home"
        image="home-walking"
        alt="Concept lifestyle scene of a person walking through a sunlit home, facing forward with a chest-mounted camera."
        eyebrow="HELIOS · WEARABLE SPATIAL ASSISTANCE"
        title={
          <>
            More Awareness.
            <br />
            More Confidence.
            <br />
            More Freedom.
          </>
        }
        text="Understand your surroundings. Find everyday objects. Build the confidence to do more on your own."
        note="AI-generated lifestyle concept · Not a user testimonial"
      >
        <TextLink to="/product">Explore Helios</TextLink>
      </PageBanner>
      <div className="feature-ribbon">
        <div className="container">
          <span>
            <Camera />
            Depth-aware sensing
          </span>
          <span>
            <Waveform />
            Timely voice guidance
          </span>
          <span>
            <Headphones />
            Hands-free interaction
          </span>
          <span>
            <Eye />
            Designed for daily life
          </span>
        </div>
      </div>
      <section className="sensory-story container section">
        <Reveal reduce={reduce} className="sensory-intro">
          <span className="eyebrow">BEYOND RECOGNITION</span>
          <h2>
            A world of detail.
            <br />
            <span className="gradient-text">A clearer sense of place.</span>
          </h2>
          <p>
            Knowing what is there is only the beginning. Helios helps you
            understand where it is, what is nearby, and what matters to your
            next move.
          </p>
          <TextLink to="/product">Discover the experience</TextLink>
        </Reveal>
        <Reveal reduce={reduce} className="everyday-photo">
          <figure>
            <img
              src="./assets/living-detail.webp"
              width="1400"
              height="788"
              loading="lazy"
              alt="A sunlit living room with natural materials and familiar everyday objects."
            />
            <figcaption>A familiar space. More of it on your terms.</figcaption>
          </figure>
        </Reveal>
      </section>
      <section className="experience-section">
        <div className="section container" id="experience">
          <Reveal reduce={reduce}>
            <SectionHeading
              title={
                <>
                  Find what
                  <br />
                  you need.
                </>
              }
              text="Looking for the remote? Ask Helios. Hear where it is and what is nearby, with distance information when reliable."
            />
            <SceneDemo reduce={reduce} />
          </Reveal>
        </div>
      </section>
      <section className="context-section section">
        <div className="container context-grid">
          <Reveal reduce={reduce}>
            <SectionHeading
              title={
                <>
                  The right information.
                  <br />
                  At the right time.
                </>
              }
              text="Helios adapts its guidance to your movement and your task, helping you focus on what matters now."
            />
            <TextLink to="/how-it-works">See How It Works</TextLink>
          </Reveal>
          <ContextExperience reduce={reduce} />
        </div>
      </section>
      <section className="possibility-section">
        <img
          src="./assets/living-detail.webp"
          width="1400"
          height="788"
          loading="lazy"
          alt="An open, light-filled living room with space to explore."
        />
        <div className="possibility-shade" />
        <div className="container possibility-copy">
          <Reveal reduce={reduce}>
            <h2>
              Small moments.
              <br />
              More possibilities.
            </h2>
            <p>
              Finding a familiar object. Understanding a changed room. Helios is
              designed to help you do more with less assistance—and build the
              confidence to explore more.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="section container home-team">
        <div>
          <SectionHeading
            title="Meet the people behind Helios."
            text="We bring together product design, computer vision, hardware, and operations to make spatial information easier to use in everyday life."
          />
          <TextLink to="/team">Meet Our Team</TextLink>
        </div>
        <img
          src="./assets/team/group.webp"
          alt="The five members of the Helios team together."
          width="1672"
          height="941"
          loading="lazy"
        />
      </section>
    </>
  );
}
function ContextExperience({ reduce }) {
  const [current, setCurrent] = useState(0);
  const states = [
    {
      icon: PersonSimpleWalk,
      title: "While you move",
      text: "Brief alerts draw attention to nearby obstacles.",
      feedback: "Brief. Relevant. Timely.",
    },
    {
      icon: Eye,
      title: "When you pause",
      text: "Hear about your surroundings or ask for more detail.",
      feedback: "A moment to understand more.",
    },
    {
      icon: Microphone,
      title: "When you ask",
      text: "Get guidance focused on the object or question you have in mind.",
      feedback: "Your task. Your information.",
    },
  ];
  return (
    <div className="context-experience">
      <div className="context-options">
        {states.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              className={current === i ? "selected" : ""}
              aria-pressed={current === i}
              onClick={() => setCurrent(i)}
            >
              <Icon size={24} />
              <span>
                <strong>{s.title}</strong>
                <small>{s.text}</small>
              </span>
              <ArrowUpRight size={18} />
            </button>
          );
        })}
      </div>
      <div className="context-feedback">
        <Wave />
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={reduce ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
          >
            {states[current].feedback}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
export function Product({ reduce, onManual }) {
  const [scene, setScene] = useState(0);
  return (
    <>
      <PageBanner
        kind="product"
        image="product"
        alt="Concept close-up of the stereo depth camera, neck mount and magnetic attachment."
        eyebrow="MEET HELIOS"
        title={
          <>
            Understand your space.
            <br />
            Keep your hands free.
          </>
        }
        text="A neck mount. A magnetic necklace. A depth camera. Connected to your smartphone."
        note="Product concept · Final hardware appearance may differ"
      ></PageBanner>
      <section className="section container">
        <SectionHeading title="Wear it. Connect it. Ask." />
        <ProductPortrait />
        <HardwareDiagram />
        <div className="device-explain">
          {[
            {
              icon: Camera,
              title: "A wearable setup",
              text: "A neck mount and magnetic necklace position the depth camera at your chest, leaving your hands free.",
            },
            {
              icon: DeviceMobile,
              title: "Your smartphone",
              text: "Runs the Helios app and coordinates sensing, tasks, and spoken feedback.",
            },
            {
              icon: Headphones,
              title: "Bluetooth earphones",
              text: "Let you hear guidance and make voice requests without holding your phone.",
            },
          ].map((d, i) => (
            <Reveal key={d.title} reduce={reduce} delay={i * 0.08}>
              <d.icon size={40} weight="duotone" />
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </Reveal>
          ))}
        </div>
        <p className="small-note">
          Use your own compatible smartphone. See the product manual for setup
          and compatibility details.
        </p>
      </section>
      <section className="section product-scenes">
        <div className="container">
          <SectionHeading title="Support for everyday moments." />
          <div className="scene-selector" aria-label="Product experiences">
            {scenes.map((s, i) => (
              <button
                aria-pressed={scene === i}
                className={scene === i ? "active" : ""}
                onClick={() => setScene(i)}
                key={s.name}
              >
                {s.name}
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
          <div className="product-scene-grid">
            <div className="scene-image">
              <img
                src={`./assets/${scene === 1 ? "living-detail" : "living-room"}.webp`}
                alt="An illustrative indoor scene for a Helios task."
                width="1400"
                height="900"
                loading="lazy"
              />
              <span
                className={`scene-focus focus-${scene}`}
                aria-hidden="true"
              />
            </div>
            <div className="product-scene-copy" aria-live="polite">
              <h3>{scenes[scene].title}</h3>
              <p>{scenes[scene].text}</p>
              <div className="sample-voice">
                <Microphone size={22} />
                <span>{scenes[scene].quote}</span>
              </div>
              <small>Example interaction · Scene illustration</small>
            </div>
          </div>
        </div>
      </section>
      <section className="section container setup-layout">
        <div>
          <SectionHeading title="From setup to your first task." />
          <div className="setup-steps">
            {[
              [
                "Connect",
                "Put on the camera and connect your phone and earphones.",
              ],
              [
                "Get ready",
                "Start Helios, complete the device checks, and pause for calibration.",
              ],
              [
                "Ask",
                "Use your voice to ask about your surroundings or find an object.",
              ],
              [
                "Listen and act",
                "Follow the feedback. Pause after moving to get a fresh view.",
              ],
            ].map(([title, text], i) => (
              <div key={title}>
                <span>{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="app-display">
          <div className="app-halo" />
          <img
            src="./assets/app-home.webp"
            alt="Actual Helios app startup screen with a large Start button."
            width="1080"
            height="2376"
            loading="lazy"
          />
          <span>Actual app screen · Before assistance starts</span>
        </div>
      </section>
      <section className="section conditions-section">
        <div className="container">
          <SectionHeading title="A few things to know." />
          <div className="conditions">
            {[
              [
                "Connection",
                "Scene descriptions and object finding need an internet connection. Local obstacle alerts can continue offline while the required sensors are working.",
              ],
              [
                "Distance",
                "Distance feedback depends on valid depth data. Helios lets you know when a reliable distance is unavailable.",
              ],
              [
                "Everyday support",
                "Helios works alongside a white cane and mobility training. It supports indoor tasks. Route navigation is outside its current scope.",
              ],
            ].map(([h, p]) => (
              <div key={h}>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
          <div className="manual-strip">
            <div>
              <h3>Product manual</h3>
              <p>Setup, voice commands, and troubleshooting in one guide.</p>
            </div>
            <button className="button secondary" onClick={onManual}>
              Product Manual (PDF)
              <Download size={18} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
export function HowItWorks({ reduce }) {
  const [moving, setMoving] = useState(true);
  const [layer, setLayer] = useState(0);
  const [network, setNetwork] = useState(true);
  const [priority, setPriority] = useState(false);
  return (
    <>
      <PageBanner
        kind="technology"
        image="technology-side"
        alt="Side view of a depth camera observing furniture, with matching RGB and depth images."
        eyebrow="HOW IT WORKS"
        title={
          <>
            Beyond what is there.
            <br />
            Toward what matters now.
          </>
        }
        text="Helios brings together images, depth, and motion to turn spatial information into timely spoken guidance."
        note="Concept visualization · Not live sensor output"
      />
      <section className="tech-stage section">
        <div className="container">
          <SectionHeading
            light
            title="An object. A location. More context."
            text="Knowing there is a cup is only part of the picture. Helios combines recognition with direction, depth, and nearby objects to make its location easier to understand."
          />
          <div className={`depth-scene layer-${layer}`}>
            <img
              src="./assets/spatial-room.webp"
              alt="Illustrative room with selectable spatial-information layers."
              width="1800"
              height="1157"
            />
            <div className="depth-grid" aria-hidden="true" />
            <div className="depth-target" aria-hidden="true" />
            {layer > 0 ? (
              <div className="depth-label">
                {
                  [
                    "",
                    "Direction in the view",
                    "Distance when depth is reliable",
                    "Nearby furniture as reference",
                  ][layer]
                }
              </div>
            ) : null}
            <span className="scene-illustration">
              Spatial information illustration
            </span>
          </div>
          <div
            className="layer-controls"
            aria-label="Spatial information layers"
          >
            {["Object", "Direction", "Distance", "Nearby Objects"].map(
              (l, i) => (
                <button
                  onClick={() => setLayer(i)}
                  aria-pressed={layer === i}
                  key={l}
                >
                  {layer === i ? <CheckCircle size={19} /> : <Scan size={19} />}{" "}
                  {l}
                </button>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="section container tech-two-col">
        <Reveal reduce={reduce}>
          <SectionHeading
            title="Guidance that moves with you."
            text="Motion sensors and changes in the camera view help Helios distinguish movement from stillness. It combines that information with your task to adjust its feedback."
          />
        </Reveal>
        <div className="motion-panel">
          <div className="pill-control">
            <button aria-pressed={moving} onClick={() => setMoving(true)}>
              Moving
            </button>
            <button aria-pressed={!moving} onClick={() => setMoving(false)}>
              Paused
            </button>
          </div>
          <div className="motion-symbol">
            {moving ? (
              <PersonSimpleWalk size={82} weight="duotone" />
            ) : (
              <Eye size={82} weight="duotone" />
            )}
          </div>
          <h3>
            {moving
              ? "Short, relevant obstacle alerts."
              : "A moment to understand more."}
          </h3>
          <p>
            {moving
              ? "Feedback stays brief while you move."
              : "Scene descriptions and fresh observations for object finding."}
          </p>
        </div>
      </section>
      <section className="priority-section section">
        <div className="container">
          <SectionHeading
            title="Urgent information comes first."
            text="An urgent warning can interrupt a scene description or search result. When the view changes, outdated results are stopped."
          />
          <div className="priority-layout">
            <div className="priority-order">
              {[
                "Urgent Warnings",
                "Movement Alerts",
                "Task Feedback",
                "Scene Descriptions",
              ].map((v, i) => (
                <div className={priority && i === 0 ? "highlight" : ""} key={v}>
                  <span>0{i + 1}</span>
                  {v}
                  {i === 0 ? <Warning size={22} /> : <Waveform size={22} />}
                </div>
              ))}
            </div>
            <div className="priority-demo">
              <Wave />
              <h3 aria-live="polite">
                {priority
                  ? "Urgent warning takes priority."
                  : "Scene description playing."}
              </h3>
              <p>
                {priority
                  ? "The ordinary description is paused to make room for the warning."
                  : "Higher-priority alerts can interrupt lower-priority speech."}
              </p>
              <button
                className="button secondary"
                onClick={() => setPriority(!priority)}
              >
                {priority ? "Reset Example" : "Show Priority Example"}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading title="Fast alerts. Richer understanding." />
        <div className="compute-grid">
          <div>
            <DeviceMobile size={36} weight="duotone" />
            <h3>On your phone</h3>
            <p>
              Immediate obstacle assessment runs locally, using camera, depth,
              and motion data.
            </p>
          </div>
          <div>
            <WifiHigh size={36} weight="duotone" />
            <h3>With cloud AI</h3>
            <p>
              Selected still images support scene questions and object finding.
            </p>
          </div>
        </div>
        <p className="small-note">
          Cloud tasks use selected images with permission, rather than a
          continuous video stream.
        </p>
        <div className="network-panel">
          <div>
            <h3>Clear feedback when conditions change.</h3>
            <p aria-live="polite">
              {network
                ? "Connected: cloud descriptions and object finding are available."
                : "No internet: cloud tasks pause. Local alerts can continue while the required sensors remain valid."}
            </p>
          </div>
          <button
            className="network-toggle"
            onClick={() => setNetwork((n) => !n)}
            aria-pressed={network}
            aria-label="Illustration: toggle network connection"
          >
            {network ? <WifiHigh size={24} /> : <WifiSlash size={24} />}{" "}
            {network ? "Connected" : "Offline"}
          </button>
        </div>
        <div className="fault-notes">
          <p>
            <strong>Unreliable depth</strong>Helios reports uncertainty instead
            of giving a precise distance.
          </p>
          <p>
            <strong>Camera disconnected</strong>Assistance stops, and Helios
            explains the problem.
          </p>
        </div>
      </section>
      <section className="section container tech-progress">
        <SectionHeading
          title="Built, checked, and refined."
          text="We use software checks and device testing to improve how Helios responds. Next, participant testing will help us assess everyday usefulness, comfort, and information load."
        />
        <TextLink to="/team">See Our Progress</TextLink>
      </section>
    </>
  );
}
export function Team({ reduce }) {
  return (
    <>
      <PageBanner
        kind="team"
        image="team"
        alt="Illustrative workshop showing collaborators discussing a wearable camera prototype."
        eyebrow="OUR TEAM"
        title={
          <>
            More possibility
            <br />
            starts with people.
          </>
        }
        text="Designing, building, and learning together—with everyday independence in mind."
        note="AI-generated collaboration scene · Actual team shown below"
      />
      <section className="section container purpose-copy">
        <h2>Everyday independence matters.</h2>
        <div>
          <p>
            A missing remote. A chair moved into a walkway. Small changes can
            mean more searching or another request for help.
          </p>
          <p>
            We started Helios to make useful spatial information easier to
            access, with guidance that fits the moment.
          </p>
        </div>
      </section>
      <section className="section team-members-section">
        <div className="container">
          <figure className="team-photo actual-team-photo">
            <img
              src="./assets/team/group.webp"
              alt="The five members of the Helios team together."
              width="1672"
              height="941"
              loading="lazy"
            />
            <figcaption>The Helios team</figcaption>
          </figure>
          <SectionHeading title="Meet the team." />
          <div className="team-grid">
            {team.map((m, i) => (
              <Reveal key={m.name} reduce={reduce} delay={i * 0.04}>
                <article className="member">
                  <div className="member-portrait real-portrait">
                    <img
                      src={m.photo}
                      alt={`${m.name}, ${m.role}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="member-title">
                    <h3>{m.name}</h3>
                    <span>{m.role}</span>
                  </div>
                  <span className="member-area">{m.area}</span>
                  <p>{m.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section container iteration-grid">
        <div>
          <SectionHeading
            title="Learn. Build. Try again."
            text="We define everyday tasks, connect the hardware and software, and check the experience on the device. Each issue we find helps guide the next improvement."
          />
        </div>
        <div className="iteration-story">
          <Waveform size={34} />
          <h3>Making descriptions easier to hear.</h3>
          <p>
            An early version repeatedly cut off a scene description while the
            device was still. We traced the problem, adjusted the movement
            logic, and checked that the description could play through.
          </p>
        </div>
      </section>
      <section className="section progress-section" id="progress">
        <div className="container">
          <SectionHeading title="Where we are today." />
          <div className="progress-grid">
            <div>
              <StatusMark>Built and checked</StatusMark>
              <h3>
                A working product.
                <br />A foundation to build on.
              </h3>
              <p>
                The smartphone app has been developed, bringing together
                sensing, voice interaction, scene understanding, and object
                finding. A documented development version passed 500 software
                tests, alongside checks of selected device workflows.
              </p>
            </div>
            <div>
              <span className="next-mark">NEXT</span>
              <h3>
                Real-life feedback.
                <br />
                More room to improve.
              </h3>
              <p>
                We plan research with at least 20 blind or low-vision
                participants and controlled pilots with 2–5 organizations. Their
                feedback will help us improve comfort, task support, and
                confidence in use.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function GetInvolved({ mode, onPrivacy }) {
  const partner = mode === "partner";
  return (
    <>
      <PageBanner
        kind="involved"
        image="home-walking"
        alt="Illustrative home environment for exploring everyday use of Helios."
        eyebrow="LET’S MAKE IT BETTER, TOGETHER"
        title={<>Help shape Helios.</>}
        text="Share your everyday needs, apply to try the product, or explore a collaboration with our team."
        note="AI-generated lifestyle concept"
      />
      <section className="container involved-layout">
        <aside className="involved-aside">
          <div className="involved-tabs">
            <a
              href="#/get-involved/test"
              aria-current={!partner ? "page" : undefined}
            >
              <Eye size={24} />
              <span>
                Product Testing
                <small>Experience Helios in everyday tasks.</small>
              </span>
              <ArrowUpRight size={20} />
            </a>
            <a
              href="#/get-involved/partner"
              aria-current={partner ? "page" : undefined}
            >
              <Users size={24} />
              <span>
                Partner with Us<small>Bring your ideas and expertise.</small>
              </span>
              <ArrowUpRight size={20} />
            </a>
          </div>
          <div className="aside-note">
            <Headphones size={32} weight="duotone" />
            <h3>Your perspective matters.</h3>
            <p>
              Everyday needs and honest feedback can help us make Helios more
              useful.
            </p>
          </div>
        </aside>
        <div className="form-area">
          <div className={partner ? "hidden-form" : ""} hidden={partner}>
            <ContactForm kind="test" onPrivacy={onPrivacy} />
          </div>
          <div className={!partner ? "hidden-form" : ""} hidden={!partner}>
            <ContactForm kind="partner" onPrivacy={onPrivacy} />
          </div>
        </div>
      </section>
      <section className="section container faq-section">
        <SectionHeading title="Before you apply." />
        <div className="faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
export function ContactForm({ kind, onPrivacy, compact = false }) {
  const endpoint = "";
  const isTest = kind === "test";
  const [channel, setChannel] = useState("email");
  const [state, setState] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const [request, setRequest] = useState(null);
  const form = useRef(null);
  const feedbackRef = useRef(null);
  async function submit(event) {
    event.preventDefault();
    if (state === "sending") return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const payload = { type: kind, ...data };
    if (!endpoint) {
      setRequest(payload);
      setFeedback(
        "Your request is ready to download. Nothing has been sent to the Helios team.",
      );
      setState("prepared");
      return;
    }
    setState("sending");
    setFeedback("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const result = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!result.ok) throw Error("send");
      setState("success");
      setFeedback(
        isTest
          ? "Thank you for your interest. We will review your application and contact you about possible testing arrangements."
          : "Thank you for getting in touch. Our team will review your message and follow up using the contact details you provided.",
      );
    } catch {
      setState("error");
      setFeedback(
        "We couldn’t send your form. Your entries are still here. Please try again.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
  function download() {
    const file = new Blob([JSON.stringify(request, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helios-${kind}-request.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);
  return (
    <div className="contact-form-wrap">
      {!compact && <h2>
        {isTest
          ? "Your trial interests"
          : "Your collaboration idea"}
      </h2>}
      {!compact && <p>
        {isTest
          ? "Describe a situation you would like to explore with Helios."
          : "Share your area of interest and what you would like to contribute."}
      </p>}
      {!endpoint ? (
        <p className="preview-notice">
          <Download size={19} aria-hidden="true" />
          Download a copy of your interests to your device. This form does not
          send information to the Helios team.
        </p>
      ) : null}
      <form
        ref={form}
        onSubmit={submit}
        onChange={() => {
          if (state !== "sending") {
            setState("idle");
            setFeedback("");
            setRequest(null);
          }
        }}
      >
        <p className="required-note">Fields marked * are required.</p>
        <div className="field-row">
          <label>
            Your name *
            <input required name="name" autoComplete="name" maxLength={100} />
          </label>
          <label>
            Contact method *
            <select
              name="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </label>
        </div>
        <div className="field-row">
          <label>
            {channel === "email" ? "Email address" : "Phone number"} *
            <input
              key={channel}
              type={channel === "email" ? "email" : "tel"}
              name="contact"
              required
              autoComplete={channel === "email" ? "email" : "tel"}
              maxLength={180}
              placeholder={
                channel === "phone" ? "Include your country code" : undefined
              }
            />
          </label>
          {isTest && !compact ? (
            <label>
              City *
              <input
                required
                name="city"
                autoComplete="address-level2"
                maxLength={120}
              />
            </label>
          ) : !isTest ? (
            <label>
              Organization <span>(optional)</span>
              <input
                name="organization"
                autoComplete="organization"
                maxLength={180}
              />
            </label>
          ) : null}
        </div>
        {isTest ? (
          <>
            <label>
              What would you like to try? *
              <textarea
                name="task"
                required
                rows={3}
                maxLength={2000}
                placeholder="Tell us about an everyday task you would like help with."
              />
            </label>
            {!compact && <label>
              I am interested on behalf of <span>(optional)</span>
              <select name="identity">
                <option value="">Choose an option</option>
                {[
                  "Myself",
                  "A family member or supporter",
                  "A professional",
                  "An organization",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>}
            {!compact && <label>
              Anything else? <span>(optional)</span>
              <textarea
                name="message"
                rows={3}
                maxLength={2000}
                placeholder="Questions or access needs you would like to include."
              />
            </label>}
          </>
        ) : (
          <>
            <label>
              Area of interest *
              <select required name="interest" defaultValue="">
                <option value="" disabled>
                  Choose an area of interest
                </option>
                {[
                  "Product Testing",
                  "Professional Feedback",
                  "Technical Collaboration",
                  "Accessibility Activities",
                  "Other",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Your idea *
              <textarea
                required
                name="message"
                rows={5}
                maxLength={3000}
                placeholder="Tell us a little about what you have in mind."
              />
            </label>
          </>
        )}
        <p className="form-privacy">
          {isTest
            ? "Include only the contact details and interests you want in your downloaded file."
            : "Include only the information you want in your downloaded file."}{" "}
          <button type="button" className="inline-button" onClick={onPrivacy}>
            Privacy &amp; Data
          </button>
        </p>
        <button className="button" type="submit" disabled={state === "sending"}>
          {state === "sending"
            ? "Sending…"
            : endpoint
              ? isTest
                ? "Submit Application"
                : "Send Message"
              : "Prepare Request"}
          <ArrowUpRight size={19} />
        </button>
        {feedback ? (
          <div
            className={`form-feedback ${state}`}
            ref={feedbackRef}
            tabIndex={-1}
            role="status"
          >
            {state === "success" ? (
              <h3>{isTest ? "Application received." : "Message received."}</h3>
            ) : null}
            <p>{feedback}</p>
            {state === "prepared" ? (
              <button
                className="button secondary"
                type="button"
                onClick={download}
              >
                <Download size={18} />
                Download Request
              </button>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
