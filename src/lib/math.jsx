import katex from "katex"

// Local <InlineMath> / <BlockMath> replacements for the unmaintained react-katex
// package, whose only real behavior was a single katex.renderToString() call
// (wrapped in a span/div via dangerouslySetInnerHTML). Rendering KaTeX directly
// here drops that UMD dependency, its prop-types peer, and the SSR interop
// workaround it required. Formula is passed as children (or a `math` prop).
function renderMath(formula, displayMode) {
  return katex.renderToString(String(formula), {
    displayMode,
    throwOnError: false,
  })
}

export function InlineMath({ children, math }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: renderMath(math ?? children, false) }}
    />
  )
}

export function BlockMath({ children, math }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderMath(math ?? children, true) }}
    />
  )
}
