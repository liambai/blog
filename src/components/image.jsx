import React from "react"
import Caption from "./caption"

import { useMediaQuery } from "react-responsive"

const Image = ({ path, caption, width = "100%", alt = "" }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  return (
    <div className="figure">
      <div
        style={{
          margin: "auto",
          marginBottom: 10,
          textAlign: "center",
          width: isMobile ? "100%" : width, // Width should always be 100% on mobile
        }}
      >
        <img style={{ width: width }} src={path.default} alt={alt} />
      </div>
      <Caption caption={caption} />
    </div>
  )
}

export default Image
