import React from "react"
import getNoteComponents from "../../../src/components/notes"

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
}

export const { Note, NoteList } = getNoteComponents(notes)
