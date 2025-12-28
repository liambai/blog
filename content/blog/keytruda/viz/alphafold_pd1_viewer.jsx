import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import ViewerShell from "./components/ViewerShell"
import Legend from "./components/Legend"

const ALPHAFOLD_URL =
  "https://alphafold.ebi.ac.uk/files/AF-Q15116-F1-model_v6.pdb"

const PLDDT_LEGEND = [
  { label: "Very high (>90)", color: 0x0053d6 },
  { label: "Confident (70-90)", color: 0x65cbf3 },
  { label: "Low (50-70)", color: 0xffdb13 },
  { label: "Very low (<50)", color: 0xff7d45 },
]

const AlphafoldPd1Viewer = ({ title }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
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

        const structureData = await plugin.builders.data.download({
          url: ALPHAFOLD_URL,
          isBinary: false,
          label: "AlphaFold PD-1",
        })

        const trajectory = await plugin.builders.structure.parseTrajectory(
          structureData,
          "pdb"
        )
        const model = await plugin.builders.structure.createModel(trajectory)
        const structure = await plugin.builders.structure.createStructure(model)

        const component =
          await plugin.builders.structure.tryCreateComponentStatic(
            structure,
            "polymer"
          )

        if (component) {
          await plugin.builders.structure.representation.addRepresentation(
            component,
            {
              type: "cartoon",
              color: "uncertainty",
              colorParams: {
                domain: [0, 100],
                list: {
                  kind: "interpolate",
                  colors: [
                    [0xff7d45, 0],
                    [0xffdb13, 0.5],
                    [0x65cbf3, 0.7],
                    [0x0053d6, 0.9],
                    [0x0053d6, 1],
                  ],
                },
              },
            }
          )
        }

        setIsLoading(false)
      } catch (e) {
        setError(`Failed to load AlphaFold structure: ${e.message}`)
        setIsLoading(false)
      }
    }

    initMolstar()

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
    }
  }, [])

  return (
    <ViewerShell
      ref={containerRef}
      title={title}
      isLoading={isLoading}
      error={error}
    >
      <Legend items={PLDDT_LEGEND} />
    </ViewerShell>
  )
}

export default AlphafoldPd1Viewer
