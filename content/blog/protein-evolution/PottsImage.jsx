import React from "react"
import potts from "./potts.png"
import Viz from "../../../src/components/viz"

const PottsImage = ({ caption }) => (
  <Viz caption={caption}>
    <div style={{ width: "50%", margin: "auto", marginBottom: 10 }}>
      <img src={potts}></img>
    </div>
  </Viz>
)

export default PottsImage
