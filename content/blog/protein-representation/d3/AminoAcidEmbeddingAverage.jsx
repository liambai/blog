import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import { useMediaQuery } from "react-responsive"

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

const embeddingsAverage = [0.06, -0.08, 0.02, 0.11, 0.08]

const Arrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="80">
    <g>
      <path
        d="M150 1.5v57.88M0 1.54V0"
        stroke="#3a414a"
        stroke-width="3"
        fill="black"
        x="100"
      />
      <path
        d="M150 75.15l-4.64-14.27h9.28z"
        stroke="#3a414a"
        stroke-width="3"
        fill="#black"
      />
      <text x="170" y="40" font-size="14">
        Average
      </text>
    </g>
  </svg>
)

const AverageVector = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  const svgRef = useRef()

  const width = 300
  useEffect(() => {
    const vectorBoxWidth = isMobile ? 35 : 50
    const vectorBoxHeight = isMobile ? 35 : 40
    const fontSize = isMobile ? 12 : 16
    const offsetX = (width - vectorBoxWidth * embeddingsAverage.length) / 2
    const offsetY = 15

    // Container holding a vector
    const svg = d3.select(svgRef.current)
    const vectorContainer = svg.append("g")

    // Create background of the vector
    vectorContainer
      .append("g")
      .append("rect")
      .attr("x", offsetX)
      .attr("y", offsetY)
      .attr("width", vectorBoxWidth * embeddingsAverage.length)
      .attr("height", vectorBoxHeight)
      .attr("fill", "lightblue")
      .attr("stroke", "black")
      .attr("stroke-width", 1)

    // Create boxes in the vector
    vectorContainer
      .append("g")
      .selectAll("rect")
      .data(embeddingsAverage)
      .enter()
      .append("rect")
      .attr("x", (d, i) => offsetX + i * vectorBoxWidth)
      .attr("y", offsetY)
      .attr("width", vectorBoxWidth)
      .attr("height", vectorBoxHeight)
      .attr("fill", "lightblue")
      .attr("stroke", "black")

    // Create number entries
    vectorContainer
      .append("g")
      .selectAll("text")
      .data(embeddingsAverage)
      .enter()
      .append("text")
      .text(d => d)
      .attr("text-anchor", "middle")
      .attr("x", (d, i) => offsetX + i * vectorBoxWidth + vectorBoxWidth / 2)
      .attr("y", vectorBoxHeight / 2 + 20)
      .attr("font-size", fontSize)
  }, [isMobile, width])
  return <svg ref={svgRef} width={width} height={55}></svg>
}

const AminoAcidEmbeddingAverage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 450,
        margin: "auto",
      }}
    >
      <Embedding embeddings={embeddings} />
      <Arrow />
      <AverageVector />
    </div>
  )
}

export default AminoAcidEmbeddingAverage
