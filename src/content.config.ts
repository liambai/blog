import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

// Posts live in content/blog/<slug>/index.mdx, colocated with their images and
// visualization components. The glob loader derives each entry id from the
// parent folder name (e.g. "keytruda").
const blog = defineCollection({
  loader: glob({ pattern: "**/index.mdx", base: "./content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
  }),
})

export const collections = { blog }
