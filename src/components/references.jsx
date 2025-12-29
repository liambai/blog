import React from "react"

export default function getReferenceComponents(references) {
  const Reference = ({ id }) => {
    // Display the ID passed to the button template. This is a hack because littlefoot's numbering system doesn't really support multiple references to the same footnote.
    return (
      <a id={id} href={`#fn:${id}`}>
        {id}
      </a>
    )
  }

  const ReferenceList = () => {
    return (
      <div>
        {/* Reference to display */}
        <ol>
          {Object.entries(references).map(([id, ref]) => (
            <li key={id} style={{ fontSize: 13, color: "slategrey" }}>
              <p>
                {ref.author} <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>. {ref.journal} (
                {ref.year}).
              </p>
            </li>
          ))}
        </ol>
        {/* Hidden reference list for littlefoot popovers */}
        <ol>
          {Object.entries(references).map(([id, ref]) => (
            <li key={id} className="footnote" id={`fn:${id}`}>
              <p>
                {ref.author} <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>. {ref.journal} (
                {ref.year}).
              </p>
            </li>
          ))}
        </ol>
      </div>
    )
  }
  return { Reference, ReferenceList }
}
