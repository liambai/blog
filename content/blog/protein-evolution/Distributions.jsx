import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import { useMediaQuery } from "react-responsive"

import Viz from "../../../src/components/viz"

const dieProbs = {
  1: 1 / 6,
  2: 1 / 6,
  3: 1 / 6,
  4: 1 / 6,
  5: 1 / 6,
  6: 1 / 6,
}

const seqProbs = {
  ATRAALYEDC: 0.1,
  ATRATLYEDC: 0.12,
  ATRCTLYEDC: 0.09,
  TTRCTLTTDT: 0.01,
  TTRCTLYEDC: 0.03,
}

const HorizontalPDFGraph = ({
  probs,
  title,
  width,
  leftLabelSpace,
  labelLength,
  incomplete = false,
}) => {
  const svgRef = useRef()

  useEffect(() => {
    const svg = d3.select(svgRef.current)
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
          .text(`P(${d[0]}) = ${d[1].toFixed(2)}`)
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
      .text("Probability")
      .style("font-size", 14)

    // Title
    svg
      .append("text")
      .attr("x", x(0.5))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text(title)
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
  }, [incomplete, leftLabelSpace, probs, title, width])

  return <svg ref={svgRef} style={{ margin: "auto" }} />
}

const Distributions = ({ caption }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" })
  return (
    <Viz caption={caption}>
      <div
        style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}
      >
        <HorizontalPDFGraph
          probs={dieProbs}
          title="Die outcomes"
          width={isMobile ? 300 : 250}
          leftLabelSpace={isMobile ? 100 : 25}
          labelLength={25}
        />
        <HorizontalPDFGraph
          probs={seqProbs}
          title="Sequences in a given family"
          width={isMobile ? 300 : 400}
          leftLabelSpace={isMobile ? 100 : 100}
          labelLength={100}
          incomplete
        />
      </div>
    </Viz>
  )
}

export default Distributions
