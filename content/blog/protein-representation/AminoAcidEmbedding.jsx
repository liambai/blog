import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

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
const data = embeddings.map((row, i) => ({
  id: i,
  backgroundColor: colors[i % colors.length],
  ...row,
}))

const Embedding = () => {
  const svgRef = useRef()
  const [focusedCharIndex, setFocusedCharIndex] = useState(null)

  const width = 450

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.html("")

    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    const tokenWidth = 20
    const sentenceXScale = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([margin.left, margin.left + tokenWidth * data.length])

    const characterHeight = 40
    const charBackgrounds = svg.append("g")
    const chars = svg.append("g")
    charBackgrounds
      .selectAll("g")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => sentenceXScale(i))
      .attr("y", margin.top)
      .attr("width", tokenWidth)
      .attr("height", characterHeight)
      .attr("fill", (d, i) => (i === focusedCharIndex ? "lightgrey" : "white"))
      .on("mouseover", (event, d) => {
        setFocusedCharIndex(d.id)
      })
      .on("mouseout", () => {
        setFocusedCharIndex(null)
      })

    chars
      .selectAll("g")
      .data(data)
      .enter()
      .append("text")
      .text(d => d.char)
      .attr("x", (d, i) => sentenceXScale(i + 0.5))
      .attr("y", margin.top + 25)
      .attr("cursor", "default")
      .attr("text-anchor", "middle")
      .on("mouseover", (event, d) => {
        setFocusedCharIndex(d.id)
      })
      .on("mouseout", () => {
        setFocusedCharIndex(null)
      })

    const vectorBoxWidth = 50
    const vectorBoxHeight = 40

    // Container holding the stack of vectors
    const vectorsContainer = svg.append("g")
    for (let i = 0; i < data.length; i++) {
      // Container holding a vector
      const vectorContainer = vectorsContainer
        .append("g")
        .attr("id", "vector" + i)
        .on("mouseover", () => {
          setFocusedCharIndex(i)
        })
        .on("mouseout", () => {
          setFocusedCharIndex(null)
        })
      const offset = i * 12

      // Create background of the vector
      vectorContainer
        .append("g")
        .append("rect")
        .attr("x", margin.left + offset)
        .attr("y", margin.top + 100 + offset)
        .attr("width", vectorBoxWidth * data[0].embedding.length)
        .attr("height", vectorBoxHeight)
        .attr("fill", data[i].backgroundColor)
        .attr("stroke", "black")
        .attr("stroke-width", i === focusedCharIndex ? 3 : 1)

      // Create boxes in the vector
      vectorContainer
        .append("g")
        .selectAll("rect")
        .data(data[i].embedding)
        .enter()
        .append("rect")
        .attr("x", (d, i) => margin.left + i * vectorBoxWidth + offset)
        .attr("y", margin.top + 100 + offset)
        .attr("width", vectorBoxWidth)
        .attr("height", vectorBoxHeight)
        .attr("fill", data[i].backgroundColor)
        .attr("stroke", "black")

      // Create number entries
      vectorContainer
        .append("g")
        .selectAll("text")
        .data(data[i].embedding)
        .enter()
        .append("text")
        .text(d => d)
        .attr("id", "text" + i)
        .attr("text-anchor", "middle")
        .attr(
          "x",
          (d, i) =>
            margin.left + i * vectorBoxWidth + offset + vectorBoxWidth / 2
        )
        .attr("y", margin.top + 100 + offset + 25)
    }

    if (focusedCharIndex !== null) {
      svg.select(`#vector${focusedCharIndex}`).raise()
      svg
        .append("line")
        .attr("x1", sentenceXScale(focusedCharIndex))
        .attr("y1", margin.top + characterHeight)
        .attr("x2", margin.left + focusedCharIndex * 12)
        .attr("y2", margin.top + 100 + focusedCharIndex * 12)
        .style("stroke", "gray")
        .style("stroke-width", 2)
      svg
        .append("line")
        .attr("x1", sentenceXScale(focusedCharIndex + 1))
        .attr("y1", margin.top + characterHeight)
        .attr(
          "x2",
          margin.left +
            focusedCharIndex * 12 +
            vectorBoxWidth * data[0].embedding.length
        )
        .attr("y2", margin.top + 100 + focusedCharIndex * 12)
        .style("stroke", "gray")
        .style("stroke-width", 2)
    }
  }, [focusedCharIndex])

  return (
    <div style={{ textAlign: "center" }}>
      <svg ref={svgRef} width={width} height={310} />
    </div>
  )
}

export default Embedding
