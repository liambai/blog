import React from "react"
import { useMediaQuery } from "react-responsive"

const mobileify = s =>
  s.replaceAll("Hover over", "Tap on").replaceAll("hover over", "tap on")

function renderReferences(text) {
  const pattern = /\{\d+\}/g
  if (!pattern.test(text)) {
    return text
  }
  const replaced = text.replaceAll(pattern, (match, _) => {
    const id = parseInt(match[1])
    return `<a id=${id} href="#fn:${id}">[${id}]</a>`
  })
  return <span key="ref" dangerouslySetInnerHTML={{ __html: replaced }} />
}

function parseAndRenderLinks(text) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    if (index % 3 === 0) {
      return renderReferences(part)
    } else if (index % 3 === 1) {
      const linkText = parts[index]
      const link = parts[index + 1]
      return (
        <a key={link} href={link}>
          {linkText}
        </a>
      )
    }
    return null
  })
}

const Caption = ({ caption }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })

  if (!caption) {
    return null
  }

  if (isMobile) {
    caption = mobileify(caption)
  }
  return (
    <div
      style={{
        fontSize: 13.5,
        color: "slategrey",
        textAlign: "left",
      }}
    >
      {parseAndRenderLinks(caption)}
    </div>
  )
}

export default Caption
