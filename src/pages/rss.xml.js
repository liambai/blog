import rss from "@astrojs/rss"
import { SITE } from "../config"
import { getSortedPosts, postPath } from "../lib/posts"

export async function GET(context) {
  const posts = await getSortedPosts()

  return rss({
    title: "Liam Bai Blog RSS Feed",
    description: SITE.description,
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: postPath(post.id),
    })),
  })
}
