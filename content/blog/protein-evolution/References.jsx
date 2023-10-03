import getReferenceComponents from "../../../src/components/references"

const references = {
  1: {
    title: "Protein 3D structure computed from evolutionary sequence variation",
    author: "Marks, D.S. et al.",
    url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0028766",
    journal: "PLoS One 6, e28766",
    year: 2011,
  },
  2: {
    title:
      "Direct-coupling analysis of residue coevolution captures native contacts across many protein families",
    author: "Weigt, M et al.",
    url: "https://www.pnas.org/doi/10.1073/pnas.1111471108",
    journal: "Proc. Natl. Acad. Sci. U.S.A. 108, E1293–E1301",
    year: 2011,
  },
  3: {
    title: "Mutation effects predicted from sequence co-variation",
    author: "Hopf, T. et al.",
    url: "https://www.nature.com/articles/nbt.3769",
    journal: "Nat Biotechnol 35, 128–135",
    year: 2017,
  },
  4: {
    title: "An evolution-based model for designing chorismate mutase enzymes",
    author: "Russ W.P. et al.",
    url: "https://www.science.org/doi/10.1126/science.aba3304",
    journal: "Science. 2020;369(6502):440–445",
    year: 2020,
  },
  5: {
    title: "Attention is all you need",
    author: "Vaswani A. et al.",
    url: "https://arxiv.org/abs/1706.03762",
    journal: "NeurIPS",
    year: 2017,
  },
  6: {
    title: "Axial Attention in Multidimensional Transformers",
    author: "Ho J. et al.",
    url: "https://arxiv.org/abs/1912.12180",
    journal: "arXiv",
    year: 2019,
  },
  7: {
    title: "MSA Transformer",
    author: "Rao, R.M. et al.",
    url: "https://proceedings.mlr.press/v139/rao21a.html",
    journal: "Proceedings of Machine Learning Research 139:8844-8856",
    year: 2021,
  },
  8: {
    title: "Highly accurate protein structure prediction with AlphaFold",
    author: "Jumper, J. et al.",
    url: "https://www.nature.com/articles/s41586-021-03819-2",
    journal: "Nature 596, 583–589",
    year: 2021,
  },
  9: {
    title:
      "Unified rational protein engineering with sequence-based deep representation learning",
    author: "Alley, E.C. et al.",
    url: "https://www.nature.com/articles/s41592-019-0598-1",
    journal: "Nat Methods 16, 1315–1322",
    year: 2019,
  },
  10: {
    title:
      "Biological structure and function emerge from scaling unsupervised learning to 250 million protein sequences",
    author: "Rives, A. et al.",
    url: "https://www.pnas.org/doi/full/10.1073/pnas.2016239118",
    journal: "PNAS 118:e2016239118",
    year: 2021,
  },
}

export const { Reference, ReferenceList } = getReferenceComponents(references)
