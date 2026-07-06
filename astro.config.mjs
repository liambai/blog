// @ts-check
import { defineConfig, passthroughImageService } from "astro/config"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import { unified } from "@astrojs/markdown-remark"

import remarkMath from "remark-math"
import remarkImageImports from "./src/lib/remark-image-imports.mjs"
import rehypeKatex from "rehype-katex"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"
import { anchorIcon } from "./src/lib/anchor-icon.mjs"

// https://astro.build/config
export default defineConfig({
  site: "https://liambai.com",
  build: {
    // Inline all CSS into the HTML: the site's entire stylesheet is only a few
    // KB compressed, and inlining removes the render-blocking fetch that
    // delays first paint on slow connections.
    inlineStylesheets: "always",
  },
  image: {
    // Content images are plain Vite asset imports (not Astro's <Image>), so we
    // don't need the sharp-based optimizer.
    service: passthroughImageService(),
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    resolve: {
      // Bundle these rather than externalizing them for server rendering: their
      // ESM entries expose the named exports we import, and molstar's
      // extensionless internal imports (e.g. mol-plugin/spec -> ./assembly-unwind)
      // can't be resolved by Node's ESM resolver when externalized — even the
      // client:only viewers pull molstar into the SSR module graph.
      //
      // This lives under `resolve` (not `ssr`) so it applies to every Vite
      // environment — in particular Astro's separate `prerender` build, which
      // the deprecated `ssr.noExternal` alias doesn't reach.
      noExternal: ["react-responsive", "d3-simple-slider", "molstar"],
    },
  },
  markdown: {
    // Disable Astro's built-in Shiki so rehype-prism-plus (+ prism.css theme)
    // is the only code highlighter, preserving the original Prism styling.
    syntaxHighlight: false,
    // Astro 7 deprecated the top-level `markdown.remarkPlugins`/`rehypePlugins`
    // arrays in favor of a `unified()` processor. `syntaxHighlight` above still
    // applies — Astro forwards it into the processor when building the renderer.
    processor: unified({
      remarkPlugins: [remarkMath, remarkImageImports],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
            properties: {
              class: "anchor before",
              ariaHidden: true,
              tabIndex: -1,
            },
            content: anchorIcon,
          },
        ],
        rehypeKatex,
        [rehypePrism, { ignoreMissing: true }],
        [
          rehypeExternalLinks,
          { target: "_blank", rel: ["noopener", "noreferrer"] },
        ],
      ],
    }),
  },
})
