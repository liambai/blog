import React from "react"

export default function getReferenceComponents(references) {
  const Reference = ({ id }) => {
    const ref = references[id]
    return (
      <>
        {/*
            Display the ID passed to the button template. Kind of hack because littlefoot's
            numbering system doesn't really support multiple references to the same footnote.
        */}
        <a id={id} href={`#fn:${id}`}>
          {id}
        </a>
        <span className="footnote" id={`fn:${id}`} hidden>
          {ref.author} <a href={ref.url}>{ref.title}</a>. {ref.journal} (
          {ref.year}).
        </span>
      </>
    )
  }

  const ReferenceList = () => {
    return (
      <div>
        <ol>
          {Object.entries(references).map(([id, ref]) => (
            <li key={id} style={{ fontSize: 13, color: "slategrey" }}>
              <p>
                {ref.author} <a href={ref.url}>{ref.title}</a>. {ref.journal} (
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
