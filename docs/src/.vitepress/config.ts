import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SplusEins",
  description: "Dokumentation von spluseins.de",
  base: "/docs",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: "local",
    },

    sidebar: [
      {
        text: "SplusEins",
        items: [
          { text: "Benutzerdokumentation", link: "/benutzer" },
          { text: "Grundlagen", link: "/grundlagen" },
          { text: "Wartung", link: "/semesterbeginn" },
          { text: "Konfiguration", link: "/konfiguration" },
          { text: "Deployment", link: "/deployment" },
          { text: "Server", link: "/server" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/SplusEins/SplusEins" },
    ],
    editLink: {
      pattern:
        "https://github.com/SplusEins/SplusEins/edit/master/docs/src/:path",
    },
  },
});
