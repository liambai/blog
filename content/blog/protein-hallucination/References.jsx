import getReferenceComponents from "../../../src/components/references"

const references = {
  1: {
    title:
      "Improved protein structure prediction using predicted interresidue orientations",
    author: "Yang, J. et al.",
    url: "https://www.pnas.org/doi/10.1073/pnas.1914677117",
    journal: "Proc. Natl. Acad. Sci.",
    year: 2021,
  },
  2: {
    title: "De novo protein design by deep network hallucination",
    author: "Anishchenko, I. et al.",
    url: "https://www.nature.com/articles/s41586-021-04184-w",
    journal: "Nature 600, 547–552",
    year: 2021,
  },
  3: {
    title: "Protein sequence design by conformational landscape optimization",
    author: "Anishchenko, I. et al.",
    url: "https://www.pnas.org/doi/10.1073/pnas.2017228118",
    journal: "Proc. Natl. Acad. Sci.",
    year: 2021,
  },
  4: {
    title:
      "Design of proteins presenting discontinuous functional sites using deep learning",
    author: "Tischer, D. et al",
    url: "https://www.biorxiv.org/content/10.1101/2020.11.29.402743v1",
    journal: "arXiv",
    year: 2020,
  },
  5: {
    title: "Scaffolding protein functional sites using deep learning",
    author: "Wang, J. et al",
    url: "https://www.science.org/doi/full/10.1126/science.abn2100?af=R",
    journal: "Science 377,387-394",
    year: 2022,
  },
  6: {
    title: "Structural and functional properties of SARS-CoV-2 spike protein",
    author: "Huang, Y. et al.",
    url: "https://www.nature.com/articles/s41401-020-0485-4",
    journal: "Acta Pharmacol Sin 41, 1141–1149",
    year: 2020,
  },
}

export const { Reference, ReferenceList } = getReferenceComponents(references)
