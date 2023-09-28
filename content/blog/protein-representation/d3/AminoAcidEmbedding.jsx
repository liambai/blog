import React from "react"

import Embedding from "./Embedding"

const embeddings = [
  { char: "L", embedding: [0.1, -0.2, 0.3, 0.4, -0.5] },
  { char: "T", embedding: [-0.2, 0.3, -0.4, 0.1, 0.6] },
  { char: "R", embedding: [0.3, 0.2, -0.1, -0.5, 0.4] },
  { char: "A", embedding: [0.4, -0.3, -0.2, 0.5, -0.1] },
  { char: "A", embedding: [0.3, -0.3, -0.2, 0.5, 0.1] },
  { char: "L", embedding: [0.1, -0.1, 0.3, 0.4, -0.3] },
  { char: "Y", embedding: [0.1, -0.2, 0.3, 0.4, -0.5] },
  { char: "E", embedding: [-0.2, -0.8, 0.5, 0.3, 0.6] },
  { char: "D", embedding: [-0.4, 0.2, -0.5, 0.3, 0.1] },
  { char: "C", embedding: [0.6, -0.1, 0.3, -0.4, -0.2] },
]

const AminoAcidEmbedding = () => {
  return <Embedding embeddings={embeddings} />
}

export default AminoAcidEmbedding
