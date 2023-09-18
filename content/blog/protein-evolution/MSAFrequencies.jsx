import React, { useState, useRef, useEffect } from "react"
import * as d3 from "d3"
import { BlockMath } from "react-katex"

import { MSA, MSAData } from "./MSA"
import Viz from "../../../src/components/viz"

const nodeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const MSAFrequencies = ({ caption }) => {
  const width = 350
  const height = 50

  const headerRef = useRef()
  const tableRef = useRef()

  const [focusedColumn, setFocusedColumn] = useState()

  useEffect(() => {
    const xScale = d3
      .scaleLinear()
      .domain([0, nodeIds.length - 1])
      .range([width / 20, width - width / 20])

    const svg = d3
      .select(headerRef.current)
      .attr("width", width)
      .attr("height", height)
    const lineGenerator = d3
      .line()
      .x((d, i) => xScale(i))
      .y(d => height / 2)

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
      .attr("cy", height / 2)
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => setFocusedColumn(d))
      .on("mouseout", () => setFocusedColumn(null))
  }, [setFocusedColumn])

  useEffect(() => {
    const svg = d3.select(headerRef.current)
    svg.selectAll("circle").attr("stroke-width", d => {
      return focusedColumn === d ? 3 : 1
    })
  }, [focusedColumn])

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
      .on("mouseover", (event, d) => setFocusedColumn(d.pos))
      .on("mouseout", () => setFocusedColumn(null))

    rows
      .selectAll("td")
      .style("background-color", d =>
        focusedColumn === d.pos ? "lightgrey" : "white"
      )
  }, [focusedColumn, setFocusedColumn])

  let equations = []
  if (focusedColumn) {
    let charToFreqs = {}
    for (let row = 0; row < 8; row++) {
      const char = MSA[row][focusedColumn - 1]
      if (charToFreqs[char]) {
        charToFreqs[char]++
      } else {
        charToFreqs[char] = 1
      }
    }
    equations = Object.entries(charToFreqs).map(
      ([c, freq]) => `f_{${focusedColumn}}(\\text{${c}}) = ${freq / 8}`
    )
  }

  return (
    <Viz caption={caption}>
      <div
        style={{
          display: "flex",
          marginBottom: -20,
        }}
      >
        <div
          style={{
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
        <div style={{ margin: "auto" }}>
          {focusedColumn && (
            <div>
              {equations.map(equation => (
                <BlockMath key={equation}>{equation}</BlockMath>
              ))}
            </div>
          )}
        </div>
      </div>
    </Viz>
  )
}

export default MSAFrequencies
