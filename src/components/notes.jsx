import React from "react"
import { InlineMath } from "react-katex"

// Simple markdown renderer for notes
function renderMarkdown(text) {
  if (typeof text !== "string") {
    // If it's already JSX (existing notes), return as-is
    return text
  }

  // Split by math expressions first to avoid interfering with other parsing
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g)

  return parts.map((part, index) => {
    // Handle math expressions
    if (part.startsWith("$") && part.endsWith("$")) {
      return <InlineMath key={index}>{part.slice(1, -1)}</InlineMath>
    }

    // Process the text for markdown patterns
    const patterns = [
      // Bold text
      {
        regex: /\*\*(.*?)\*\*/g,
        element: (match, content) => (
          <strong key={Math.random()}>{content}</strong>
        ),
      },
      // Italic text
      {
        regex: /\*(.*?)\*/g,
        element: (match, content) => <em key={Math.random()}>{content}</em>,
      },
      // Links
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/g,
        element: (match, text, url) => (
          <a key={Math.random()} href={url}>
            {text}
          </a>
        ),
      },
      // Code
      {
        regex: /`([^`]+)`/g,
        element: (match, code) => <code key={Math.random()}>{code}</code>,
      },
    ]

    // Split text and process each pattern
    let textParts = [part]

    patterns.forEach(pattern => {
      let newParts = []
      textParts.forEach(textPart => {
        if (typeof textPart === "string") {
          let lastIndex = 0
          let match
          let currentParts = []

          while ((match = pattern.regex.exec(textPart)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
              currentParts.push(textPart.slice(lastIndex, match.index))
            }
            // Add processed element
            currentParts.push(pattern.element(...match))
            lastIndex = pattern.regex.lastIndex
          }

          // Add remaining text
          if (lastIndex < textPart.length) {
            currentParts.push(textPart.slice(lastIndex))
          }

          newParts.push(
            ...(currentParts.length > 0 ? currentParts : [textPart])
          )
          pattern.regex.lastIndex = 0 // Reset regex
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
