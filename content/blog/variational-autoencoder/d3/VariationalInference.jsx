import React, { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { sliderBottom } from "d3-simple-slider"

function gaussian(x, mean = 0, sigma = 1) {
  x = (x - mean) / sigma
  return ((1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x)) / sigma
}

const sampleData = []
for (let i = 0; i < 25; i++) {
  const x = 10 * Math.random() - 5
  const y = gaussian(x, 2, 1.5)
  sampleData.push({
    x: x + 0.2 * Math.random() - 0.1,
    y: y + 0.2 * Math.random() - 0.1,
  })
}

function VariationalInference() {
  const width = 320
  const height = 160

  const plotRef = useRef()

  const [mean, setMean] = useState(0)
  const [variance, setVariance] = useState(1)

  const xScale = d3.scaleLinear().range([0, width])
  const yScale = d3.scaleLinear().range([height - 10, 10])

  useEffect(() => {
    const line = d3
      .line()
      .x(function (d) {
        return xScale(d.x)
      })
      .y(function (d) {
        return height - d.y * 300 - 5
      })

    const svg = d3
      .select(plotRef.current)
      .attr("width", width)
      .attr("height", height)

    let lineSvg = svg.select("g")
    if (lineSvg.empty()) {
      lineSvg = svg.append("g")
    }
    lineSvg.html("")

    // Create some evenly spaced x data
    const lineData = []
    for (let x = -5; x < 5; x = x + 0.1) {
      const y = gaussian(x, mean, variance)
      lineData.push({
        x: x,
        y: y,
      })
    }

    xScale.domain(
      d3.extent(lineData, function (d) {
        return d.x
      })
    )
    yScale.domain(
      d3.extent(lineData, function (d) {
        return d.y
      })
    )

    lineSvg
      .append("path")
      .datum(lineData)
      .attr("class", "line")
      .attr("fill", "none") // Set fill to "none" to remove the fill
      .attr("stroke", "black") // Set the line color
      .attr("stroke-width", 2) // Set the line width
      .attr("d", line)
  }, [mean, variance, xScale, yScale])

  useEffect(() => {
    d3.select(plotRef.current)
      .selectAll("circle")
      .data(sampleData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => height - d.y * 300 - 5)
      .attr("r", 2)
      .attr("fill", "slateblue")
  }, [xScale])

  const meanSliderRef = useRef()

  useEffect(() => {
    const meanSlider = sliderBottom()
      .min(-5)
      .max(5)
      .step(0.5)
      .width(240)
      .default(0)
      .on("onchange", x => {
        setMean(x)
      })
    const g = d3
      .select(meanSliderRef.current)
      .append("g")
      .attr("transform", "translate(30,30)")

    g.call(meanSlider)
  }, [])

  const varianceSliderRef = useRef()
  useEffect(() => {
    const varianceSlider = sliderBottom()
      .min(0)
      .max(5)
      .step(0.5)
      .width(240)
      .default(1)
      .on("onchange", x => {
        setVariance(x)
      })
    const g = d3
      .select(varianceSliderRef.current)
      .append("g")
      .attr("transform", "translate(30,30)")

    g.call(varianceSlider)
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <svg ref={plotRef} />
      <span style={{ fontSize: 13, marginBottom: -15 }}>mean</span>
      <svg ref={meanSliderRef} style={{ height: 65 }} />
      <span style={{ fontSize: 13, marginTop: 20, marginBottom: -15 }}>
        variance
      </span>
      <svg ref={varianceSliderRef} style={{ height: 65 }} />
    </div>
  )
}

export default VariationalInference
