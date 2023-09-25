import React from "react"
import Caption from "./caption"

const Viz = ({ caption, children }) => (
  <div className="figure">
    {children}
    <Caption caption={caption} />
  </div>
)

export default Viz
