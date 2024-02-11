import getReferenceComponents from "../../../src/components/references"

const references = {
  1: {
    title:
      "Deep generative models of genetic variation capture the effects of mutations",
    author: "Riesselman, A.J. et al.",
    url: "https://www.nature.com/articles/s41592-018-0138-4",
    journal: "Nat Methods 15, 816–822",
    year: 2018,
  },
  2: {
    title:
      "Disease variant prediction with deep generative models of evolutionary data",
    author: "Frazer, J. et al.",
    url: "https://www.nature.com/articles/s41586-021-04043-8",
    journal: "Nature 599, 91–95",
    year: 2021,
  },
  3: {
    title: "Learning from prepandemic data to forecast viral escape",
    author: "Thadani, N.N. et al.",
    url: "https://www.nature.com/articles/s41592-018-0138-4",
    journal: "Nature 622, 818–825",
    year: 2023,
  },
}
export const { Reference, ReferenceList } = getReferenceComponents(references)
