import React from "react"

import { useMediaQuery } from "react-responsive"

const Image = ({
  path,
  width = "100%",
  mobileWidth = "100%",
  alt = "",
  style = {},
  href,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })

  const imageElement = (
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

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {imageElement}
    </a>
  ) : (
    imageElement
  )
}

export default Image
