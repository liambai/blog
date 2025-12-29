import React from "react"
import getNoteComponents from "../../../src/components/notes"

const notes = {
  1: "This is a misnomer because when PD-1 was first discovered, it was thought to cause T cell death. Later experiments revealed more nuanced behavior that inhibits T cell activity instead of causing death.",
  2: "Another important biomarker is a genetic one called [MSI-H (microsatellite instability-high)](https://en.wikipedia.org/wiki/Microsatellite_instability). Tumors with these markers have many mutations that make them more visible to the immune system and hence more responsive to Keytruda.",
}

export const { Note, NoteList } = getNoteComponents(notes)
