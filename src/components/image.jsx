import React from "react"

import { useMediaQuery } from "react-responsive"

const Image = ({
  path,
  width = "100%",
  mobileWidth = "100%",
  alt = "",
  style = {},
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  return (
    <img
      style={{
        width: isMobile ? mobileWidth : width,
        margin: "auto",
        ...style,
      }}
      src={path.default}
      alt={alt}
    />
  )
}

export default Image
