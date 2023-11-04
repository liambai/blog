import React from "react"

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
              {note}
            </li>
          ))}
        </ol>
      </div>
    )
  }
  return { Note, NoteList }
}
