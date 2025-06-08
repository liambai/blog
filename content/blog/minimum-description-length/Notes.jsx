import getNoteComponents from "../../../src/components/notes"

const notes = {
  1: "As you can probably guess, finding the minimum program is an intractable problem in more practical situations. In fact, [Kolmogorov complexity is generally not computable](https://en.wikipedia.org/wiki/Kolmogorov_complexity#Uncomputability_of_Kolmogorov_complexity).",
  2: "Technically, we need an infinite number of bits because real numbers have an infinite decimal expansion. Practically, we approximate to some finite decimal point.",
  3: "In practice, we need an encoding algorithm (e.g. [Huffman coding](https://en.wikipedia.org/wiki/Huffman_coding) or [Arithmetic coding](https://en.wikipedia.org/wiki/Arithmetic_coding)). The codes produced by these methods are bounded by, and don't usually achieve, the theoretical optimal length $-log_2(p(x))$.",
  4: "For classic algorithms like gzip, the $L(H)$ term is the length of program in its programming language, which is at most a few KBs, negligible compared to an LLM's weights.",
}

export const { Note, NoteList } = getNoteComponents(notes)
