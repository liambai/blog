import getNoteComponents from "../../../src/components/notes"

const notes = {
  1: "As you can probably guess, finding the minimum program is a tough problem in more practical situations. In fact, [Kolmogorov complexity is generally not computable](https://en.wikipedia.org/wiki/Kolmogorov_complexity#Uncomputability_of_Kolmogorov_complexity).",
  2: "For programs like gzip, the $L(H)$ term is the length of the program in C, which is negligible compared to an LLM's weights.",
}

export const { Note, NoteList } = getNoteComponents(notes)
