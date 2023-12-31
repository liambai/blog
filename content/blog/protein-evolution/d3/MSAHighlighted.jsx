import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import { useMediaQuery } from "react-responsive"

import { nodeIds, MSAData } from "./MSA"

const MSAHighlighted = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  const width = isMobile ? 300 : 350
  const headerHeight = 50

  const headerRef = useRef()
  const tableRef = useRef()

  useEffect(() => {
    const xScale = d3
      .scaleLinear()
      .domain([0, nodeIds.length - 1])
      .range([width / 20, width - width / 20])

    const svg = d3
      .select(headerRef.current)
      .attr("width", width)
      .attr("height", headerHeight)
    const lineGenerator = d3
      .line()
      .x((d, i) => xScale(i))
      .y(d => headerHeight / 2)

    // Header of the MSA as a linear amino acid chain
    svg
      .append("path")
      .datum(nodeIds)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("d", lineGenerator)

    svg
      .selectAll("circle")
      .data(nodeIds)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => xScale(i))
      .attr("cy", headerHeight / 2)
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", d => (d === 1 ? 3 : 1))
  }, [width])

  useEffect(() => {
    const table = d3.select(tableRef.current)
    const rows = table.selectAll("tr").data(MSAData)

    // Enter new rows
    rows
      .enter()
      .append("tr")
      .selectAll("td")
      .data(d => d)
      .enter()
      .append("td")
      .text(d => d.char)
      .style("text-align", "center")
      .style("background-color", d => (d.pos === 1 ? "lightgrey" : "white"))

    // Exit any rows not in the data
    rows.exit().remove()
  }, [])

  return (
    <div
      style={{
        margin: "auto",
        width: width,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <svg ref={headerRef} />
      <table style={{ tableLayout: "fixed" }} ref={tableRef}>
        <tbody></tbody>
      </table>
    </div>
  )
}

export default MSAHighlighted
