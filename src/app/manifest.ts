import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "LANtern - Game Night Hub",
        short_name: "LANtern",
        description:
            "Soukromý hub pro deskovky, RPG, útraty, dluhy a game nights",

        start_url: "/dashboard",
        scope: "/",
        display: "standalone",

        background_color: "#0b1020",
        theme_color: "#0b1020",

        lang: "cs-CZ",
        dir: "ltr",

        categories: ["games", "social", "utilities"],

        icons: [
            {
                src: "/icon",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
        ],
    };
}