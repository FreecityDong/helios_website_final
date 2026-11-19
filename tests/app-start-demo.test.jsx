import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AppStartDemo from "../src/AppStartDemo";

afterEach(() => { cleanup(); vi.useRealTimers(); });
it("cancels a short hold, then starts, checks and ends assistance with long holds", () => {
  vi.useFakeTimers();
  render(<AppStartDemo />);
  const button = screen.getByRole("button");
  fireEvent.keyDown(button, { key: " " });
  act(() => vi.advanceTimersByTime(300));
  fireEvent.keyUp(button, { key: " " });
  act(() => vi.advanceTimersByTime(1000));
  expect(button.getAttribute("aria-label")).toBe("Press and hold to start assistance");
  fireEvent.keyDown(button, { key: "Enter" });
  act(() => vi.advanceTimersByTime(600));
  fireEvent.keyUp(button, { key: "Enter" });
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(document.querySelectorAll(".app-start-checklist .is-visible")).toHaveLength(1);
  for (let i = 1; i <= 7; i++) {
    act(() => vi.advanceTimersByTime(1600));
    expect(document.querySelectorAll(".app-start-checklist .is-complete")).toHaveLength(i);
    expect(button.getAttribute("aria-disabled")).toBe("true");
  }
  expect(screen.getByText("All checks complete.")).toBeTruthy();
  act(() => vi.advanceTimersByTime(2200));
  expect(button.getAttribute("aria-label")).toBe("Press and hold to stop assistance");
  expect(screen.getByText(/Say “Hi Helios”/)).toBeTruthy();
  fireEvent.keyDown(button, { key: " " });
  act(() => vi.advanceTimersByTime(600));
  fireEvent.keyUp(button, { key: " " });
  expect(button.getAttribute("aria-label")).toBe("Press and hold to start assistance");
});
