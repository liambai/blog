export const MSA = [
  ["L", "T", "R", "A", "A", "L", "Y", "E", "D", "C"],
  ["L", "T", "R", "A", "T", "L", "Y", "E", "D", "C"],
  ["L", "T", "R", "C", "T", "L", "P", "E", "D", "C"],
  ["L", "R", "R", "A", "T", "L", "P", "D", "D", "C"],
  ["L", "R", "R", "A", "T", "L", "P", "D", "D", "A"],
  ["L", "V", "R", "A", "T", "K", "P", "W", "D", "A"],
  ["L", "V", "R", "A", "T", "L", "P", "W", "D", "A"],
  ["L", "V", "R", "A", "T", "L", "P", "W", "D", "A"],
]
export const MSAData = MSA.map(row =>
  row.map((char, idx) => ({ pos: idx + 1, char: char }))
)
