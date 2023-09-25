import React from "react"
import Caption from "./caption"

const Image = ({ path, caption, width = "100%", alt = "" }) => {
  return (
    <div className="figure">
      <div
        style={{
          margin: "auto",
          marginBottom: 10,
          textAlign: "center",
          width: width,
        }}
      >
        <img style={{ width: width }} src={path.default} alt={alt} />
      </div>
      <Caption caption={caption} />
    </div>
  )
}

export default Image
