import React from "react"
import getNoteComponents from "../../../src/components/notes"

const notes = {
  1: "This is a misnomer because when PD-1 was first discovered, it was thought to cause T cell death. Later experiments revealed more nuanced behavior that inhibits T cell activity instead of causing death.",
  2: "For more on how this works, check out [ITIM (immunoreceptor tyrosine-based inhibitory motif)](https://en.wikipedia.org/wiki/Immunoreceptor_tyrosine-based_inhibitory_motif), the key motif in the intracellular tail of PD-1 that triggers the downstream signaling.",
  3: 'The generic name follows WHO naming conventions: "-mab" indicates a monoclonal antibody, "-zu-" means humanized (derived from human sequences), and "-li-" indicates an immunomodulator.',
  4: "The tissue-agnostic approval of Keytruda was based on another biomarker called [MSI-H/dMMR](https://www.mskcc.org/cancer-care/diagnosis-treatment/cancer-treatments/immunotherapy/mmrd-msi-h-and-tmb-h-tumors). Tumors with these genetic markers are more visible to the immune system and therefore more responsive to Keytruda.",
}

export const { Note, NoteList } = getNoteComponents(notes)
