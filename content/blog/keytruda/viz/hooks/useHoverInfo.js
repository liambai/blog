import { useState, useEffect } from "react"
import { StructureElement } from "molstar/lib/mol-model/structure"
import { OrderedSet } from "molstar/lib/mol-data/int"

const THREE_LETTER_TO_ONE = {
  ALA: "A", ARG: "R", ASN: "N", ASP: "D", CYS: "C",
  GLN: "Q", GLU: "E", GLY: "G", HIS: "H", ILE: "I",
  LEU: "L", LYS: "K", MET: "M", PHE: "F", PRO: "P",
  SER: "S", THR: "T", TRP: "W", TYR: "Y", VAL: "V",
}

const formatResidueName = (threeLetterCode) => {
  const oneLetter = THREE_LETTER_TO_ONE[threeLetterCode]
  if (oneLetter) {
    return `${threeLetterCode} (${oneLetter})`
  }
  return threeLetterCode
}

const extractResidueInfo = (loci) => {
  if (!StructureElement.Loci.is(loci) || StructureElement.Loci.isEmpty(loci)) {
    return null
  }

  try {
    const { unit, indices } = loci.elements[0]
    if (OrderedSet.size(indices) === 0) return null

    // Get the first element index from the OrderedSet
    const elementIndex = OrderedSet.getAt(indices, 0)
    const atomIndex = unit.elements[elementIndex]

    const hierarchy = unit.model.atomicHierarchy
    const residueIndex = hierarchy.residueAtomSegments.index[atomIndex]
    const chainIndex = hierarchy.chainAtomSegments.index[atomIndex]

    // label_comp_id (residue name like ALA) is in atoms table
    const resName = hierarchy.atoms.label_comp_id.value(atomIndex)
    // auth_asym_id (chain ID like A, B) is in chains table
    const chainId = hierarchy.chains.auth_asym_id.value(chainIndex)
    // auth_seq_id (residue number) is in residues table
    const resSeq = hierarchy.residues.auth_seq_id.value(residueIndex)

    return {
      residueName: formatResidueName(resName),
      residueNumber: resSeq,
      chainId,
      position: null, // will be set from event
    }
  } catch (e) {
    console.error("Error extracting residue info:", e)
    return null
  }
}

const useHoverInfo = (pluginRef, containerRef, isReady) => {
  const [hoverInfo, setHoverInfo] = useState(null)

  useEffect(() => {
    const plugin = pluginRef?.current
    if (!plugin || !isReady) return

    const subscription = plugin.behaviors.interaction.hover.subscribe((event) => {
      if (!event.current || event.current.loci.kind === "empty-loci") {
        setHoverInfo(null)
        return
      }

      const info = extractResidueInfo(event.current.loci)
      if (info && event.page) {
        // event.page is canvas-relative, add container offset for viewport coords
        const container = containerRef?.current
        if (container) {
          const rect = container.getBoundingClientRect()
          info.position = {
            x: rect.left + event.page[0],
            y: rect.top + event.page[1]
          }
        }
      }
      setHoverInfo(info)
    })

    return () => subscription.unsubscribe()
  }, [pluginRef, containerRef, isReady])

  return hoverInfo
}

export default useHoverInfo
