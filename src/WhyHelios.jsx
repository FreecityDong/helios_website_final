import { motion, useReducedMotion } from "motion/react";
import WhyScenarioCarousel from "./WhyScenarioCarousel";
import { TextLink } from "./components";

const stories = [
  {
    id: "movement",
    label: "Notice what changes",
    title: "A familiar place can change.",
    text: "A moved chair. A bag left in the passage. Even familiar rooms change. Helios adds information about what is different, alongside your own knowledge of the space.",
    closing: "More awareness to inform your next decision.",
    image: "home-wearing-v8.webp",
    alt: "A person wearing sunglasses, a chest-mounted Helios camera and an earphone at home.",
  },
  {
    id: "finding",
    label: "Keep everyday things moving",
    title: "Small tasks. More of your day.",
    text: "Finding your keys should not take over your morning. Helios gives you a starting point for locating an item, so you can continue with what you had planned.",
    closing: "Designed to make everyday searching less demanding.",
    image: "task-find-v2.webp",
    alt: "Keys beside a notebook on an oak console.",
  },
  {
    id: "surroundings",
    label: "Make room for curiosity",
    title: "More places to get to know.",
    text: "A reading room, a gallery, somewhere new. A description of the space gives you a starting point for exploring what interests you, at your own pace.",
    closing: "Explore beyond the familiar, led by your own interests.",
    image: "task-place-v2.webp",
    alt: "A reading space with tables, seating and bookshelves.",
  },
];

export default function WhyHeliosPage() {
  const reduce = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduce ? 0 : 0.65 },
  };

  return (
    <div className="why-page">
      <section className="why-banner">
        <div className="container why-banner-layout">
          <div className="why-banner-copy">
            <span className="eyebrow">Why Helios</span>
            <h1>Relevant information.<br />Your own choices.</h1>
          </div>
          <figure>
            <img src="./assets/why-helios-banner-v3.webp" alt="A man wearing Helios and opaque sunglasses walking through an indoor lounge with a chair, side table and plants." fetchPriority="high" width="1672" height="941" />
          </figure>
        </div>
      </section>

      <section className="container why-intention why-editorial-intro">
        <span className="eyebrow">Made for everyday life</span>
        <div>
          <motion.h2 {...reveal}>More information is not<br />always more helpful.</motion.h2>
          <motion.p {...reveal}>Helios is wearable spatial assistance for blind and low-vision people. Knowing what is around you is only part of the picture. Understanding <em>where things are</em> and <em>which details matter now</em> can make that information more useful.</motion.p>
        </div>
      </section>

      <WhyScenarioCarousel />

      <div className="container why-editorial-stories">
        <section id="movement" className="why-awareness-story">
          <div className="why-section-heading">
            <div><span className="eyebrow">01 / Notice what changes</span><motion.h2 {...reveal}>{stories[0].title}</motion.h2></div>
            <motion.p {...reveal}>{stories[0].text}</motion.p>
          </div>
          <motion.figure className="why-wide-scene" {...reveal}>
            <img src="./assets/home-wearing-v8.webp" alt={stories[0].alt} loading="lazy" />
          </motion.figure>
        </section>

        <section id="finding" className="why-finding-story">
          <div className="why-finding-images">
            <motion.figure className="why-finding-context" {...reveal}><img src="./assets/room-story-v3.webp" alt="A furnished living and dining space." loading="lazy" /><figcaption>The space around you</figcaption></motion.figure>
            <motion.figure className="why-finding-detail" {...reveal}><img src="./assets/task-find-v2.webp" alt={stories[1].alt} loading="lazy" /><figcaption>A detail worth finding</figcaption></motion.figure>
          </div>
          <div className="why-editorial-copy">
            <span className="eyebrow">02 / Keep everyday things moving</span>
            <motion.h2 {...reveal}>{stories[1].title}</motion.h2>
            <motion.p {...reveal}>{stories[1].text}</motion.p>
          </div>
        </section>

        <section id="surroundings" className="why-curiosity-story">
          <div className="why-editorial-copy">
            <span className="eyebrow">03 / Make room for curiosity</span>
            <motion.h2 {...reveal}>{stories[2].title}</motion.h2>
            <motion.p {...reveal}>{stories[2].text}</motion.p>
          </div>
          <motion.figure {...reveal}><img src="./assets/home-freedom-gallery.webp" alt="A Helios wearer exploring sculptures in a gallery." loading="lazy" /></motion.figure>
        </section>
      </div>

      <section className="container why-principles">
        <div><span className="eyebrow">Our approach</span><h2>Assistance that fits around you.</h2></div>
        <div className="why-principle-list">
          <article><h3>Hands available.</h3><p>The camera stays on your chest and feedback comes through your earphones, leaving your hands available for mobility aids and everyday tasks.</p></article>
          
          <article><h3>Your judgment stays central.</h3><p>Helios offers information, not a decision on your behalf. Use it alongside your experience and usual mobility aids; observations can be incomplete or uncertain.</p></article>
        </div>
      </section>
      <section className="container why-next">
        <h2>See how it fits into your day.</h2>
        <div><a className="button" href="#/experience">Try Helios</a><TextLink to="/product">Explore the product</TextLink></div>
      </section>
    </div>
  );
}
