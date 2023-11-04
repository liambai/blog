import getReferenceComponents from "../../../src/components/references"

const references = {
  1: {
    title: "Tutorial on Variational Autoencoders",
    author: "Doersch, C.",
    url: "https://arxiv.org/abs/1606.05908",
    journal: "arXiv",
    year: 2016,
  },
  2: {
    title:
      "Deep generative models of genetic variation capture the effects of mutations",
    author: "Riesselman, A.J. et al.",
    url: "https://www.nature.com/articles/s41592-018-0138-4",
    journal: "Nat Methods 15, 816–822",
    year: 2018,
  },
}
export const { Reference, ReferenceList } = getReferenceComponents(references)
