import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, Microphone, SpeakerHigh, CaretDown, X, Bluetooth } from "@phosphor-icons/react";
import AppStartDemo from "./AppStartDemo";
import { TextLink } from "./components";
import "./guides.css";

const guides = {
  "getting-started": {
    label: "Wearing & connection", title: "Get the fit. Make the connection.", lead: "Prepare your wearable, phone and earphones before starting assistance.",
    steps: [
      ["Secure the neck mount", "Wear the magnetic necklace inside your clothing, with the pendant behind the mount’s contact point. Align the mount on the outside so the magnetic connection holds it in place."],
      ["Position the camera", "Keep the camera at your chest, facing forward on its support. Make sure clothing, hair and the cable do not cover the lenses. Check that the mount stays in position as you move."],
      ["Connect and arrange the cable", "Connect the camera to your phone with a USB-C data cable. Place the phone in a pocket on the cable side. Leave enough slack for comfortable movement without pulling on either connector, and keep loose cable out of the way."],
      ["Connect your earphones", "Pair your Bluetooth earphones with the phone. Confirm that sound plays through them and their microphone is available. Choose a comfortable volume that lets you remain aware of your surroundings."],
      ["Allow the required access", "When the app requests access to the camera device and microphone, allow it. Keep internet access available for scene understanding and object finding. Follow any spoken prompts about the connection or camera position."]
    ]
  },
  voice: {
    label: "Voice & feedback", title: "Ask. Listen. Continue.", lead: "Begin every voice request with “Hi Helios”. Let the spoken feedback guide the next step.",
    steps: [
      ["Ask about a place", "Say “Hi Helios, what kind of place am I in?” Keep the camera facing the space you want to understand. Scene understanding requires internet access."],
      ["Find an object", "Say “Hi Helios, help me find my keys.” Name the item clearly and respond if Helios asks you to clarify it. Listen for its position and nearby reference points; distance is given when reliable."],
      ["Ask for more detail", "Begin your next request with “Hi Helios” and name what you want to know. If the view has changed, pause and let the camera observe the space again."],
      ["Respond to urgent feedback", "An urgent warning may interrupt a description or object search. Attend to the warning first and use your usual mobility aids and judgment."],
      ["Respond to a fall check-in", "If Helios detects a possible fall, it asks how you are. Reply to the prompt. If you ask for help or do not respond, it can sound a local help prompt to draw attention nearby."]
    ]
  },
  troubleshooting: {
    label: "Troubleshooting", title: "Let’s check the essentials.", lead: "Start with the connection, permissions and audio. Follow any spoken instructions from the app.",
    steps: [
      ["The camera is not connecting", "Check both ends of the USB data cable and allow camera-device access when prompted. Your phone needs USB Host / OTG support; some combinations may need an external power accessory. Reconnect and follow the app’s prompts before restarting assistance."],
      ["I cannot hear the feedback", "Check the phone’s media volume and Bluetooth connection. Confirm that audio is playing through your intended earphones, then check their charge."],
      ["Helios does not respond to my voice", "Confirm assistance is running, allow microphone access and check the earphone microphone. Say “Hi Helios” before your request. A quieter setting may help."],
      ["Scene questions or finding are unavailable", "Check your internet connection. Scene understanding and object finding use cloud processing. Local obstacle feedback depends on a working camera, sensors and an active assistance session."],
      ["An object or distance is unclear", "Check for covered lenses and adjust the camera’s view. Lighting and visibility can affect recognition. An unsuccessful search does not confirm that an object is absent or a path is clear."],
      ["Assistance stops with the screen off", "Check that the phone allows Helios to run in the background and review its battery restrictions. Keep the camera connected. Follow any app prompts before continuing."]
    ]
  }
};
function GuideLink({ guide, children }) {
  const article = guides[guide];
  return <Dialog.Root>
    <Dialog.Trigger className="text-link guides-modal-trigger">{children}<ArrowRight size={20} aria-hidden="true"/></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="guide-modal-overlay" />
      <Dialog.Content className="guide-modal">
        <div className="guide-modal-bar"><span className="guide-modal-brand"><img src="./assets/helios-mark.webp" alt=""/>Helios <span>Guides &amp; Support</span></span><Dialog.Close className="guide-modal-close" aria-label="Close guide"><X size={22}/></Dialog.Close></div>
        <div className="guide-modal-scroll">
          <header className="guide-modal-cover"><div className="guide-modal-kicker"><span className="eyebrow">{article.label}</span><span>{article.steps.length} steps</span></div><Dialog.Title>{article.title}</Dialog.Title><Dialog.Description>{article.lead}</Dialog.Description></header>
          <ol className="guide-modal-steps">{article.steps.map(([title,text],i)=><li key={title}><span className="guides-number" aria-hidden="true">{String(i+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
          <div className="guide-modal-footer"><Dialog.Close className="guide-modal-done">Back to the page<ArrowRight size={18} aria-hidden="true"/></Dialog.Close></div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export default function GuidesPage({ slug }) {
  const reduced = useReducedMotion();
  const [currentSection, setCurrentSection] = useState("setup");
  const sectionNav = useRef(null);
  useEffect(() => {
    if (slug) return;
    let frame;
    const update = () => {
      const boundary = (sectionNav.current?.getBoundingClientRect().bottom || 144) + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 40;
      let current = "setup";
      for (const id of ["setup", "app-demo", "voice", "help"]) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= boundary) current = id;
      }
      setCurrentSection(current);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, [slug]);
  useEffect(() => {
    const nav = sectionNav.current;
    const link = nav?.querySelector('[aria-current="location"]');
    if (nav && link && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - 16, behavior: reduced ? "instant" : "smooth" });
    }
  }, [currentSection, reduced]);
  const reveal = { initial: reduced ? false : { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .12 }, transition: { duration: .65 } };
  const article = guides[slug];
  if (slug) return <div className="guides-page guides-article">
    <header className="container guides-article-heading"><TextLink to="/guides">All guides</TextLink><span className="eyebrow">{article?.label || "Guides & Support"}</span><h1>{article?.title || "Let’s find the right guide."}</h1><p>{article?.lead || "Choose one of the available guides to continue."}</p></header>
    {article && <div className="container guides-article-layout"><nav aria-label="Other guides">{Object.entries(guides).map(([key,item])=><a key={key} href={`#/guides/${key}`} aria-current={key===slug?"page":undefined}>{item.label}<ArrowRight size={16}/></a>)}</nav><article>{article.steps.map(([title,text],i)=><section key={title}><span className="guides-number">{String(i+1).padStart(2,"0")}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}<TextLink to="/privacy">Privacy & Data</TextLink></article></div>}
  </div>;
  return <div className="guides-page">
    <header className="guides-hero"><div className="container guides-hero-grid"><div><span className="eyebrow">Guides & Support</span><h1>Get to know Helios.<br/>Make it part of<br/>your everyday.</h1></div><figure><img src="./assets/guides-banner-v3.webp" alt="Helios equipment arranged for setup, with the depth camera connected to a phone and earphones alongside." fetchPriority="high"/></figure></div></header>
    <nav ref={sectionNav} className="container guides-contents" aria-label="On this page">{[["setup","Before you begin"],["app-demo","Start & stop"],["voice","Voice & feedback"],["help","Troubleshooting"]].map(([id,title],i)=><a href={`#/guides?section=${id}`} key={id} aria-current={currentSection === id ? "location" : undefined}><span>0{i+1}</span>{title}<ArrowDown size={16}/></a>)}</nav>
    <section id="setup" className="container guides-section"><motion.div {...reveal} className="guides-section-heading"><span className="eyebrow">Before you begin</span><h2>Three things to get ready.</h2></motion.div><div className="guides-mobile-system" role="img" aria-label="Wearable connected to the phone by USB-C; phone connected to earphones by Bluetooth">
      <div className="guides-mobile-system-pictures">{["wearable", "phone", "earphones"].map(item=><img key={item} src={`./assets/guides-${item}-${item === "phone" ? "v2" : "v1"}.webp`} alt="" loading="lazy"/>)}
      <svg className="guides-mobile-system-wire" viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true"><path className="guides-usb-cable" d="M61 69 H72 Q78 69 78 75 V81 H150 V75"/><path className="guides-usb-data" d="M61 69 H72 Q78 69 78 75 V81 H150 V75"/></svg><Bluetooth className="guides-mobile-system-bluetooth" size={22} aria-hidden="true"/></div>
      <div className="guides-mobile-system-labels"><span>Wearable</span><span>Phone</span><span>Earphones</span></div><p>USB-C data · Bluetooth audio</p>
    </div><div className="guides-preparation">{[
      ["01","Your wearable.","The Helios camera, neck mount and magnetic necklace.", "wearable"],
      ["02","Your phone.","A compatible phone and a USB-C data cable.", "phone"],
      ["03","Your earphones.","Bluetooth earphones with audio playback and a microphone.", "earphones"]
    ].map(([number,title,text,image])=><motion.article {...reveal} key={number}><figure className="guides-kit-image"><img src={`./assets/guides-${image}-${image === "phone" ? "v2" : "v1"}.webp`} alt={text} loading="lazy" width="1448" height="1086"/>
      {image === "wearable" && <div className="guides-usb-link" aria-label="USB-C data connection to the phone"><svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path className="guides-usb-cable" d="M0 12 H16 Q32 12 32 34 V62 Q32 80 52 80 H380 Q400 80 400 60 V35"/><path className="guides-usb-data" d="M0 12 H16 Q32 12 32 34 V62 Q32 80 52 80 H380 Q400 80 400 60 V35"/><rect x="-3" y="8" width="14" height="8" rx="2" fill="#313838"/><rect x="395" y="27" width="10" height="16" rx="3" fill="#313838"/></svg><span>USB-C · Data</span></div>}
      {image === "phone" && <div className="guides-bluetooth-link" aria-label="Bluetooth audio connection to the earphones"><i/><Bluetooth size={28} weight="regular" aria-hidden="true"/><i/><span>Bluetooth</span></div>}
      </figure><div className="guides-kit-copy"><span className="guides-number">{number}</span><h3>{title}</h3><p>{text}</p></div></motion.article>)}</div><GuideLink guide="getting-started">View wearing & connection guide</GuideLink></section>
    <section id="app-demo" className="guides-demo-band"><div className="container guides-demo-layout"><div className="product-app-copy"><span className="eyebrow">Start & stop</span><h2>Start once.<br/>Ask naturally.</h2><AppStartDemo/></div><figure className="product-app-screen"><img src="./assets/app-home.webp" alt="Helios app home screen with its central press-and-hold assistance button." width="873" height="1920" loading="lazy"/></figure></div></section>
    <section id="voice" className="container guides-section guides-voice"><motion.div {...reveal}><span className="eyebrow">Voice & feedback</span><h2>Begin with<br/>“Hi Helios”.</h2><p>Pause in a suitable place and keep the camera facing what you want to understand. Start every voice request with the wake phrase.</p><GuideLink guide="voice">Explore voice guidance</GuideLink></motion.div><div className="guides-requests">{[["Understand a place","Hi Helios, what kind of place am I in?"],["Find an item","Hi Helios, help me find my keys."],["Ask for detail","Hi Helios, what is on the table?"]].map(([title,text])=><motion.article {...reveal} key={title}><Microphone size={20} aria-hidden="true"/><div><h3>{title}</h3><p>“{text}”</p></div></motion.article>)}<p className="guides-voice-note"><SpeakerHigh size={18} aria-hidden="true"/>Obstacle feedback is automatic. Urgent warnings come first.</p></div></section>
    <section id="help" className="container guides-section guides-help"><div><span className="eyebrow">Troubleshooting</span><h2>When something<br/>needs a check.</h2><p>Choose the issue you’re experiencing. Follow any spoken instructions from the app before continuing.</p></div><div className="guides-faq">{guides.troubleshooting.steps.map(([q,a],index)=><details key={q}><summary>{q}<CaretDown size={18} aria-hidden="true"/></summary><p>{a}</p>{index === 0 && <TextLink to="/product?section=details">View product requirements</TextLink>}</details>)}</div></section>

  </div>;
}
