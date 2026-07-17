// Presentational chat-bubble components for illustrating jailbreak prompts.
//
// `ChatMessage` renders a labeled message card (a "User" turn by default); an
// optional `label` prop tags the card (e.g. the name of the attack it shows).
// The inline helpers color or style spans within it:
//   - `Inject`  — the attacker's injected machinery: forced output, fake
//                 instructions, personas, dividers, etc. (red)
//   - `Request` — the harmful ask being smuggled in (blue)
//   - `Mono`    — a monospace span for control glyphs, dividers, and encoded
//                 text; inherits color, so nest inside `Inject` for a red glyph.
//                 Pass strings with `{`/`<` as a JS expression, e.g.
//                 `<Mono>{"·-·-=<|X|>=-·-·"}</Mono>`, to dodge MDX parsing.
//   - `Redact`  — a censor bar over a word (its children set the bar's width)
//
// All styling lives in src/style.css under the `.chat-*` classes, so these
// render to static HTML with no client-side JavaScript.

export function ChatMessage({ role = "User", label, children }) {
  return (
    <div className="chat-message">
      <span className="chat-message-role">{role}</span>
      {label && <span className="chat-message-label">{label}</span>}
      <div className="chat-message-body">{children}</div>
    </div>
  )
}

export const Inject = ({ children }) => (
  <span className="chat-inject">{children}</span>
)

export const Request = ({ children }) => (
  <span className="chat-request">{children}</span>
)

export const Mono = ({ children }) => (
  <code className="chat-mono">{children}</code>
)

export const Redact = ({ children }) => (
  <span className="chat-redact" aria-hidden="true">
    {children}
  </span>
)
