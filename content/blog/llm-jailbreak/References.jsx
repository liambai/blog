import getReferenceComponents from "../../../src/components/references"

const references = {
  1: {
    title: "Deliberative alignment: reasoning enables safer language models",
    author: "Guan, M.Y. et al.",
    url: "https://openai.com/index/deliberative-alignment/",
    journal: "OpenAI",
    year: 2024,
  },
  2: {
    title: "Improving Language Understanding by Generative Pre-Training",
    author: "Radford, A. et al.",
    url: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf",
    journal: "OpenAI",
    year: 2018,
  },
  3: {
    title: "A General Language Assistant as a Laboratory for Alignment",
    author: "Askell, A. et al.",
    url: "https://arxiv.org/abs/2112.00861",
    journal: "arXiv",
    year: 2021,
  },
  4: {
    title: "Jailbroken: How Does LLM Safety Training Fail?",
    author: "Wei, A. et al.",
    url: "https://arxiv.org/pdf/2307.02483",
    journal: "NeurIPS",
    year: 2023,
  },
  5: {
    title: "Many-shot Jailbreaking",
    author: "Anil, C. et al.",
    url: "https://www.anthropic.com/research/many-shot-jailbreaking",
    journal: "Anthropic",
    year: 2024,
  },
}

export const { Reference, ReferenceList } = getReferenceComponents(references)
