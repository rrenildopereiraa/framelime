import { useState } from "react";

/**
 * A saved look: every setting a share link carries, written the way the link
 * writes it, so a preset is read back through the same parsers and a setting
 * added later simply keeps its current value.
 */
export interface Preset {
  id: string;
  name: string;
  values: Record<string, string>;
}

// Presets belong to this browser, not to a share link.
export const PRESETS_STORAGE_KEY = "framelime:presets";

export const PRESET_NAME_MAX = 40;

interface Parser {
  serialize: (value: never) => string;
  parse: (value: string) => unknown;
}

/** The given settings, in their link form. */
export function serializeSettings(
  parsers: Record<string, Parser>,
  settings: Record<string, unknown>,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, parser] of Object.entries(parsers)) {
    if (settings[key] !== undefined) values[key] = parser.serialize(settings[key] as never);
  }
  return values;
}

/** A preset's settings, leaving out any its values no longer parse. */
export function parsePresetValues(
  parsers: Record<string, Parser>,
  values: Record<string, string>,
): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  for (const [key, parser] of Object.entries(parsers)) {
    if (typeof values[key] !== "string") continue;
    const value = parser.parse(values[key]);
    if (value !== null && value !== undefined) settings[key] = value;
  }
  return settings;
}

function isPreset(value: unknown): value is Preset {
  if (typeof value !== "object" || value === null) return false;
  const { id, name, values } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof name === "string" &&
    typeof values === "object" &&
    values !== null &&
    Object.values(values).every((entry) => typeof entry === "string")
  );
}

/** The presets saved in this browser; none when storage is empty, unreadable or blocked. */
export function loadPresets(storage: Pick<Storage, "getItem"> | undefined = globalStorage()) {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(PRESETS_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isPreset) : [];
  } catch {
    return [];
  }
}

export function savePresets(
  presets: Preset[],
  storage: Pick<Storage, "setItem"> | undefined = globalStorage(),
) {
  try {
    storage?.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Private windows and blocked storage: presets last until the page closes.
  }
}

function globalStorage() {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Adds a preset, or replaces the one with the same name (ignoring case), so
 * saving under a name again updates it. Newest first.
 */
export function upsertPreset(presets: Preset[], name: string, values: Record<string, string>) {
  const trimmed = name.trim().slice(0, PRESET_NAME_MAX);
  const existing = presets.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  const preset: Preset = { id: existing?.id ?? crypto.randomUUID(), name: trimmed, values };
  return [preset, ...presets.filter((p) => p.id !== preset.id)];
}

/** The presets, remembered in this browser. */
export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets());

  function update(next: (current: Preset[]) => Preset[]) {
    setPresets((current) => {
      const value = next(current);
      savePresets(value);
      return value;
    });
  }

  return {
    presets,
    save: (name: string, values: Record<string, string>) =>
      update((current) => upsertPreset(current, name, values)),
    remove: (id: string) => update((current) => current.filter((p) => p.id !== id)),
  };
}
