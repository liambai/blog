import { getCollection } from "astro:content"

/** All blog posts, sorted newest first. */
export async function getSortedPosts() {
  return (await getCollection("blog")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )
}

/** Canonical URL path for a post. */
export function postPath(id: string) {
  return `/${id}/`
}
