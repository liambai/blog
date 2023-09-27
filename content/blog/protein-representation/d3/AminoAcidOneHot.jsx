import React from "react"

import Embedding from "./Embedding"
import Viz from "../../../../src/components/viz"

const embeddings = [
  { char: "L", embedding: [1, 0, 0, 0, 0, 0, 0, 0] },
  { char: "T", embedding: [0, 1, 0, 0, 0, 0, 0, 0] },
  { char: "R", embedding: [0, 0, 1, 0, 0, 0, 0, 0] },
  { char: "A", embedding: [0, 0, 0, 1, 0, 0, 0, 0] },
  { char: "A", embedding: [0, 0, 0, 1, 0, 0, 0, 0] },
  { char: "L", embedding: [1, 0, 0, 0, 0, 0, 0, 0] },
  { char: "Y", embedding: [0, 0, 0, 0, 1, 0, 0, 0] },
  { char: "E", embedding: [0, 0, 0, 0, 0, 1, 0, 0] },
  { char: "D", embedding: [0, 0, 0, 0, 0, 0, 1, 0] },
  { char: "C", embedding: [0, 0, 0, 0, 0, 0, 0, 1] },
]

const AminoAcidOneHot = ({ caption }) => {
  return (
    <Viz caption={caption}>
      <Embedding embeddings={embeddings} width={600} />
    </Viz>
  )
}

export default AminoAcidOneHot
