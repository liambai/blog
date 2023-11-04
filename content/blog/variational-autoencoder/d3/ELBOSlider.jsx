import React, { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { sliderBottom } from "d3-simple-slider"

const Slider = () => {
  const sliderRef = useRef()
  const [pos, setPos] = useState(-10)

  useEffect(() => {
    const slider = sliderBottom()
      .min(-10)
      .max(-2)
      .step(0.1)
      .width(250)
      .default(-10)
      .displayValue(false)
      .on("onchange", x => {
        setPos(x)
      })

    const g = d3
      .select(sliderRef.current)
      .append("g")
      .attr("transform", "translate(30,30)")

    g.call(slider)
  }, [])

  const ELBOLineRef = useRef()
  const ELBOLabelRef = useRef()
  const errorLineRef = useRef()
  const errorELBOLabelRef = useRef()
  useEffect(() => {
    const x = 55 + (pos + 10) * (250 / 8)
    d3.select(ELBOLineRef.current)
      .attr("d", `M${x} 60 V100`)
      .attr("stroke", "black")
      .attr("stroke-width", 2)

    d3.select(ELBOLabelRef.current)
      .attr("x", x - 17)
      .attr("y", 50)
      .attr("font-size", 13)

    d3.select(errorLineRef.current)
      .attr("d", `M${x + 1} 80 H304`)
      .attr("stroke", "lightcoral")
      .attr("stroke-width", 5)

    d3.select(errorELBOLabelRef.current)
      .attr("x", (x + 232) / 2)
      .attr("y", 96)
      .attr("font-size", 13)
      .attr("opacity", () => (pos > -5 ? 0 : 1))
  }, [pos])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <svg style={{ width: 350, height: 100 }}>
        <text ref={ELBOLabelRef}>ELBO</text>
        <path ref={ELBOLineRef} />
        <path d="M305 30 V100" stroke="black" strokeWidth="2"></path>
        <text x="278" y="20" fontSize={13}>
          log(p(x))
        </text>
        <path ref={errorLineRef} />
        <text ref={errorELBOLabelRef}>Divergence</text>
      </svg>
      <svg ref={sliderRef} style={{ height: 80 }} />
    </div>
  )
}

export default Slider
