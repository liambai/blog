import React, { useEffect, useRef } from "react"
import * as d3 from "d3"

import Embedding from "./Embedding"

const embeddings = [
  { char: "L", embedding: [0.1, -0.2, 0.3, 0.4, -0.5] },
  { char: "T", embedding: [-0.2, 0.3, -0.4, 0.1, 0.6] },
  { char: "R", embedding: [0.3, 0.2, -0.1, -0.5, 0.4] },
  { char: "A", embedding: [0.4, -0.3, -0.2, 0.5, -0.1] },
  { char: "A", embedding: [0.3, -0.3, -0.2, 0.5, 0.1] },
  { char: "L", embedding: [0.1, -0.1, 0.3, 0.4, -0.3] },
  { char: "Y", embedding: [0.1, -0.2, 0.3, 0.4, -0.5] },
  { char: "E", embedding: [-0.2, -0.8, 0.5, 0.3, 0.6] },
  { char: "D", embedding: [-0.4, 0.2, -0.5, 0.3, 0.1] },
  { char: "C", embedding: [0.6, -0.1, 0.3, -0.4, -0.2] },
]

const AminoAcidEmbeddingEncoder = () => {
  const labelSvgRef = useRef()
  useEffect(() => {
    // Draw the horizontal label
    const svg = d3.select(labelSvgRef.current)
    const bracketPath = "M 40 5 L 30 5 L 30 240 L 40 240"
    svg
      .append("path")
      .attr("d", bracketPath)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
    svg
      .append("text")
      .attr("x", 15)
      .attr("y", 68)
      .text("encoder")
      .attr("font-size", 18)
      .attr("fill", "black")
      .attr("transform", "rotate(-90, 60, 110)")
  }, [])

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg ref={labelSvgRef} width={60} height={260} />
      <Embedding embeddings={embeddings} />
    </div>
  )
}

export default AminoAcidEmbeddingEncoder
