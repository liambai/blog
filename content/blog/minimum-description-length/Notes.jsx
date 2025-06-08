import React from "react"
import getNoteComponents from "../../../src/components/notes"
import { InlineMath } from "react-katex"

const notes = {
  1: (
    <>
      <span>
        As you can probably guess, finding the minimum program is a tough
        problem in more practical situations. In fact,
      </span>{" "}
      <a href="https://en.wikipedia.org/wiki/Kolmogorov_complexity#Uncomputability_of_Kolmogorov_complexity">
        Kolmogorov complexity is generally not computable
      </a>
      <span>.</span>
    </>
  ),
  2: (
    <>
      <span>For programs like gzip, the </span>
      <InlineMath>L(H)</InlineMath>{" "}
      <span>
        term is the length of the program in C, which is negligible compared to
        an LLM's weights.
      </span>
    </>
  ),
}

export const { Note, NoteList } = getNoteComponents(notes)
