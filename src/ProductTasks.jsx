import { ChatCircleText, SpeakerHigh, WarningCircle } from "@phosphor-icons/react";

const tasks = [
  {
    kind: "obstacle",
    image: "task-obstacle-v3.webp",
    alt: "A chair on the left side of a corridor, with an open walkway on the right.",
    title: "Notice nearby obstacles.",
    text: "Receive distance and direction cues as you move, with urgent risks prioritised.",
    prompt: "Automatic obstacle alert",
    response: "Obstacle ahead on your left. Move slightly to the right.",
    automatic: true,
  },
  {
    kind: "place",
    image: "task-place-v2.webp",
    alt: "A reading space with tables in front, seating beyond and bookshelves on the right.",
    title: "Understand your surroundings.",
    text: "Hear what kind of place you are in and how the objects around you are arranged.",
    prompt: "Hi Helios, what kind of place am I in?",
    response: "A reading space, with tables ahead and bookshelves to your right.",
  },
  {
    kind: "find",
    image: "task-find-v2.webp",
    alt: "Keys on a wooden console, with a dark notebook to their right.",
    title: "Find an everyday object.",
    text: "Ask for a supported item and hear where it appears in view.",
    prompt: "Hi Helios, help me find my keys.",
    response: "The keys are on the console, to the left of the notebook.",
  },

];

export default function ProductTasks() {
  return (
    <section id="everyday-tasks" className="container section product-tasks">
      <div className="product-tasks-heading">
        <div>
          <span className="eyebrow">Everyday tasks</span>
          <h2>Understand, find and avoid.</h2>
        </div>
      </div>
      <div className="product-task-grid">
        {tasks.map((task) => (
          <article className="product-task" key={task.kind}>
            <div className={`product-task-art product-task-art-${task.kind}`}>
              <img src={`./assets/${task.image}`} alt={task.alt} loading="lazy" />
            </div>
            <h3>{task.title}</h3>
            <p>{task.text}</p>
            <div className="product-task-exchange">
              <div className="task-prompt">
                {task.automatic ? <WarningCircle aria-hidden="true" /> : <ChatCircleText aria-hidden="true" />}
                <span>{task.prompt}</span>
              </div>
              <blockquote>
                <SpeakerHigh aria-hidden="true" />
                <span>“{task.response}”</span>
              </blockquote>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
