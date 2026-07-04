import React from "react"
import { InlineMath } from "../lib/react-katex"

const MARKDOWN_PATTERNS = [
  {
    regex: /\*\*(.*?)\*\*/g,
    element: (match, content) => <strong>{content}</strong>,
  },
  {
    regex: /\*(.*?)\*/g,
    element: (match, content) => <em>{content}</em>,
  },
  {
    regex: /\[([^\]]+)\]\(([^)]+)\)/g,
    element: (match, text, url) => (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    ),
  },
  {
    regex: /`([^`]+)`/g,
    element: (match, code) => <code>{code}</code>,
  },
]

function renderMarkdown(text) {
  if (typeof text !== "string") {
    return text
  }

  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g)

  return parts.map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      return <InlineMath key={index}>{part.slice(1, -1)}</InlineMath>
    }

    let textParts = [part]
    let keyCounter = 0

    MARKDOWN_PATTERNS.forEach(pattern => {
      let newParts = []
      textParts.forEach(textPart => {
        if (typeof textPart === "string") {
          let lastIndex = 0
          let match
          let currentParts = []

          while ((match = pattern.regex.exec(textPart)) !== null) {
            if (match.index > lastIndex) {
              currentParts.push(textPart.slice(lastIndex, match.index))
            }
            currentParts.push(
              React.cloneElement(pattern.element(...match), {
                key: keyCounter++,
              }),
            )
            lastIndex = pattern.regex.lastIndex
          }

          if (lastIndex < textPart.length) {
            currentParts.push(textPart.slice(lastIndex))
          }

          newParts.push(
            ...(currentParts.length > 0 ? currentParts : [textPart]),
          )
          pattern.regex.lastIndex = 0
        } else {
          newParts.push(textPart)
        }
      })
      textParts = newParts
    })

    return <span key={index}>{textParts}</span>
  })
}

export default function getNoteComponents(notes) {
  const Note = ({ id }) => {
    return (
      <a id={`n${id}`} href={`#fn:n${id}`} aria-label="Expand note">
        {" "}
      </a>
    )
  }

  const NoteList = () => {
    return (
      <div>
        <ol>
          {Object.entries(notes).map(([id, note]) => (
            <li key={id} className="footnote" id={`fn:n${id}`}>
              {renderMarkdown(note)}
            </li>
          ))}
        </ol>
      </div>
    )
  }
  return { Note, NoteList }
}
