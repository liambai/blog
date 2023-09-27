import React from "react"

import Embedding from "./Embedding"
import Viz from "../../../../src/components/viz"

const embeddings = [
  { char: "the", embedding: [0.1, -0.2, 0.3, 0.4, -0.5, 0.1, -0.1, -0.8] },
  { char: "cat", embedding: [-0.2, 0.3, -0.4, 0.1, 0.6, 0.1, 0.1, 0.6] },
  { char: "sat", embedding: [0.3, 0.2, -0.1, -0.5, 0.4, 0.1, -0.5, -0.1] },
]

const CharacterEmbedding = ({ caption }) => {
  return (
    <Viz caption={caption}>
      <Embedding embeddings={embeddings} height={200} tokenWidth={50} />
    </Viz>
  )
}

export default CharacterEmbedding
