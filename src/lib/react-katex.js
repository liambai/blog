// react-katex ships a UMD build whose dynamically-assigned exports break both
// named-export detection and its prop-types interop when bundled for SSR.
// Default-importing and destructuring is the interop that works everywhere
// (dev, production build, and the client), so every call site imports the
// KaTeX components from here rather than from "react-katex" directly.
import ReactKaTeX from "react-katex"

export const { InlineMath, BlockMath } = ReactKaTeX
