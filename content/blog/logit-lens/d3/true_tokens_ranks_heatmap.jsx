import React, { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import Papa from "papaparse"
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri"

const fetchCSV = async path => {
  try {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch CSV: ${response.status} ${response.statusText}`
      )
    }
    return await response.text()
  } catch (error) {
    console.error(`Error importing CSV from path: ${path}`, error)
    return null
  }
}

const TrueTokensRanksHeatmap = ({ title, sequence, ranksPath }) => {
  const svgRef = useRef(null)
  const yAxisRef = useRef(null)
  const containerRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [ranks, setRanks] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const loadCSVFromPaths = async () => {
      const ranksData = await fetchCSV(ranksPath)
      const ranks = Papa.parse(ranksData, {
        header: false,
      }).data
      setRanks(ranks)
    }

    loadCSVFromPaths()
  }, [ranksPath])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const renderHeatmap = useCallback(
    ranks => {
      if (!ranks || !ranks.length) return

      // Clear previous SVG content
      d3.select(svgRef.current).selectAll("*").remove()
      d3.select(yAxisRef.current).selectAll("*").remove()

      const margin = { top: 20, right: 25, bottom: 25, left: 50 }
      const width =
        Math.max(ranks[0].length * 20, 800) - margin.left - margin.right
      const height =
        Math.max(ranks.length * 20, 500) - margin.top - margin.bottom

      // Create color scale
      const colorScale = d3
        .scaleSequential()
        .domain([0, 20])
        .interpolator(t => d3.interpolateViridis(1 - t))

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
      const cellWidth = width / ranks[0].length
      const cellHeight = height / ranks.length

      // Add Y axis labels manually at the center of each cell
      for (let i = 0; i < ranks.length; i++) {
        // Show label only for first, last, and every 5th layer
        if (i === 0 || i === ranks.length - 1 || (i + 1) % 5 === 0) {
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

      const lastRowRanks = ranks[ranks.length - 1]
      for (let j = 0; j < sequence.length; j++) {
        let textColor = "#000000" // Default black color
        if (parseInt(lastRowRanks[j]) !== 0) {
          textColor = "#ff0000" // Red color for when the top predicted token is not rank 0
        }

        // Add position number above every 10th position or at the first/last position
        if ((j + 1) % 10 === 0 || j === 0 || j === sequence.length - 1) {
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
          .attr("y", height + 16)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", textColor)
          .text(sequence[j] || "")
      }

      // Add X axis label
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Amino Acid Sequence")

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

      // Create function to handle tooltip events
      const handleMouseOver = (event, i, j) => {
        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(`Position: ${j + 1}<br>Layer: ${i + 1}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      }

      const handleMouseOut = () => {
        tooltip.transition().duration(500).style("opacity", 0)
      }

      // Create heatmap cells
      for (let i = 0; i < ranks.length; i++) {
        for (let j = 0; j < ranks[i].length; j++) {
          if (ranks[i][j]) {
            const rankValue = parseFloat(ranks[i][j])

            // Skip if not a valid number
            if (isNaN(rankValue)) continue

            // Create cell rectangle
            svg
              .append("rect")
              .attr("x", j * cellWidth)
              .attr("y", i * cellHeight)
              .attr("width", cellWidth)
              .attr("height", cellHeight)
              .attr("fill", colorScale(rankValue))
              .attr("stroke", "#ccc")
              .attr("stroke-width", 0.5)
              .style("cursor", "pointer")
              .on("mouseover", function (event) {
                handleMouseOver(event, i, j)
              })
              .on("mouseout", handleMouseOut)

            svg
              .append("text")
              .attr("x", j * cellWidth + cellWidth / 2)
              .attr("y", i * cellHeight + cellHeight / 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("font-size", Math.min(cellWidth, cellHeight) * 0.8)
              .attr("fill", "#ffffff")
              .style("cursor", "pointer")
              .text(ranks[i][j])
              .on("mouseover", function (event) {
                handleMouseOver(event, i, j, rankValue)
              })
              .on("mouseout", handleMouseOut)
          }
        }
      }
    },
    [sequence]
  )

  useEffect(() => {
    // Render heatmap when data is available and when fullscreen state changes
    if (ranks.length) {
      renderHeatmap(ranks)
    }
  }, [ranks, renderHeatmap])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // Adjust threshold as needed
    }
    checkMobile() // Initial check
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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
      className="token-logit-heatmap"
      style={{
        position: "relative",
        marginBottom: 10,
        ...fullScreenStyle,
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginLeft: 50,
          marginTop: 15,
          marginBottom: 15,
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        {title}
      </h2>

      <div style={{ display: "flex" }}>
        <div>
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
          width: "100%",
          textAlign: "center",
          backgroundColor: "white",
          fontWeight: 500,
          fontSize: 12,
          paddingLeft: 50,
          marginBottom: 15,
        }}
      >
        Amino Acid Sequence
      </div>

      {/* Bottom controls section */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 10,
          marginBottom: 20,
          paddingLeft: 50,
          backgroundColor: "white",
        }}
      >
        {/* Full screen button */}
        {!isMobile && (
          <button
            onClick={toggleFullScreen}
            style={{
              padding: "8px 12px",
              background: "#4a4a4a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginRight: 10,
            }}
          >
            {isFullScreen ? (
              <>
                <RiFullscreenExitFill size={16} />
                Exit Full Screen
              </>
            ) : (
              <>
                <RiFullscreenFill size={16} />
                Full Screen
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default TrueTokensRanksHeatmap
