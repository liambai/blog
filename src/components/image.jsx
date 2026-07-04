import React from "react"

const Image = ({
  path,
  width = "100%",
  mobileWidth = "100%",
  alt = "",
  style = {},
  href,
}) => {
  // `path` is an ESM-imported asset (Astro's ImageMetadata `{ src }`); also
  // accept a plain URL string. Responsive width comes from CSS custom
  // properties (see `.content-image` in style.css).
  const resolvedSrc = typeof path === "string" ? path : path.src

  const imageElement = (
    <img
      className="content-image"
      style={{
        "--img-width": width,
        "--img-mobile-width": mobileWidth,
        margin: "auto",
        ...style,
      }}
      src={resolvedSrc}
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
