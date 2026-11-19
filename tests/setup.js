import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  history.replaceState(null, "", "/");
});
window.matchMedia = vi.fn((q) => ({
  matches: q.includes("prefers-reduced-motion"),
  media: q,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
window.scrollTo = vi.fn();
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
