import { describe, expect, it } from "vite-plus/test";
import { createHistory, MERGE_WINDOW_MS } from "./history";

function setup() {
  let time = 0;
  const history = createHistory<string>(() => time);
  return { history, tick: (ms: number) => (time += ms) };
}

describe("createHistory", () => {
  it("undoes and redoes changes in order", () => {
    const { history, tick } = setup();
    history.record("a", "theme", null);
    tick(1000);
    history.record("a", "radius", "settings:rtl");
    tick(1000);
    history.record("a", "typed", "doc:code");

    expect(history.undo("a", "formatted")).toBe("typed");
    expect(history.undo("a", "typed")).toBe("radius");
    expect(history.undo("a", "radius")).toBe("theme");
    expect(history.undo("a", "theme")).toBeNull();

    expect(history.redo("a", "theme")).toBe("radius");
    expect(history.redo("a", "radius")).toBe("typed");
    expect(history.redo("a", "typed")).toBe("formatted");
    expect(history.redo("a", "formatted")).toBeNull();
  });

  it("merges rapid changes in the same group into one step", () => {
    const { history, tick } = setup();
    for (const pad of ["8", "16", "24", "32"]) {
      history.record("a", pad, "settings:pad");
      tick(16);
    }
    expect(history.undo("a", "40")).toBe("8");
    expect(history.undo("a", "8")).toBeNull();
  });

  it("starts a new step after a pause or a different change", () => {
    const { history, tick } = setup();
    history.record("a", "1", "doc:code");
    tick(MERGE_WINDOW_MS);
    history.record("a", "2", "doc:code");
    tick(10);
    history.record("a", "3", "settings:pad");
    expect(history.undo("a", "4")).toBe("3");
    expect(history.undo("a", "3")).toBe("2");
    expect(history.undo("a", "2")).toBe("1");
  });

  it("never merges a change without a group, or across an undo", () => {
    const { history } = setup();
    history.record("a", "1", null);
    history.record("a", "2", null);
    expect(history.undo("a", "3")).toBe("2");
    history.record("a", "2", "doc:code");
    history.record("a", "2b", "doc:code");
    expect(history.undo("a", "2c")).toBe("2");
    expect(history.undo("a", "2")).toBe("1");
  });

  it("clears redo on a new change and keeps one stack per snippet", () => {
    const { history } = setup();
    history.record("a", "a1", null);
    history.record("b", "b1", null);
    expect(history.undo("a", "a2")).toBe("a1");
    history.record("a", "a1", null);
    expect(history.redo("a", "a1x")).toBeNull();
    history.forget("b");
    expect(history.undo("b", "b2")).toBeNull();
  });
});
