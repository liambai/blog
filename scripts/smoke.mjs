#!/usr/bin/env node
// Smoke test: boots a server and fetches every route, failing on SSR errors or
// missing content. Runs against `dev` or `preview` so we catch mode-specific
// module-resolution bugs (some things break in dev but not the production
// build, and vice versa).
//
//   node scripts/smoke.mjs preview   # requires `astro build` first
//   node scripts/smoke.mjs dev
//
// Wired up as `pnpm smoke` (build + preview) and `pnpm smoke:dev`.

import { spawn } from "node:child_process"
import { readdirSync, readFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const mode = process.argv[2] === "dev" ? "dev" : "preview"
const PORT = 4399
const BASE = `http://localhost:${PORT}`

// Discover post slugs from the content collection on disk.
const blogDir = join(ROOT, "content", "blog")
const slugs = readdirSync(blogDir, { withFileTypes: true })
  .filter(
    d => d.isDirectory() && existsSync(join(blogDir, d.name, "index.mdx")),
  )
  .map(d => d.name)
  .sort()

// Posts that embed interactive visualizations must ship hydration islands.
// Derived from the source (any `client:` directive emits an astro-island) so it
// can't drift out of sync as posts are added or renamed.
const VIZ_POSTS = new Set(
  slugs.filter(s =>
    readFileSync(join(blogDir, s, "index.mdx"), "utf8").includes("client:"),
  ),
)

const ERROR_MARKERS = [
  "An error occurred",
  "Cannot read properties",
  "TypeError:",
  "ReferenceError:",
  "Named export",
  "is not defined",
]

function checkPage(slug, html, status) {
  const problems = []
  if (status !== 200) problems.push(`HTTP ${status}`)
  for (const m of ERROR_MARKERS) {
    if (html.includes(m)) problems.push(`error marker: "${m}"`)
  }
  if (!html.includes('<article class="blog-post"'))
    problems.push("missing <article class=blog-post>")
  if (VIZ_POSTS.has(slug) && !html.includes("astro-island"))
    problems.push("no hydration islands (astro-island)")
  if (!html.includes('src="/_astro/') && !html.includes("content-image"))
    problems.push("no bundled/content assets referenced")
  return problems
}

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`)
  return { status: res.status, html: await res.text() }
}

async function waitForServer(timeoutMs = 40000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/`)
      if (res.status < 500) return true
    } catch {
      /* not up yet */
    }
    await new Promise(r => setTimeout(r, 400))
  }
  return false
}

const server = spawn(
  "pnpm",
  ["exec", "astro", mode, "--port", String(PORT)],
  // detached so we can kill the whole astro/vite process tree on teardown.
  { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], detached: true },
)
let serverLog = ""
server.stdout.on("data", d => (serverLog += d))
server.stderr.on("data", d => (serverLog += d))

function stopServer() {
  try {
    process.kill(-server.pid, "SIGTERM")
  } catch {
    /* already gone */
  }
  try {
    server.kill("SIGTERM")
  } catch {
    /* already gone */
  }
}

let failed = false
try {
  if (!(await waitForServer())) {
    console.error(`✗ server (${mode}) never became ready\n${serverLog}`)
    failed = true
  } else {
    console.log(`Smoke testing ${mode} server at ${BASE}\n`)

    // Static routes.
    for (const path of ["/", "/blog/"]) {
      const { status, html } = await fetchText(path)
      const bad = status !== 200 || ERROR_MARKERS.some(m => html.includes(m))
      console.log(`  ${bad ? "✗" : "✓"} ${path.padEnd(28)} HTTP ${status}`)
      if (bad) failed = true
    }

    // 404 page renders (status is expected to be 404, so check by content).
    {
      const { html } = await fetchText("/this-route-does-not-exist-xyz/")
      const bad = !html.includes("404: Not Found")
      console.log(`  ${bad ? "✗" : "✓"} 404 page`)
      if (bad) failed = true
    }

    // Every post.
    for (const slug of slugs) {
      const { status, html } = await fetchText(`/${slug}/`)
      const problems = checkPage(slug, html, status)
      const islands = (html.match(/astro-island/g) || []).length
      console.log(
        `  ${problems.length ? "✗" : "✓"} /${slug}/`.padEnd(38) +
          `HTTP ${status}  islands:${islands}` +
          (problems.length ? `  → ${problems.join("; ")}` : ""),
      )
      if (problems.length) failed = true
    }

    // RSS everywhere; sitemap is only emitted by the build (not dev).
    const feeds =
      mode === "preview" ? ["/rss.xml", "/sitemap-index.xml"] : ["/rss.xml"]
    for (const path of feeds) {
      const { status } = await fetchText(path)
      const bad = status !== 200
      console.log(`  ${bad ? "✗" : "✓"} ${path.padEnd(28)} HTTP ${status}`)
      if (bad) failed = true
    }
  }
} finally {
  stopServer()
}

if (failed) {
  console.error(`\n✗ smoke test FAILED (${mode})`)
} else {
  console.log(`\n✓ smoke test passed (${mode}): ${slugs.length} posts`)
}
// Exit explicitly so the intended code isn't clobbered by the server subprocess
// receiving SIGTERM during teardown.
process.exit(failed ? 1 : 0)
