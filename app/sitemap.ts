import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
  const paths=["/","/domains","/templates","/services","/export","/pricing","/portfolio","/blog","/contact"];
  return paths.map(path=>({url:`${base}${path}`,lastModified:new Date()}));
}