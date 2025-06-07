import React from "react"
import getNoteComponents from "../../../src/components/notes"
import { InlineMath } from "react-katex"

const notes = {
  1: (
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
