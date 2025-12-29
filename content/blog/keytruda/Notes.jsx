import React from "react"
import getNoteComponents from "../../../src/components/notes"

const notes = {
  1: "This is a misnomer because when PD-1 was first discovered, it was thought to cause T cell death. Later experiments revealed more nuanced behavior that inhibits T cell activity instead of causing death.",
}

export const { Note, NoteList } = getNoteComponents(notes)
