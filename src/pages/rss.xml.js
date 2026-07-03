import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { SITE } from "../config"

export async function GET(context) {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )

  return rss({
    title: "Liam Bai Blog RSS Feed",
    description: SITE.description,
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/${post.id}/`,
    })),
  })
}
