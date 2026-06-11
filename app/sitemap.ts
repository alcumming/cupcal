import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/build`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/how-to-subscribe`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
