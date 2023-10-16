import React, { useEffect, useRef } from "react"
import * as d3 from "d3"

export const nodeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

const NetworkViz = () => {
  const width = 220
  const height = 130

  const backboneEdgeWidth = 2
  const contactEdgeWidth = 8
  const contactEdgeHoverWidth = 10
  const nodeBorderWidth = 1

  const nodeRadius = 10
  const backboneEdgeLength = 20

  const ref = useRef()

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.style("transform", "perspective(600px) rotateY(-45deg) rotateZ(24deg)")

    // Create sequentially connected nodes with an additional edge 2 - 8
    // representing a contact
    const nodes = nodeIds.map(k => ({ id: k }))
    let edges = nodeIds
      .slice(0, -1)
      .map(k => ({ source: k, target: k + 1, backbone: true }))
    edges.push({ source: 2, target: 6, backbone: false })
    edges.push({ source: 5, target: 10, backbone: false })

    // Create a force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(edges)
          .id(d => d.id)
          .distance(d => (d.backbone ? backboneEdgeLength : 15))
      )
      .force("charge", d3.forceManyBody().strength(-60))
      .force("center", d3.forceCenter(width / 2, height / 2 + 5))

    const link = svg
      .selectAll(".link")
      .data(edges)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", d => (d.backbone ? "black" : null))
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

    // Add simulation tick handler
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

      node.attr("cx", d => d.x).attr("cy", d => d.y)
    })

    // Add bounding box
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
  }, [])

  return (
    <svg ref={ref} height={height} width={width} style={{ margin: "auto" }} />
  )
}

export default NetworkViz
