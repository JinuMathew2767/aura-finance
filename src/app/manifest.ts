import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aura Finance",
    short_name: "Aura",
    description: "Household Financial Management PWA",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f3fb",
    theme_color: "#6d5efc",
    orientation: "portrait",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
