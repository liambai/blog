import React, { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { BlockMath } from "react-katex"
import { useMediaQuery } from "react-responsive"

import { MSA, MSAData } from "./MSA"
import Viz from "../../../src/components/viz"

const nodeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const MSAViz = ({ focusedColumn, setFocusedColumn }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  const width = isMobile ? 300 : 350
  const height = 50

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
      if (d === 2) {
        return 3
      }
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
      .style("background-color", d => (d.pos === 2 ? "lightgrey" : "white"))
      .style("cursor", "default")
      .on("mouseover", (event, d) => setFocusedColumn(d.pos))
      .on("mouseout", () => setFocusedColumn(null))

    rows.selectAll("td").style("background-color", d => {
      if (focusedColumn === d.pos || d.pos === 2) {
        return "lightgrey"
      }
    })
  }, [focusedColumn, setFocusedColumn])

  let equations = []
  if (focusedColumn && focusedColumn !== 2) {
    let charPairToFreqs = {}
    for (let row = 0; row < 8; row++) {
      const char = MSA[row][focusedColumn - 1]
      const charPair = `${MSA[row][1]}${char}`
      if (charPairToFreqs[charPair]) {
        charPairToFreqs[charPair]++
      } else {
        charPairToFreqs[charPair] = 1
      }
    }
    equations = Object.entries(charPairToFreqs).map(([c, freq]) => {
      const subscript = [2, focusedColumn].sort((a, b) => a - b).join(",")
      return `f_{${subscript}}(\\text{${c[0]}}, \\text{${c[1]}}) = ${freq / 8}`
    })
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
        marginBottom: -20,
      }}
    >
      <div
        style={{
          width: width,
          display: "flex",
          flexDirection: "column",
          margin: isMobile ? "auto" : 0,
        }}
      >
        <svg ref={headerRef} />
        <table style={{ tableLayout: "fixed" }} ref={tableRef}>
          <tbody></tbody>
        </table>
      </div>
      <div style={{ margin: "auto", height: isMobile ? 175 : "none" }}>
        {focusedColumn && (
          <div>
            {equations.map(equation => (
              <BlockMath key={equation}>{equation}</BlockMath>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const MSACovariance = ({ caption }) => {
  const [focusedColumn, setFocusedColumn] = useState(null)

  return (
    <Viz caption={caption}>
      <MSAViz
        focusedColumn={focusedColumn}
        setFocusedColumn={setFocusedColumn}
      />
    </Viz>
  )
}

export default MSACovariance
