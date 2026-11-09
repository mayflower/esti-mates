import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

function createStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

Object.defineProperty(window, "localStorage", { value: createStorageMock() });
Object.defineProperty(window, "sessionStorage", { value: createStorageMock() });

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
