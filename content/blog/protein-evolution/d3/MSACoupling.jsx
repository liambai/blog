import React, { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { useMediaQuery } from "react-responsive"

import { nodeIds, MSAData } from "./MSA"

const MSAViz = ({ focusedNodes, setFocusedNodes }) => {
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
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => setFocusedNodes([d]))
      .on("mouseout", () => setFocusedNodes([]))
  }, [width, setFocusedNodes])

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
      .style("cursor", "default")
      .on("mouseover", (event, d) => setFocusedNodes([d.pos]))
      .on("mouseout", () => setFocusedNodes([]))

    rows
      .selectAll("td")
      .style("background-color", d =>
        focusedNodes.includes(d.pos) ? "lightgrey" : "white"
      )
  }, [focusedNodes, setFocusedNodes])

  return (
    <div
      style={{
        width: width,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h5 style={{ margin: "auto" }}>MSA</h5>
      <svg ref={headerRef} />
      <table style={{ tableLayout: "fixed" }} ref={tableRef} />
    </div>
  )
}

const NetworkViz = ({ focusedNodes, setFocusedNodes }) => {
  const width = 200
  const height = 280

  const backboneEdgeWidth = 2
  const contactEdgeWidth = 8
  const contactEdgeHoverWidth = 10
  const nodeBorderWidth = 1
  const nodeBorderHoverWidth = 3

  const nodeRadius = 8
  const backboneEdgeLength = 20

  const ref = useRef()

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
      .force("center", d3.forceCenter(width / 2, height / 2 - 10))

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
      .on("mouseover", function (event, d) {
        if (!d.backbone) {
          d3.select(this)
            .style("stroke-width", contactEdgeHoverWidth)
            .style("stroke", "grey")
          setFocusedNodes([2, 8])
        }
      })
      .on("mouseout", function (event, d) {
        if (!d.backbone) {
          d3.select(this)
            .style("stroke-width", contactEdgeWidth)
            .style("stroke", "lightblue")
          setFocusedNodes([])
        }
      })

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
      .on("mouseover", (event, d) => setFocusedNodes([d.id]))
      .on("mouseout", () => setFocusedNodes([]))
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
  }, [setFocusedNodes])

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll(".node").attr("stroke-width", d => {
      // console.log(d.id, focusedNodes.includes(d.id))
      return focusedNodes.includes(d.id)
        ? nodeBorderHoverWidth
        : nodeBorderWidth
    })
  }, [focusedNodes])

  return (
    <svg ref={ref} height={height} width={width} style={{ margin: "auto" }} />
  )
}

const MSACoupling = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  const [focusedNodes, setFocusedNodes] = useState([])
  return (
    <div
      style={{
        display: "flex",
        marginBottom: 10,
        flexDirection: isMobile ? "column-reverse" : "row",
      }}
    >
      <MSAViz focusedNodes={focusedNodes} setFocusedNodes={setFocusedNodes} />
      <NetworkViz
        focusedNodes={focusedNodes}
        setFocusedNodes={setFocusedNodes}
      />
    </div>
  )
}

export default MSACoupling
