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
  const legendRef = useRef(null)
  const containerRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [colorScaleData, setColorScaleData] = useState({
    minLogit: 0,
    maxLogit: 1,
  })

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const renderLegend = () => {
    const { minLogit, maxLogit } = colorScaleData
    if (minLogit === undefined || maxLogit === undefined) return

    d3.select(legendRef.current).selectAll("*").remove()

    const margin = { top: 25, right: 10, bottom: 20, left: 10 }
    const legendWidth = 200
    const legendHeight = 20

    const svg = d3
      .select(legendRef.current)
      .attr("width", legendWidth + margin.left + margin.right)
      .attr("height", legendHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const legendScale = d3
      .scaleLinear()
      .domain([minLogit, maxLogit])
      .range([0, legendWidth])

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"))

    // Create color scale
    const colorScale = d3
      .scaleSequential()
      .domain([minLogit, maxLogit])
      .interpolator(d3.interpolateViridis)

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
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")

    // Add legend axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)

    // Add legend title
    svg
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Logit Value")
  }

  const renderHeatmap = (tokens, logits) => {
    if (!tokens || !tokens.length || !logits || !logits.length) return

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove()
    d3.select(yAxisRef.current).selectAll("*").remove()

    // Set dimensions
    const margin = { top: 20, right: 25, bottom: 30, left: 50 }
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

    // Update color scale data for the legend
    setColorScaleData({ minLogit, maxLogit })

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
      // Show label only for first, last, and every 5th layer
      if (i === 0 || i === tokens.length - 1 || (i + 1) % 5 === 0) {
        yAxisSvg
          .append("text")
          .attr("x", -5)
          .attr("y", i * cellHeight + cellHeight / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "12px")
          .text(i + 1)
      }
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

    // Get the last row of tokens to compare against for coloring
    const lastRowTokens = tokens[tokens.length - 1]

    // Add X axis labels (amino acid sequence)
    for (let j = 0; j < Math.min(tokens[0].length, SEQ.length); j++) {
      let textColor = "#000000" // Default black color
      if (j < lastRowTokens.length) {
        for (let i = 0; i < tokens.length - 1; i++) {
          if (SEQ[j] !== lastRowTokens[j]) {
            textColor = "#ff0000" // Red color for non-matching tokens
            break
          }
        }
      }

      // Add position number above every 10th position or at the first/last position
      if ((j + 1) % 10 === 0 || j === 0 || j === SEQ.length - 1) {
        svg
          .append("text")
          .attr("x", j * cellWidth + cellWidth / 2)
          .attr("y", -5)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .text(j + 1)
      }

      svg
        .append("text")
        .attr("x", j * cellWidth + cellWidth / 2)
        .attr("y", height + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", textColor)
        .text(SEQ[j] || "")
    }

    // Add X axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("True Amino Acid Sequence")

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
                .html(`Position: ${j + 1}<br>Logit: ${logitValue.toFixed(2)}`)
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
                .html(`Position: ${j + 1}<br>Logit: ${logitValue.toFixed(2)}`)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
            })
            .on("mouseout", function () {
              tooltip.transition().duration(500).style("opacity", 0)
            })
        }
      }
    }
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

  // Render the legend whenever colorScaleData changes
  useEffect(() => {
    renderLegend()
  }, [colorScaleData])

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

      {/* Fixed legend positioned at the top */}
      <div
        style={{
          position: "sticky",
          top: isFullScreen ? "10px" : "0",
          left: 50,
          zIndex: 100,
          backgroundColor: "white",
          padding: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          borderRadius: "4px",
          marginBottom: "10px",
          width: "fit-content",
        }}
      >
        <svg ref={legendRef} width="220" height="50"></svg>
      </div>

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
          <svg ref={svgRef}></svg>
        </div>
      </div>

      {/* Sticky label for the amino acid sequence */}
      <div
        style={{
          position: "sticky",
          bottom: isFullScreen ? "10px" : "0",
          width: "100%",
          textAlign: "center",
          backgroundColor: "white",
          zIndex: 100,
          fontWeight: 500,
          fontSize: 12,
          paddingLeft: 50,
        }}
      >
        True Amino Acid Sequence
      </div>
    </div>
  )
}

export default BetaLactamaseTopTokens
