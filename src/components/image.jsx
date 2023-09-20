import React from "react"

const Image = ({ path, caption, width = "100%", alt = "" }) => {
  return (
    <div style={{ marginBottom: 30 }}>
      <div
        style={{
          margin: "auto",
          textAlign: "center",
          width: width,
        }}
      >
        <img style={{ width: width }} src={path.default} alt={alt} />
      </div>
      {caption && (
        <div
          style={{
            fontSize: 14,
            width: "100%",
            marginTop: 10,
            color: "slategrey",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}

export default Image
