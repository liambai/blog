import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import Papa from "papaparse"
import tokensCSVText from "!!raw-loader!../data/top_tokens.csv"
import logitsCSVText from "!!raw-loader!../data/top_logits.csv"

const SEQ =
  "SPQPLEQIKLSESQLSGRVGMIEMDLASGRTLTAWRADERFPMMSTFKVVLCGAVLARVDAGDEQLERKIHYRQQDLVDYSPVSEKHLADGMTVGELCAAAITMSDNSAANLLLATVGGPAGLTAFLRQIGDNVTRLDRWETELNEALPGDARDTTTPASMAATLRKLLTSQRLSARSQRQLLQWMVDDRVAGPLIRSVLPAGWFIADKTGAGERGARGIVALLGPNNKAERIVVIYLRDTPASMAERNQQIAGIGAALIEHWQR"

const BetaLactamaseTopTokens = () => {
  const svgRef = useRef(null)
  const yAxisRef = useRef(null)
  const containerRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const renderHeatmap = (tokens, logits) => {
    if (!tokens || !tokens.length || !logits || !logits.length) return

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove()
    d3.select(yAxisRef.current).selectAll("*").remove()

    // Set dimensions
    const margin = { top: 50, right: 25, bottom: 50, left: 50 }
    const width =
      Math.max(tokens[0].length * 20, 800) - margin.left - margin.right
    const height =
      Math.max(tokens.length * 20, 500) - margin.top - margin.bottom

    // Calculate max and min values for color scale
    let flatLogits = []
    logits.forEach(row => {
      row.forEach(val => {
        if (val && !isNaN(parseFloat(val))) {
          flatLogits.push(parseFloat(val))
        }
      })
    })

    const minLogit = d3.min(flatLogits)
    const maxLogit = d3.max(flatLogits)

    // Create color scale
    const colorScale = d3
      .scaleSequential()
      .domain([minLogit, maxLogit])
      .interpolator(d3.interpolateViridis)

    // Create the SVG canvas for main heatmap
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(0, ${margin.top})`)

    // Create separate SVG for Y axis that will stay fixed
    const yAxisSvg = d3
      .select(yAxisRef.current)
      .attr("width", margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left - 1}, ${margin.top})`)

    // Create cell size based on available space
    const cellWidth = width / tokens[0].length
    const cellHeight = height / tokens.length

    // Add Y axis labels manually at the center of each cell
    for (let i = 0; i < tokens.length; i++) {
      yAxisSvg
        .append("text")
        .attr("x", -5)
        .attr("y", i * cellHeight + cellHeight / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .text(i + 1)
    }

    // Add Y axis label
    yAxisSvg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Layer")

    // Add X axis labels (amino acid sequence)
    for (let j = 0; j < Math.min(tokens[0].length, SEQ.length); j++) {
      svg
        .append("text")
        .attr("x", j * cellWidth + cellWidth / 2)
        .attr("y", height + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(SEQ[j] || "")
    }

    // Add X axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)

    // Create heatmap cells
    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens[i].length; j++) {
        if (tokens[i][j] && logits[i] && logits[i][j]) {
          const logitValue = parseFloat(logits[i][j])

          // Skip if not a valid number
          if (isNaN(logitValue)) continue

          // Create cell rectangle
          svg
            .append("rect")
            .attr("x", j * cellWidth)
            .attr("y", i * cellHeight)
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("fill", colorScale(logitValue))
            .attr("stroke", "#ccc")
            .attr("stroke-width", 0.5)
            .style("cursor", "pointer")
            .on("mouseover", function (event) {
              tooltip.transition().duration(200).style("opacity", 0.9)
              tooltip
                .html(`Position: ${j}<br>Logit: ${logitValue.toFixed(2)}`)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
            })
            .on("mouseout", function () {
              tooltip.transition().duration(500).style("opacity", 0)
            })

          svg
            .append("text")
            .attr("x", j * cellWidth + cellWidth / 2)
            .attr("y", i * cellHeight + cellHeight / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", Math.min(cellWidth, cellHeight) * 0.8)
            .attr("fill", "#ffffff")
            .style("cursor", "pointer")
            .text(tokens[i][j])
            .on("mouseover", function (event) {
              tooltip.transition().duration(200).style("opacity", 0.9)
              tooltip
                .html(`Position: ${j}<br>Logit: ${logitValue.toFixed(2)}`)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
            })
            .on("mouseout", function () {
              tooltip.transition().duration(500).style("opacity", 0)
            })
        }
      }
    }

    // Add color legend
    const legendWidth = 200
    const legendHeight = 20

    // Position legend in top left corner
    const legendX = 0
    const legendY = 620

    const legendScale = d3
      .scaleLinear()
      .domain([minLogit, maxLogit])
      .range([0, legendWidth])

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"))

    // Create gradient for legend
    const defs = svg.append("defs")

    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")

    // Add gradient stops
    const numStops = 10
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops
      const value = minLogit + offset * (maxLogit - minLogit)

      gradient
        .append("stop")
        .attr("offset", `${offset * 100}%`)
        .attr("stop-color", colorScale(value))
    }

    // Draw legend rectangle
    svg
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")

    // Add legend axis
    svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
      .call(legendAxis)

    // Add legend title
    svg
      .append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Logit Value")

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
  }

  useEffect(() => {
    const processData = async () => {
      try {
        // Parse CSV data
        const tokensData = Papa.parse(tokensCSVText, {
          header: false,
          dynamicTyping: false, // Ensure values are kept as strings
        }).data
        const logitsData = Papa.parse(logitsCSVText, {
          header: false,
          dynamicTyping: true, // Keep dynamic typing for numeric values
        }).data

        // Remove empty rows
        const tokens = tokensData.filter(row => row.length > 1)
        const logits = logitsData.filter(row => row.length > 1)

        renderHeatmap(tokens, logits)
      } catch (error) {
        console.error("Error processing data:", error)
      }
    }

    processData()
  }, [isFullScreen]) // Re-render when fullscreen state changes

  const fullScreenStyle = isFullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
        backgroundColor: "white",
        padding: "20px",
        overflowY: "auto",
        overflowX: "auto",
      }
    : {}

  return (
    <div
      ref={containerRef}
      className="beta-lactamase-heatmap"
      style={{
        position: "relative",
        ...fullScreenStyle,
      }}
    >
      <button
        onClick={toggleFullScreen}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1001,
          padding: "8px 12px",
          background: "#4a4a4a",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        {isFullScreen ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 6V1H6M10 1H15V6M15 10V15H10M6 15H1V10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Exit Full Screen
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 1H1V6M10 1H15V6M15 10V15H10M6 15H1V10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Full Screen
          </>
        )}
      </button>
      <div style={{ display: "flex" }}>
        <div
          style={{
            position: "sticky",
            left: 0,
            zIndex: 10,
            backgroundColor: "white",
          }}
        >
          <svg ref={yAxisRef}></svg>
        </div>
        <div
          ref={scrollContainerRef}
          style={{
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          <svg
            style={{ height: isFullScreen ? "calc(100vh - 40px)" : "720px" }}
            ref={svgRef}
          ></svg>
        </div>
      </div>
    </div>
  )
}

export default BetaLactamaseTopTokens
