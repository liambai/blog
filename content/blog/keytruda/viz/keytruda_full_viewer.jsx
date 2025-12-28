import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"

import { residueRangeSelection } from "./shared/selections"
import ViewerShell from "./components/ViewerShell"
import Legend from "./components/Legend"
import HoverInfo from "./components/HoverInfo"
import useHoverInfo from "./hooks/useHoverInfo"

const KEYTRUDA_FULL_PDB_ID = "5DK3"

// Chain identifiers in 5DK3:
// Light chains: A, F
// Heavy chains: B, G

// Domain boundaries (standard IgG4 numbering)
const VL_END = 107 // Variable light domain: residues 1-107
const VH_END = 118 // Variable heavy domain: residues 1-118
const CHAIN_END = 500 // Large number to capture all constant region residues

// Colors - Fv (variable domains) in saturated color, constant regions muted
const FV_COLOR = 0x2a9d8f // teal green - Fv region
const CONST_COLOR = 0xc9d6d3 // muted gray-teal - constant regions

const KeytrudaFullViewer = ({ title }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStructureReady, setIsStructureReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return

    const initMolstar = async () => {
      try {
        if (pluginRef.current) {
          pluginRef.current.dispose()
          pluginRef.current = null
        }

        containerRef.current.innerHTML = ""
        setIsLoading(true)
        setError(null)

        const baseSpec = DefaultPluginSpec()
        const pluginSpec = {
          ...baseSpec,
          config: [
            ...(baseSpec.config || []),
            [
              "molstar/ui/layout",
              {
                hideControls: true,
                showLeftPanel: false,
                showRightPanel: false,
                showBottomPanel: false,
                showLog: false,
              },
            ],
          ],
        }

        const plugin = new PluginContext(pluginSpec)
        pluginRef.current = plugin
        await plugin.init()

        const canvas = document.createElement("canvas")
        canvas.style.width = "100%"
        canvas.style.height = "100%"
        canvas.style.display = "block"
        containerRef.current.appendChild(canvas)
        plugin.initViewer(canvas, containerRef.current)

        const pdbUrl = `https://files.rcsb.org/download/${KEYTRUDA_FULL_PDB_ID}.pdb`
        const structureData = await plugin.builders.data.download({
          url: pdbUrl,
          isBinary: false,
          label: `PDB ${KEYTRUDA_FULL_PDB_ID}`,
        })

        const trajectory = await plugin.builders.structure.parseTrajectory(
          structureData,
          "pdb"
        )
        const model = await plugin.builders.structure.createModel(trajectory)
        const structure = await plugin.builders.structure.createStructure(model)

        await plugin.dataTransaction(async () => {
          // Helper to add Fv and constant region components for a chain
          const addChainComponents = async (chainId, isHeavy) => {
            const vEnd = isHeavy ? VH_END : VL_END

            // Fv (variable) region
            const fvComponent =
              await plugin.builders.structure.tryCreateComponentFromExpression(
                structure,
                residueRangeSelection(chainId, 1, vEnd),
                `${chainId} V${isHeavy ? "H" : "L"}`
              )
            if (fvComponent) {
              await plugin.builders.structure.representation.addRepresentation(
                fvComponent,
                {
                  type: "cartoon",
                  color: "uniform",
                  colorParams: { value: FV_COLOR },
                }
              )
            }

            // Constant region
            const constComponent =
              await plugin.builders.structure.tryCreateComponentFromExpression(
                structure,
                residueRangeSelection(chainId, vEnd + 1, CHAIN_END),
                `${chainId} C${isHeavy ? "H" : "L"}`
              )
            if (constComponent) {
              await plugin.builders.structure.representation.addRepresentation(
                constComponent,
                {
                  type: "cartoon",
                  color: "uniform",
                  colorParams: { value: CONST_COLOR },
                }
              )
            }
          }

          // Light chains: A, F
          await addChainComponents("A", false)
          await addChainComponents("F", false)

          // Heavy chains: B, G
          await addChainComponents("B", true)
          await addChainComponents("G", true)
        })

        setIsStructureReady(true)
        setIsLoading(false)
      } catch (e) {
        setError(`Failed to load PDB ${KEYTRUDA_FULL_PDB_ID}: ${e.message}`)
        setIsLoading(false)
      }
    }

    initMolstar()

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
      setIsStructureReady(false)
    }
  }, [])

  const hoverInfo = useHoverInfo(pluginRef, containerRef, isStructureReady)

  const legendItems = [
    { label: "Fv", color: FV_COLOR },
    { label: "Constant", color: CONST_COLOR },
  ]

  const chainNames = {
    A: "Light chain",
    B: "Heavy chain",
    F: "Light chain",
    G: "Heavy chain",
  }

  return (
    <ViewerShell
      ref={containerRef}
      title={title}
      isLoading={isLoading}
      error={error}
    >
      <Legend items={legendItems} />
      <HoverInfo info={hoverInfo} chainNames={chainNames} />
    </ViewerShell>
  )
}

export default KeytrudaFullViewer
