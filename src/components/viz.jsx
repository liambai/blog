import React from "react"

const Viz = ({ caption, children }) => {
  return (
    <div style={{ marginBottom: 30 }}>
      {children}
      {caption && (
        <div
          style={{
            fontSize: 14,
            color: "slategrey",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}

export default Viz
