import getNoteComponents from "../../../src/components/notes"

const notes = {
  1: "In Metropolis-Hastings, we still accept some percentage of the time, proportional to how bad the move was.",
  2: "residue, meaning unit, refers to a position in the amino acid chain.",
}

export const { Note, NoteList } = getNoteComponents(notes)
