// Protein colors (matching PD1_PDL1_with_membranes.png)
export const PD_1_COLOR = 0xe88585 // salmon/coral pink
export const PD_L1_COLOR = 0x70b8e8 // light blue
export const KEYTRUDA_COLOR = 0x2a9d8f // teal green

// Interface representation options
export const INTERFACE_REP_OPTIONS = [
  { id: "none", label: "None", type: null },
  { id: "ball-and-stick", label: "ball & stick", type: "ball-and-stick" },
  { id: "spacefill", label: "spacefill", type: "spacefill" },
  {
    id: "gaussian-surface",
    label: "surface",
    type: "gaussian-surface",
    typeParams: { alpha: 0.6 },
  },
]

// PDB IDs
export const PD_L1_PDB_ID = "3BIK"
export const KEYTRUDA_PDB_ID = "5B8C"

// Chain identifiers
export const CHAINS = {
  PD_L1_COMPLEX: {
    PD_1: "B",
    PD_L1: "A",
  },
  KEYTRUDA_COMPLEX: {
    PD_1: "C",
    KEYTRUDA: ["A", "B"],
  },
}

// Interface residues for PD-L1 complex (3BIK)
export const PD_L1_INTERFACE_RESIDUES = [19, 26, 54, 56, 66, 113, 115, 121, 122, 123, 125]
export const PD_1_INTERFACE_RESIDUES_PDL1 = [64, 66, 68, 73, 74, 75, 76, 78, 126, 128, 130, 132, 134, 136]

// Interface residues for Keytruda complex (5B8C)
export const KEYTRUDA_INTERFACE_RESIDUES = {
  A: [33, 34, 36, 53, 54, 57, 58, 60, 95, 96, 97, 98, 100],
  B: [28, 30, 31, 33, 35, 50, 51, 52, 54, 55, 57, 58, 59, 99, 101, 102, 103, 104, 105],
}
export const PD_1_INTERFACE_RESIDUES_KEYTRUDA = [
  59, 60, 61, 62, 63, 64, 66, 68, 75, 76, 77, 78, 81, 83, 85, 86, 87, 88, 89, 90, 126, 128, 129, 130, 131, 132, 134,
]
