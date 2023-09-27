import React from "react"

import Embedding from "./Embedding"
import Viz from "../../../../src/components/viz"

const embeddings = [
  { char: "t", embedding: [0.1, -0.2, 0.3, 0.4, -0.5] },
  { char: "h", embedding: [-0.2, 0.3, -0.4, 0.1, 0.6] },
  { char: "e", embedding: [0.3, 0.2, -0.1, -0.5, 0.4] },
  { char: " ", embedding: [0.5, 0.1, 0.3, -0.4, -0.9] },
  { char: "c", embedding: [0.4, -0.3, -0.2, 0.5, -0.1] },
  { char: "a", embedding: [0.4, -0.1, 0.3, -0.4, 0] },
  { char: "t", embedding: [0.1, -0.1, 0.2, 0.4, -0.3] },
  { char: " ", embedding: [0.5, 0.1, 0.1, -0.3, -0.9] },
  { char: "s", embedding: [-0.4, 0.2, -0.5, 0.3, 0.1] },
  { char: "a", embedding: [0.6, -0.1, 0.3, -0.4, -0.2] },
  { char: "t", embedding: [0.1, -0.2, 0.2, 0.3, -0.2] },
]

const CharacterEmbedding = ({ caption }) => {
  return (
    <Viz caption={caption}>
      <Embedding embeddings={embeddings} />
    </Viz>
  )
}

export default CharacterEmbedding
