import React, { useState, useEffect, useRef } from "react"
import * as d3 from "d3"

const initialProbs = {
  "z = [-0.1, 0.2, 0.5]": 0.09,
  "z = [0.2, 0.1, -0.2]": 0.12,
  "z = [-0.1, 0.2, 0.2]": 0.09,
  "z = [0.3, 0.3, -0.1]": 0.05,
  "z = [0.4, -0.6, 0.1]": 0.08,
}

const HorizontalPDFGraph = ({
  initialProbs,
  width,
  leftLabelSpace,
  labelLength,
  incomplete = false,
}) => {
  const svgRef = useRef()

  const [probs, setProbs] = useState(initialProbs)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.html("")

    const height = 250
    const margin = { top: 30, right: 10, bottom: 50, left: 0 }

    svg.attr("width", width).attr("height", height)

    const x = d3.scaleLinear().domain([0, 1]).range([leftLabelSpace, width])

    let yDomain = Object.keys(probs)
    if (incomplete) {
      yDomain.push("dummy")
    }
    const y = d3
      .scaleBand()
      .domain(yDomain)
      .range([margin.top, height - margin.bottom])
      .padding(0.1)

    // Bars with tooltips
    svg
      .append("g")
      .selectAll("rect")
      .data(Object.entries(probs))
      .enter()
      .append("rect")
      .attr("x", x(0))
      .attr("y", d => y(d[0]))
      .attr("width", d => x(d[1]) - leftLabelSpace)
      .attr("height", y.bandwidth())
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "midnightblue")
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", x(d[1]) + 5)
          .attr("y", y(d[0]) + y.bandwidth() / 2)
          .attr("dy", "0.35em")
          .attr("dx", "0.5em")
          .text(`p(${d[0]}) = ${d[1].toFixed(2)}`)
          .style("font-size", 12)
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue")
        svg.selectAll(".tooltip").remove()
      })

    // Labels on the y-axis for each bar
    svg
      .append("g")
      .selectAll("text")
      .data(Object.entries(probs))
      .enter()
      .append("text")
      .text(d => d[0])
      .attr("x", leftLabelSpace - labelLength)
      .attr("y", d => y(d[0]) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", "0.5em")
      .style("font-size", 12)

    // X-axis with ticks
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))

    // X-axis label
    svg
      .append("text")
      .attr("x", x(0.5))
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("p(z)")
      .style("font-size", 14)

    // Dots indicating omitted bars
    if (incomplete) {
      const data = [175, 182, 189]
      svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", leftLabelSpace / 2)
        .attr("cy", d => d)
        .attr("r", 1.5)
    }
  }, [incomplete, leftLabelSpace, labelLength, probs, width])

  const handleButtonClick = () => {
    let newProbs = { ...probs }
    for (const key in probs) {
      const newProb = probs[key] + 0.05 * (Math.random() - 0.5)
      if (newProb > 0) {
        newProbs[key] = newProb
      }
    }
    setProbs(newProbs)
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        style={{ position: "absolute", top: 30, right: 100 }}
        onClick={handleButtonClick}
      >
        Update
      </button>
      <svg ref={svgRef} style={{ margin: "auto", width: width }} />
    </div>
  )
}

const DistributionUpdate = () => {
  return (
    <HorizontalPDFGraph
      initialProbs={initialProbs}
      width={400}
      leftLabelSpace={120}
      labelLength={120}
      incomplete
    />
  )
}

export default DistributionUpdate
