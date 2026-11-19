import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { GetInvolved, HowItWorks, Team, Home, Product } from "../src/pages";
import { Experience } from "../src/editorial";
import { SceneDemo } from "../src/components";

describe("Helios website interactions", () => {
  it("routes from navigation to the product page and updates the title", async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.click(
      within(
        screen.getByRole("navigation", { name: "Main navigation" }),
      ).getByRole("link", { name: "Product" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Small parts.A wider perspective.",
      ),
    );
    expect(document.title).toBe("Product — Helios");
  });
  it("shows a recoverable not-found page for an unknown route", () => {
    location.hash = "/missing";
    render(<App />);
    expect(screen.getByRole("link", { name: /Back to Home/ })).toHaveAttribute(
      "href",
      "#/",
    );
  });
  it("allows step-by-step scene exploration with no autoplay in reduced-motion mode", async () => {
    render(<SceneDemo reduce />);
    const user = userEvent.setup();
    expect(
      screen.queryByRole("button", { name: "Play demo" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Checking the current view…")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Step 4: Check again/ }),
    );
    expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Previous step" }));
    expect(
      screen.getByRole("button", { name: /Step 3: Listen/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("changes spatial layers, motion feedback, priority, and network conditions", async () => {
    render(<HowItWorks reduce />);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "Distance", exact: true }),
    );
    expect(
      screen.getByText("Distance when depth is reliable"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Paused", exact: true }),
    );
    expect(
      screen.getByText("A moment to understand more."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Show Priority Example" }),
    );
    expect(
      screen.getByText("Urgent warning takes priority."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Illustration: toggle network connection",
      }),
    );
    expect(
      screen.getByText(/No internet: cloud tasks pause/),
    ).toBeInTheDocument();
  });
  it("prepares a local request without transmitting or claiming receipt", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    render(<GetInvolved mode="test" onPrivacy={() => {}} />);
    const user = userEvent.setup();
    const form = screen
      .getByRole("button", { name: "Prepare Request" })
      .closest("form");
    const scope = within(form);
    await user.type(scope.getByLabelText("Your name *"), "Website QA");
    await user.type(scope.getByLabelText("Email address *"), "qa@example.com");
    await user.type(scope.getByLabelText("City *"), "Shanghai");
    await user.type(
      scope.getByLabelText("What would you like to try? *"),
      "Finding objects at home.",
    );
    await user.click(scope.getByRole("button", { name: "Prepare Request" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nothing has been sent",
    );
    expect(
      scope.getByRole("button", { name: "Download Request" }),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByText("Application received.")).not.toBeInTheDocument();
  });
  it("preserves draft fields when switching between testing and partnership", async () => {
    const { rerender } = render(
      <GetInvolved mode="test" onPrivacy={() => {}} />,
    );
    const user = userEvent.setup();
    let form = screen
      .getByRole("button", { name: "Prepare Request" })
      .closest("form");
    await user.type(within(form).getByLabelText("Your name *"), "Draft Person");
    rerender(<GetInvolved mode="partner" onPrivacy={() => {}} />);
    expect(
      screen.getByRole("heading", {
        name: "Your collaboration idea",
      }),
    ).toBeInTheDocument();
    rerender(<GetInvolved mode="test" onPrivacy={() => {}} />);
    form = screen
      .getByRole("button", { name: "Prepare Request" })
      .closest("form");
    expect(within(form).getByLabelText("Your name *")).toHaveValue(
      "Draft Person",
    );
  });
  it("does not accept an incomplete test application", async () => {
    render(<GetInvolved mode="test" onPrivacy={() => {}} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Prepare Request" }),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("presents all five team members and labels future research as a plan", () => {
    render(<Team reduce />);
    for (const n of ["Iris", "Carros", "Sophia", "Jasper", "Daniel"])
      expect(screen.getByRole("heading", { name: n })).toBeInTheDocument();
    expect(
      screen.getByText(/We plan research with at least 20/),
    ).toBeInTheDocument();
  });
  it("closes the mobile menu and restores focus on Escape", async () => {
    render(<App />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
  it("keeps reduced motion enabled without a footer settings dialog", () => {
    render(<App />);
    expect(screen.queryByRole("button", { name: "Accessibility" })).toBeNull();
    expect(screen.queryByRole("button", { name: /reduce.*motion/i })).toBeNull();
    expect(document.documentElement).toHaveClass("reduce-motion");
  });
});

describe("New spatial website", () => {
  it("switches hero illustration layers without navigating", async () => {
    render(<Home reduce />);
    const views = screen.getByRole("group", {
      name: "Spatial illustration views",
    });
    await userEvent.click(
      within(views).getByRole("button", { name: "Direction" }),
    );
    expect(
      within(views).getByRole("button", { name: "Direction" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("A location.")).toBeInTheDocument();
    await userEvent.click(
      within(views).getByRole("button", { name: "Distance" }),
    );
    expect(screen.getByText("More context.")).toBeInTheDocument();
  });
  it("preserves product experience copy as the selected task changes", async () => {
    render(<Product reduce onManual={() => {}} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Understand Surroundings" }),
    );
    expect(
      screen.getByRole("heading", { name: "Get to know your surroundings." }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Movement Alerts" }),
    );
    expect(
      screen.getByText(
        "Receive brief alerts about nearby obstacles. Urgent warnings take priority over ordinary descriptions and task feedback.",
      ),
    ).toBeInTheDocument();
  });
});

describe("New information architecture", () => {
  it("opens the compact trial drawer directly and closes it with Escape", async () => {
    history.replaceState(null, "", "/#/experience");
    render(<App />);
    const dialog = await screen.findByRole("dialog", { name: "Try Helios" });
    expect(within(dialog).getByRole("textbox", { name: "Your name *" })).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("City *")).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(window.location.hash).toBe("#/");
  });

  it.each([
    ["/why-helios", "The small things.On your terms."],
    ["/guides", "Get connected.Get familiar."],
    ["/guides/voice", "A few words. A fresh view."],
    ["/guides/troubleshooting", "When something changes."],
    ["/guides/getting-started", "Your first session."],
    ["/team", "Behind Helios"],
    ["/privacy", "Know what you share."],
  ])("renders %s directly", (route, title) => {
    history.replaceState(null, "", `/#${route}`);
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
  });
  it("opens Product directly and retains its page section navigation", async () => {
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    render(<App />);
    const navigation = within(
      screen.getByRole("navigation", { name: "Main navigation" }),
    );
    await userEvent.click(navigation.getByRole("link", { name: "Product" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Small parts.",
      ),
    );
    const sections = within(
      screen.getByRole("navigation", { name: "On this page" }),
    );
    await userEvent.click(sections.getByRole("link", { name: "The hardware" }));
    await waitFor(() => expect(scroll).toHaveBeenCalled());
    expect(navigation.queryByRole("button")).not.toBeInTheDocument();
  });
  it("shows the mobile destinations and closes the menu after navigation", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const mobile = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await userEvent.click(
      within(mobile).getByRole("link", { name: /Why Helios/ }),
    );
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "The small things.",
      ),
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

it("downloads a prepared request as a local JSON file", async () => {
  const blobs = [];
  const create = vi.fn((blob) => {
    blobs.push(blob);
    return "blob:helios-test";
  });
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = create;
  URL.revokeObjectURL = vi.fn();
  let downloadName = "";
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(function () {
      downloadName = this.download;
    });
  try {
    render(<Experience mode="test" />);
    const user = userEvent.setup();
    const scope = within(
      screen.getByRole("button", { name: "Prepare Request" }).closest("form"),
    );
    await user.type(scope.getByLabelText("Your name *"), "QA");
    await user.type(scope.getByLabelText("Email address *"), "qa@example.com");
    await user.type(scope.getByLabelText("City *"), "Shanghai");
    await user.type(
      scope.getByLabelText("What would you like to try? *"),
      "Find a book",
    );
    await user.click(screen.getByRole("button", { name: "Prepare Request" }));
    await user.click(screen.getByRole("button", { name: "Download Request" }));
    expect(create).toHaveBeenCalledOnce();
    expect(blobs[0].type).toBe("application/json");
    expect(downloadName).toBe("helios-test-request.json");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nothing has been sent",
    );
  } finally {
    click.mockRestore();
    URL.createObjectURL = originalCreate;
    setTimeout(() => {
      URL.revokeObjectURL = originalRevoke;
    }, 1100);
  }
});
