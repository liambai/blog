// @ts-check
import { defineConfig, passthroughImageService } from "astro/config"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"

// Octicon link icon for heading anchors (revealed on hover; see style.css).
const anchorIcon = {
  type: "element",
  tagName: "svg",
  properties: {
    "aria-hidden": "true",
    focusable: "false",
    height: 16,
    width: 16,
    viewBox: "0 0 16 16",
    fill: "currentColor",
  },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: {
        "fill-rule": "evenodd",
        d: "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z",
      },
      children: [],
    },
  ],
}

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
    ssr: {
      // Bundle these for SSR: their ESM entries expose the named exports we
      // import, and molstar's extensionless internal imports need a bundler to
      // resolve. (react-katex is handled instead by default-importing it and
      // destructuring — its UMD build breaks named-export detection AND the
      // prop-types interop when bundled, so it's left external.)
      noExternal: ["react-responsive", "d3-simple-slider", "molstar"],
    },
  },
  markdown: {
    // Disable Astro's built-in Shiki so rehype-prism-plus (+ prism.css theme)
    // is the only code highlighter, preserving the original Prism styling.
    syntaxHighlight: false,
    remarkPlugins: [remarkMath],
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
  },
})
