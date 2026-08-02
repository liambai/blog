import getNoteComponents from "../../../src/components/notes"

const notes = {
  1: "Modern chatbots typically rely more on post-training to bake in the Assistant character, where the model is fine-tuned on many such conversations until it plays the part by default; the system prompt is left to supply a thin top layer of instructions. The circularity is unchanged, though: an Assistant is still, definitionally, whatever you get when you train a model to act like one.",
}

export const { Note, NoteList } = getNoteComponents(notes)
