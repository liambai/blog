import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"

import {
  PD_1_COLOR,
  PD_L1_COLOR,
  PD_L1_PDB_ID,
  CHAINS,
  INTERFACE_REP_OPTIONS,
  PD_L1_INTERFACE_RESIDUES,
  PD_1_INTERFACE_RESIDUES_PDL1,
} from "./shared/constants"
import { chainSelection, residueSelection } from "./shared/selections"
import { setCameraWithPd1OnLeft } from "./shared/camera"
import { controlStyles } from "./shared/styles"
import ViewerShell from "./components/ViewerShell"
import Legend from "./components/Legend"
import SegmentedControl from "./components/SegmentedControl"

const Pd1Pdl1Viewer = ({ title }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const chainCentersRef = useRef({ pd1: null, pdl1: null })
  const interfaceComponentsRef = useRef({ pd1: null, pdl1: null })
  const interfaceRepsRef = useRef({ pd1: null, pdl1: null })
  const [isLoading, setIsLoading] = useState(true)
  const [isStructureReady, setIsStructureReady] = useState(false)
  const [interfaceStyle, setInterfaceStyle] = useState("none")
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

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
            ["molstar/ui/skin/light", { accent: "rgb(29, 113, 183)" }],
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

        const pdbUrl = `https://files.rcsb.org/download/${PD_L1_PDB_ID}.pdb`
        const structureData = await plugin.builders.data.download({
          url: pdbUrl,
          isBinary: false,
          label: `PDB ${PD_L1_PDB_ID}`,
        })

        const trajectory = await plugin.builders.structure.parseTrajectory(
          structureData,
          "pdb"
        )
        const model = await plugin.builders.structure.createModel(trajectory)
        const structure = await plugin.builders.structure.createStructure(model)

        await plugin.dataTransaction(async () => {
          const pdL1Chain =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection(CHAINS.PD_L1_COMPLEX.PD_L1),
              "PD-L1"
            )
          if (pdL1Chain) {
            await plugin.builders.structure.representation.addRepresentation(
              pdL1Chain,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: PD_L1_COLOR },
              }
            )
            const pdl1Data = pdL1Chain.cell?.obj?.data
            if (pdl1Data) {
              chainCentersRef.current.pdl1 = Vec3.clone(pdl1Data.boundary.sphere.center)
            }
          }

          const pd1Chain =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection(CHAINS.PD_L1_COMPLEX.PD_1),
              "PD-1"
            )
          if (pd1Chain) {
            await plugin.builders.structure.representation.addRepresentation(
              pd1Chain,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: PD_1_COLOR },
              }
            )
            const pd1Data = pd1Chain.cell?.obj?.data
            if (pd1Data) {
              chainCentersRef.current.pd1 = Vec3.clone(pd1Data.boundary.sphere.center)
            }
          }

          const pdL1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              residueSelection(CHAINS.PD_L1_COMPLEX.PD_L1, PD_L1_INTERFACE_RESIDUES),
              "PD-L1 interface"
            )
          interfaceComponentsRef.current.pdl1 = pdL1Interface || null

          const pd1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              residueSelection(CHAINS.PD_L1_COMPLEX.PD_1, PD_1_INTERFACE_RESIDUES_PDL1),
              "PD-1 interface"
            )
          interfaceComponentsRef.current.pd1 = pd1Interface || null
        })

        requestAnimationFrame(() => {
          if (chainCentersRef.current.pd1 && chainCentersRef.current.pdl1) {
            setCameraWithPd1OnLeft(
              plugin,
              chainCentersRef.current.pd1,
              chainCentersRef.current.pdl1
            )
          }
        })

        setIsStructureReady(true)
        setIsLoading(false)
      } catch (e) {
        setError(`Failed to load PDB ${PD_L1_PDB_ID}: ${e.message}`)
        setIsLoading(false)
      }
    }

    initMolstar()

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
      chainCentersRef.current = { pd1: null, pdl1: null }
      interfaceComponentsRef.current = { pd1: null, pdl1: null }
      interfaceRepsRef.current = { pd1: null, pdl1: null }
      setIsStructureReady(false)
    }
  }, [])

  useEffect(() => {
    if (!pluginRef.current || !isStructureReady) {
      return
    }

    const plugin = pluginRef.current
    const { pd1, pdl1 } = interfaceComponentsRef.current
    const components = [pd1, pdl1].filter(Boolean)

    if (components.length === 0) {
      return
    }

    const option = INTERFACE_REP_OPTIONS.find(
      currentOption => currentOption.id === interfaceStyle
    )

    plugin.dataTransaction(async () => {
      const repsToRemove = []
      if (interfaceRepsRef.current.pdl1?.ref) {
        repsToRemove.push(interfaceRepsRef.current.pdl1.ref)
      }
      if (interfaceRepsRef.current.pd1?.ref) {
        repsToRemove.push(interfaceRepsRef.current.pd1.ref)
      }

      if (repsToRemove.length > 0) {
        const builder = plugin.state.data.build()
        for (const ref of repsToRemove) {
          builder.delete(ref)
        }
        await builder.commit()
      }

      interfaceRepsRef.current = { pd1: null, pdl1: null }

      if (!option || !option.type) {
        return
      }

      const buildProps = colorValue => ({
        type: option.type,
        color: "uniform",
        colorParams: { value: colorValue },
        ...(option.typeParams ? { typeParams: option.typeParams } : {}),
      })

      if (pdl1) {
        interfaceRepsRef.current.pdl1 =
          await plugin.builders.structure.representation.addRepresentation(
            pdl1,
            buildProps(PD_L1_COLOR)
          )
      }
      if (pd1) {
        interfaceRepsRef.current.pd1 =
          await plugin.builders.structure.representation.addRepresentation(
            pd1,
            buildProps(PD_1_COLOR)
          )
      }
    })
  }, [interfaceStyle, isStructureReady])

  const legendItems = [
    { label: "PD-1", color: PD_1_COLOR },
    { label: "PD-L1", color: PD_L1_COLOR },
  ]

  return (
    <ViewerShell
      ref={containerRef}
      title={title}
      isLoading={isLoading}
      error={error}
    >
      <Legend items={legendItems} />
      <div style={controlStyles.container}>
        <div style={controlStyles.row}>
          <span style={controlStyles.label}>Interface</span>
          <SegmentedControl
            options={INTERFACE_REP_OPTIONS}
            value={interfaceStyle}
            onChange={setInterfaceStyle}
          />
        </div>
      </div>
    </ViewerShell>
  )
}

export default Pd1Pdl1Viewer
