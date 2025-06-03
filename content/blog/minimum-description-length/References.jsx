import getReferenceComponents from "../../../src/components/references"

const references = {
  1: {
    title: "Kolmogorov Complexity and Algorithmic Randomness",
    author: "Shen, A., Uspensky, V. A., & Vereshchagin, N.",
    url: "https://www.lirmm.fr/~ashen/kolmbook-eng-scan.pdf",
    journal: "Mathematical Surveys and Monographs",
    year: 2017,
  },
  2: {
    title:
      "A tutorial introduction to the minimum description length principle",
    author: "Grünwald, P.",
    url: "https://arxiv.org/abs/math/0406077",
    journal: "arXiv",
    year: 2004,
  },
  3: {
    title:
      "Keeping the neural networks simple by minimizing the description length of the weights",
    author: "Hinton, G. E., & van Camp, D.",
    url: "https://dl.acm.org/doi/10.1145/168304.168306",
    journal:
      "Proceedings of the sixth annual conference on Computational learning theory",
    year: 1993,
  },
  4: {
    title: "The First Law of Complexodynamics",
    author: "Aaronson, S.",
    url: "https://scottaaronson.blog/?p=762",
    journal: "Shtetl-Optimized",
    year: 2011,
  },
}

export const { Reference, ReferenceList } = getReferenceComponents(references)
