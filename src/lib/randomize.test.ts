import { describe, expect, it } from "vite-plus/test";
import {
  loadLocks,
  LOCKS_STORAGE_KEY,
  RANDOMIZE_GROUPS,
  randomPatch,
  type RandomizeGroup,
  saveLocks,
} from "./randomize";

const THEMES = ["lime", "night", "paper"];

function patchWith(locks: RandomizeGroup[], random = Math.random) {
  return randomPatch({
    locks,
    currentTheme: "lime",
    themeNames: THEMES,
    colorsFor: (theme) => ({ page: theme }),
    fontIds: ["default", "fira-code"],
    random,
  });
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("randomPatch", () => {
  it("changes every group when nothing is locked", () => {
    const patch = patchWith([]);
    for (const key of ["theme", "colors", "pad", "rtl", "font", "size", "bg", "tabBar", "deco"]) {
      expect(patch).toHaveProperty(key);
    }
  });

  it("never changes the theme while it is locked", () => {
    for (let run = 0; run < 200; run++) {
      const patch = patchWith(["theme"]);
      expect(patch.theme).toBeUndefined();
      expect(patch.colors).toBeUndefined();
      // Everything else still changes.
      expect(patch.pad).toBeDefined();
      expect(patch.font).toBeDefined();
    }
  });

  it("picks a different theme than the current one", () => {
    for (let run = 0; run < 200; run++) {
      const patch = patchWith([]);
      expect(patch.theme).not.toBe("lime");
      expect(patch.colors).toEqual({ page: patch.theme });
    }
  });

  it("leaves out every locked group", () => {
    const all = RANDOMIZE_GROUPS.map((group) => group.id);
    expect(patchWith(all)).toEqual({});
  });

  it("stays within each setting's range", () => {
    for (const value of [0, 0.999999]) {
      const patch = patchWith([], () => value);
      expect(patch.pad).toBeGreaterThanOrEqual(0);
      expect(patch.pad).toBeLessThanOrEqual(128);
      expect(patch.rtl).toBeLessThanOrEqual(16);
      expect(patch.size).toBeGreaterThanOrEqual(12);
      expect(patch.size).toBeLessThanOrEqual(18);
      expect(patch.decoGap).toBeLessThanOrEqual(48);
      expect(patch.bg).not.toBe("transparent");
    }
  });
});

describe("locks storage", () => {
  it("round-trips the locked groups", () => {
    const storage = memoryStorage();
    saveLocks(["theme", "font"], storage);
    expect(loadLocks(storage)).toEqual(["theme", "font"]);
  });

  it("reads nothing from empty, broken or unknown values", () => {
    expect(loadLocks(memoryStorage())).toEqual([]);
    expect(loadLocks(memoryStorage({ [LOCKS_STORAGE_KEY]: "{not json" }))).toEqual([]);
    expect(loadLocks(memoryStorage({ [LOCKS_STORAGE_KEY]: '{"theme":true}' }))).toEqual([]);
    expect(loadLocks(memoryStorage({ [LOCKS_STORAGE_KEY]: '["theme","nope",3]' }))).toEqual([
      "theme",
    ]);
  });

  it("survives storage that throws", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadLocks(blocked)).toEqual([]);
    expect(() => saveLocks(["theme"], blocked)).not.toThrow();
  });
});
