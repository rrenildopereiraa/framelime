/** The production origin: Vercel's, when deployed there, else the dev server. */
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const site = {
  name: "Framelime",
  description: "Turn code into clean, shareable images.",
  url: host ? `https://${host}` : "http://localhost:3000",
  repo: "https://github.com/rrenildopereiraa/framelime",
  themeColor: { light: "#fafaf7", dark: "#0b0b0a" },
};
