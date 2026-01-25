import { describe, expect, it } from "vitest";
import { deduplicateName, generateSessionId } from "./types";

describe("generateSessionId", () => {
  it("should generate a 6 character alphanumeric string", () => {
    const sessionId = generateSessionId();
    expect(sessionId).toHaveLength(6);
    expect(sessionId).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("should generate unique IDs", () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });
});

describe("deduplicateName", () => {
  it("should return original name if not taken", () => {
    const result = deduplicateName("Tom", []);
    expect(result).toBe("Tom");
  });

  it("should add (2) if name exists once", () => {
    const result = deduplicateName("Tom", ["Tom"]);
    expect(result).toBe("Tom (2)");
  });

  it("should add (3) if name exists twice", () => {
    const result = deduplicateName("Tom", ["Tom", "Tom (2)"]);
    expect(result).toBe("Tom (3)");
  });
});
