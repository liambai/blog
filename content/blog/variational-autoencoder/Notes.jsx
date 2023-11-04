import React from "react"
import getNoteComponents from "../../../src/components/notes"
import { InlineMath } from "react-katex"

const notes = {
  1: "We also use log probability for mathematical convenience.",
  2: (
    <>
      <InlineMath>{"p(x,z) = p(z|x)p(x) = p(x|z)p(z)"}</InlineMath>
      <span>
        , from the definition of conditional probability. To see Bayes rule,
        simply take{" "}
      </span>
      <InlineMath>{"p(z|x)p(x) = p(x|z)p(z)"}</InlineMath>
      <span> and divide both sides by </span>
      <InlineMath>{"p(x)"}</InlineMath>.
    </>
  ),
  3: (
    <>
      <span>This is a </span>
      <a href="https://stats.stackexchange.com/questions/335197/why-kl-divergence-is-non-negative">
        property
      </a>
      <span> of KL divergence.</span>
    </>
  ),
}

export const { Note, NoteList } = getNoteComponents(notes)
