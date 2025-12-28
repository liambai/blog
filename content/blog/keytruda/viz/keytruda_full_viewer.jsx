import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"

import { chainSelection } from "./shared/selections"
import ViewerShell from "./components/ViewerShell"
import Legend from "./components/Legend"
import HoverInfo from "./components/HoverInfo"
import useHoverInfo from "./hooks/useHoverInfo"

const KEYTRUDA_FULL_PDB_ID = "5DK3"

// Chain identifiers in 5DK3:
// Light chains: A, F
// Heavy chains: B, G
// Fab arm 1 (highlighted, as in 5B8C): A + B
// Fab arm 2 (muted): F + G

// Colors - Fab arm uses saturated colors, other arm uses muted versions
const FAB_HEAVY_COLOR = 0x2a9d8f // teal green - same as KEYTRUDA_COLOR
const FAB_LIGHT_COLOR = 0x8ecae6 // light blue
const OTHER_HEAVY_COLOR = 0xa8cec8 // muted teal
const OTHER_LIGHT_COLOR = 0xc9dfe8 // muted light blue

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
          // Fab arm (as in 5B8C): chains A (light) + B (heavy)
          const fabLight =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection("A"),
              "Fab light chain"
            )
          if (fabLight) {
            await plugin.builders.structure.representation.addRepresentation(
              fabLight,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: FAB_LIGHT_COLOR },
              }
            )
          }

          const fabHeavy =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection("B"),
              "Fab heavy chain"
            )
          if (fabHeavy) {
            await plugin.builders.structure.representation.addRepresentation(
              fabHeavy,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: FAB_HEAVY_COLOR },
              }
            )
          }

          // Other arm: chains F (light) + G (heavy) in muted colors
          const otherLight =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection("F"),
              "Other light chain"
            )
          if (otherLight) {
            await plugin.builders.structure.representation.addRepresentation(
              otherLight,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: OTHER_LIGHT_COLOR },
              }
            )
          }

          const otherHeavy =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection("G"),
              "Other heavy chain"
            )
          if (otherHeavy) {
            await plugin.builders.structure.representation.addRepresentation(
              otherHeavy,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: OTHER_HEAVY_COLOR },
              }
            )
          }
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
    { label: "Fab heavy", color: FAB_HEAVY_COLOR },
    { label: "Fab light", color: FAB_LIGHT_COLOR },
    { label: "Heavy chain", color: OTHER_HEAVY_COLOR },
    { label: "Light chain", color: OTHER_LIGHT_COLOR },
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
