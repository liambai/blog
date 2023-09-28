import React from "react"

import { useMediaQuery } from "react-responsive"

const Image = ({ path, width = "100%", alt = "", style = {} }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  // Width should always be 100% on mobile
  return (
    <img
      style={{ width: isMobile ? "100%" : width, margin: "auto", ...style }}
      src={path.default}
      alt={alt}
    />
  )
}

export default Image
