import React from "react"

export default function getReferenceComponents(references) {
  const referenceBody = ref => (
    <p>
      {ref.author}{" "}
      <a href={ref.url} target="_blank" rel="noopener noreferrer">
        {ref.title}
      </a>
      . {ref.journal} ({ref.year}).
    </p>
  )

  const Reference = ({ id }) => {
    return (
      <a id={id} href={`#fn:${id}`}>
        {id}
      </a>
    )
  }

  const ReferenceList = () => {
    return (
      <div>
        <ol>
          {Object.entries(references).map(([id, ref]) => (
            <li key={id} style={{ fontSize: 13, color: "slategrey" }}>
              {referenceBody(ref)}
            </li>
          ))}
        </ol>
        <ol>
          {Object.entries(references).map(([id, ref]) => (
            <li key={id} className="footnote" id={`fn:${id}`}>
              {referenceBody(ref)}
            </li>
          ))}
        </ol>
      </div>
    )
  }
  return { Reference, ReferenceList }
}
