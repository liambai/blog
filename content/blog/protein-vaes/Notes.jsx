import React from "react"
import getNoteComponents from "../../../src/components/notes"
import { InlineMath } from "react-katex"

const notes = {
  1: "Typically: z is a vector of ~30 numbers, each protein sequence are a few hundred characters long, MSAs have >1000 sequences.",
  2: (
    <>
      <span>This is equivalent to the energy-based equations we derived </span>
      <a href="https://liambai.com/protein-evolution/#predicting-mutation-effects">
        here
      </a>
      <span> for the a pair-wise model.</span>
    </>
  ),
}

export const { Note, NoteList } = getNoteComponents(notes)
