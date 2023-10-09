import getReferenceComponents from "../../../src/components/references"

const references = {
  1: {
    title:
      "Unified rational protein engineering with sequence-based deep representation learning",
    author: "Alley, E.C. et al.",
    url: "https://www.nature.com/articles/s41592-019-0598-1",
    journal: "Nat Methods 16, 1315–1322",
    year: 2019,
  },
  2: {
    title:
      "BERT: Pre-training of deep bidirectional transformers for language understanding",
    author: "Delvin, J. et al.",
    url: "https://arxiv.org/abs/1810.04805",
    journal: "arXiv",
    year: 2018,
  },
  3: {
    title:
      "Biological structure and function emerge from scaling unsupervised learning to 250 million protein sequences",
    author: "Rives, A. et al.",
    url: "https://www.pnas.org/doi/full/10.1073/pnas.2016239118",
    journal: "Proc. Natl. Acad. Sci.",
    year: 2021,
  },
  4: {
    title:
      "Transformer protein language models are unsupervised structure learners",
    author: "Rao, R.M. et al.",
    url: "https://www.biorxiv.org/content/10.1101/2020.12.15.422761v1",
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
    title: "Low-N protein engineering with data-efficient deep learning",
    author: "Biswas, S. et al.",
    url: "https://www.nature.com/articles/s41592-021-01100-y",
    journal: "Nat Methods 18, 389–396",
    year: 2021,
  },
  7: {
    title:
      "BERTology Meets Biology: Interpreting Attention in Protein Language Models",
    author: "Vig. J. et al.",
    url: "https://arxiv.org/abs/2006.15222",
    journal: "arXiv",
    year: 2020,
  },
}

export const { Reference, ReferenceList } = getReferenceComponents(references)
