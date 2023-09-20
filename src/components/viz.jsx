import React from "react"
import { useMediaQuery } from "react-responsive"

const mobilefy = s =>
  s.replaceAll("Hover over", "Tap on").replaceAll("hover over", "tap on")

const Viz = ({ caption, children }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  return (
    <div style={{ width: "100%", marginBottom: 30 }}>
      {children}
      {caption && (
        <div
          style={{
            fontSize: 14,
            color: "slategrey",
          }}
        >
          {isMobile ? mobilefy(caption) : caption}
        </div>
      )}
    </div>
  )
}

export default Viz
