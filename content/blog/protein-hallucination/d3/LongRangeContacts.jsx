import React, { useEffect, useRef } from "react"
import * as d3 from "d3"

export const nodeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const NetworkViz = () => {
  const width = 300
  const height = 280

  const backboneEdgeWidth = 2
  const contactEdgeWidth = 8
  const contactEdgeHoverWidth = 10
  const nodeBorderWidth = 1

  const nodeRadius = 12
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
        }
      })
      .on("mouseout", function (event, d) {
        if (!d.backbone) {
          d3.select(this)
            .style("stroke-width", contactEdgeWidth)
            .style("stroke", "lightblue")
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
      .attr("cursor", "pointer")
      .call(drag(simulation))

    const labels = svg
      .selectAll(".label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "black")
      .text(d => d.id)
      .attr("cursor", "pointer")
      .attr("pointer-events", "none")
      .attr("font-size", 13)

    // Add simulation tick handler
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

      node.attr("cx", d => d.x).attr("cy", d => d.y)
      labels.attr("x", d => d.x).attr("y", d => d.y)
    })
  }, [])

  return (
    <svg ref={ref} height={height} width={width} style={{ margin: "auto" }} />
  )
}

export default NetworkViz
