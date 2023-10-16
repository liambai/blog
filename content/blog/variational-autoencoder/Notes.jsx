import React from "react"
import getNoteComponents from "../../../src/components/notes"
import { InlineMath } from "react-katex"

const notes = {
  1: (
    <>
      <b>z </b>
      <span>
        usually has fewer dimensions than the input, so the encoding process can
        be viewed as a form of compression.
      </span>
    </>
  ),
  2: "We also use log probability for mathematical convenience.",
  3: (
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
}

export const { Note, NoteList } = getNoteComponents(notes)
