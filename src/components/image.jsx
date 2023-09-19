import React from "react"

const Image = ({ path, caption, width = 500, alt = "" }) => {
  return (
    <div style={{ margin: "auto", textAlign: "center", marginBottom: 30 }}>
      <img style={{ width: width }} src={path.default} alt={alt} />
      {caption && (
        <div
          style={{
            fontSize: 14,
            marginTop: 10,
            color: "slategrey",
            textAlign: "left",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}

export default Image
