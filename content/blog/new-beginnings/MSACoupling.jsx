import React, { useState, useEffect, useRef } from "react"
import * as d3 from "d3"

const nodeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const MSA = [
  ["A", "T", "R", "A", "A", "L", "P", "E", "D", "C"],
  ["A", "T", "R", "A", "T", "L", "P", "E", "D", "C"],
  ["A", "T", "R", "C", "T", "L", "P", "E", "D", "C"],
  ["A", "R", "R", "A", "T", "L", "P", "D", "D", "C"],
  ["A", "R", "R", "A", "T", "L", "P", "D", "D", "A"],
  ["A", "V", "R", "A", "T", "K", "P", "W", "D", "A"],
  ["A", "V", "R", "A", "T", "L", "P", "W", "D", "A"],
  ["A", "V", "R", "A", "T", "L", "P", "W", "D", "A"],
]
const MSAData = MSA.map(row =>
  row.map((char, idx) => ({ pos: idx + 1, char: char }))
)

const MSAViz = ({ focusedNodes, setFocusedNodes }) => {
  const width = 400
  const height = 50

  const headerRef = useRef()
  const tableRef = useRef()

  const xScale = d3
    .scaleLinear()
    .domain([0, nodeIds.length - 1])
    .range([20, width - 20])

  function handleNodeMouseOver(event, d) {
    setFocusedNodes([d])
  }

  function handleNodeMouseOut() {
    setFocusedNodes([])
  }

  useEffect(() => {
    const svg = d3
      .select(headerRef.current)
      .attr("width", width)
      .attr("height", height)
    const lineGenerator = d3
      .line()
      .x((d, i) => xScale(i))
      .y(d => height / 2)

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
      .attr("stroke-width", d => (focusedNodes.includes(d) ? 3 : 1))
      .on("mouseover", handleNodeMouseOver)
      .on("mouseout", handleNodeMouseOut)
  }, [])

  useEffect(() => {
    const svg = d3.select(headerRef.current)
    svg.selectAll("circle").attr("stroke-width", d => {
      return focusedNodes.includes(d) ? 3 : 1
    })
  }, [focusedNodes])

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
      .on("mouseover", function (event, d) {
        setFocusedNodes([d.pos])
      })
      .on("mouseout", function () {
        setFocusedNodes([])
      })

    rows
      .selectAll("td")
      .style("background-color", d =>
        focusedNodes.includes(d.pos) ? "lightgrey" : "white"
      )
    // Exit any rows not in the data
    rows.exit().remove()
  }, [focusedNodes])

  return (
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
  )
}

const NetworkViz = ({ focusedNodes, setFocusedNodes }) => {
  const width = 200
  const height = 250

  const backboneEdgeWidth = 2
  const contactEdgeWidth = 8
  const contactEdgeHoverWidth = 10
  const nodeBorderWidth = 1
  const nodeBorderHoverWidth = 3

  const nodeRadius = 8
  const backboneEdgeLength = 20

  const ref = useRef()

  function handleEdgeMouseOver(event, d) {
    if (d.backbone) {
      return
    }
    d3.select(this)
      .style("stroke-width", contactEdgeHoverWidth)
      .style("stroke", "grey")
    setFocusedNodes([2, 8])
  }

  function handleEdgeMouseOut(event, d) {
    if (d.backbone) {
      return
    }
    d3.select(this)
      .style("stroke-width", contactEdgeWidth)
      .style("stroke", "lightblue")
    setFocusedNodes([])
  }

  function handleNodeMouseOver(event, d) {
    setFocusedNodes([d.id])
  }

  function handleNodeMouseOut() {
    setFocusedNodes([])
  }

  // Define a function for handling node drag
  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  }

  useEffect(() => {
    const svg = d3.select(ref.current)

    // Create sequentially connected nodes with an additional edge 2 - 8
    // representing a contact
    const nodes = nodeIds.map(k => ({ id: k }))
    let edges = nodeIds
      .slice(0, -1)
      .map(k => ({ source: k, target: k + 1, backbone: true }))
    edges.push({ source: 2, target: 8, backbone: false })

    // Create a force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(edges)
          .id(d => d.id)
          .distance(d => (d.backbone ? backboneEdgeLength : 0))
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))

    const link = svg
      .selectAll(".link")
      .data(edges)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", d => (d.backbone ? "black" : "lightblue"))
      .style("stroke-width", d =>
        d.backbone ? backboneEdgeWidth : contactEdgeWidth
      )
      .on("mouseover", handleEdgeMouseOver)
      .on("mouseout", handleEdgeMouseOut)

    const node = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", nodeRadius)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", nodeBorderWidth)
      .on("mouseover", handleNodeMouseOver)
      .on("mouseout", handleNodeMouseOut)
      .call(drag(simulation))

    // Add simulation tick handler
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

      node.attr("cx", d => d.x).attr("cy", d => d.y)
    })
  }, [])

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll(".node").attr("stroke-width", d => {
      // console.log(d.id, focusedNodes.includes(d.id))
      return focusedNodes.includes(d.id)
        ? nodeBorderHoverWidth
        : nodeBorderWidth
    })
  }, [focusedNodes])

  return <svg ref={ref} height={height} />
}

const MSACoupling = () => {
  const [focusedNodes, setFocusedNodes] = useState([])
  return (
    <div style={{ display: "flex" }}>
      <MSAViz focusedNodes={focusedNodes} setFocusedNodes={setFocusedNodes} />
      <NetworkViz
        focusedNodes={focusedNodes}
        setFocusedNodes={setFocusedNodes}
      />
    </div>
  )
}

export default MSACoupling
