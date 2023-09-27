import React, { useEffect, useRef } from "react"
import * as d3 from "d3"

import Embedding from "./Embedding"
import Viz from "../../../../src/components/viz"

const colors = [
  "lightblue",
  "lightyellow",
  "lightcyan",
  "lightskyblue",
  "lightgreen",
]
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

const AminoAcidEmbeddingEncoder = ({ caption }) => {
  const labelSvgRef = useRef()
  useEffect(() => {
    // Draw the horizontal label
    const svg = d3.select(labelSvgRef.current)
    const bracketPath = "M 50 5 L 40 5 L 40 240 L 50 240"
    svg
      .append("path")
      .attr("d", bracketPath)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
    svg
      .append("text")
      .attr("x", 15)
      .attr("y", 75)
      .text("encoder")
      .attr("font-size", 18)
      .attr("fill", "black")
      .attr("transform", "rotate(-90, 60, 110)")
  }, [])

  return (
    <Viz caption={caption}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg ref={labelSvgRef} width={80} height={310} />
        <Embedding embeddings={embeddings} />
      </div>
    </Viz>
  )
}

export default AminoAcidEmbeddingEncoder