import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useMediaQuery } from "react-responsive"

const colors = [
  "lightblue",
  "lightyellow",
  "lightcyan",
  "lightskyblue",
  "lightgreen",
]

const Embedding = ({
  embeddings,
  width = 450,
  height = 250,
  tokenWidth = 20,
}) => {
  const data = embeddings.map((row, i) => ({
    id: i,
    backgroundColor: colors[i % colors.length],
    ...row,
  }))

  const svgRef = useRef()
  const [focusedCharIndex, setFocusedCharIndex] = useState(null)
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })

  useEffect(() => {
    const embeddingLength = data[0].embedding.length
    const svg = d3.select(svgRef.current)
    const pageBackground = getComputedStyle(document.body).backgroundColor
    svg.html("")

    const margin = 2

    const sentenceXScale = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([margin, margin + tokenWidth * data.length])

    const tokenHeight = 40
    const charBackgrounds = svg.append("g")
    const chars = svg.append("g")
    charBackgrounds
      .selectAll("g")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => sentenceXScale(i))
      .attr("y", margin)
      .attr("width", tokenWidth)
      .attr("height", tokenHeight)
      .attr("fill", (d, i) =>
        i === focusedCharIndex ? "lightgrey" : pageBackground
      )
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
      .attr("y", margin + 25)
      .attr("cursor", "default")
      .attr("text-anchor", "middle")
      .on("mouseover", (event, d) => {
        setFocusedCharIndex(d.id)
      })
      .on("mouseout", () => {
        setFocusedCharIndex(null)
      })

    const vectorBoxWidth = isMobile ? 32 : 50
    const vectorBoxHeight = isMobile ? 35 : 40
    const fontSize = isMobile ? 12 : 16
    const spaceFromSequence = 80

    // Some hacky math for mobile spacing – should probably improve this
    const offsetXMultiplier = isMobile
      ? window.innerWidth * (6 / (data.length * 5 * embeddingLength))
      : 12
    const offsetYMultiplier = 12

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

      const offsetX = i * offsetXMultiplier
      const offsetY = i * offsetYMultiplier

      // Create background of the vector
      vectorContainer
        .append("g")
        .append("rect")
        .attr("x", margin + offsetX)
        .attr("y", margin + spaceFromSequence + offsetY)
        .attr("width", vectorBoxWidth * embeddingLength)
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
        .attr("x", (d, i) => margin + i * vectorBoxWidth + offsetX)
        .attr("y", margin + spaceFromSequence + offsetY)
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
          (d, i) => margin + i * vectorBoxWidth + offsetX + vectorBoxWidth / 2
        )
        .attr(
          "y",
          margin + spaceFromSequence + offsetY + vectorBoxHeight / 2 + 6
        )
        .attr("font-size", fontSize)
    }

    if (focusedCharIndex !== null) {
      svg.select(`#vector${focusedCharIndex}`).raise()
      svg
        .append("line")
        .attr("x1", sentenceXScale(focusedCharIndex))
        .attr("y1", margin + tokenHeight)
        .attr("x2", margin + focusedCharIndex * offsetXMultiplier)
        .attr(
          "y2",
          margin + spaceFromSequence + focusedCharIndex * offsetYMultiplier
        )
        .style("stroke", "gray")
        .style("stroke-width", 2)
      svg
        .append("line")
        .attr("x1", sentenceXScale(focusedCharIndex + 1))
        .attr("y1", margin + tokenHeight)
        .attr(
          "x2",
          margin +
            focusedCharIndex * offsetXMultiplier +
            vectorBoxWidth * embeddingLength
        )
        .attr(
          "y2",
          margin + spaceFromSequence + focusedCharIndex * offsetYMultiplier
        )
        .style("stroke", "gray")
        .style("stroke-width", 2)
    }
  }, [isMobile, data, focusedCharIndex, tokenWidth])

  return <svg ref={svgRef} width={isMobile ? 350 : width} height={height} />
}

export default Embedding
