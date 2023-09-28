import React from "react"

const Figure = ({ content, children }) => {
  return (
    <div className="figure">
      <div
        style={{
          textAlign: "center",
        }}
      >
        {content}
      </div>
      <div
        style={{
          fontSize: 13.5,
          color: "slategrey",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default Figure
