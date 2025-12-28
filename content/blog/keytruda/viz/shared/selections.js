import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder"

export const chainSelection = chainId =>
  MS.struct.generator.atomGroups({
    "chain-test": MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chainId,
    ]),
  })

export const multiChainSelection = chainIds => {
  if (!chainIds || chainIds.length === 0) {
    return MS.struct.generator.atomGroups()
  }

  const chainTests = chainIds.map(chainId =>
    MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chainId,
    ])
  )

  return MS.struct.generator.atomGroups({
    "chain-test":
      chainTests.length === 1 ? chainTests[0] : MS.core.logic.or(chainTests),
  })
}

export const residueSelection = (chainId, residues) => {
  if (!residues || residues.length === 0) {
    return chainSelection(chainId)
  }

  const residueTests = residues.map(residueId =>
    MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_seq_id(),
      residueId,
    ])
  )

  return MS.struct.generator.atomGroups({
    "chain-test": MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chainId,
    ]),
    "residue-test":
      residueTests.length === 1
        ? residueTests[0]
        : MS.core.logic.or(residueTests),
    "group-by": MS.struct.atomProperty.macromolecular.residueKey(),
  })
}

export const residueRangeSelection = (chainId, start, end) => {
  return MS.struct.generator.atomGroups({
    "chain-test": MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chainId,
    ]),
    "residue-test": MS.core.logic.and([
      MS.core.rel.gre([
        MS.struct.atomProperty.macromolecular.auth_seq_id(),
        start,
      ]),
      MS.core.rel.lte([
        MS.struct.atomProperty.macromolecular.auth_seq_id(),
        end,
      ]),
    ]),
  })
}
