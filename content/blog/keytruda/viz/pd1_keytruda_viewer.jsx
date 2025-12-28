import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"

import {
  PD_1_COLOR,
  KEYTRUDA_COLOR,
  KEYTRUDA_PDB_ID,
  CHAINS,
  INTERFACE_REP_OPTIONS,
  KEYTRUDA_INTERFACE_RESIDUES,
  PD_1_INTERFACE_RESIDUES_KEYTRUDA,
} from "./shared/constants"
import { chainSelection, multiChainSelection, residueSelection } from "./shared/selections"
import { setCameraWithPd1OnLeft } from "./shared/camera"
import { controlStyles } from "./shared/styles"
import ViewerShell from "./components/ViewerShell"
import Legend from "./components/Legend"
import SegmentedControl from "./components/SegmentedControl"
import HoverInfo from "./components/HoverInfo"
import useHoverInfo from "./hooks/useHoverInfo"

const Pd1KeytrudaViewer = ({ title }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const chainCentersRef = useRef({ pd1: null, keytruda: null })
  const interfaceComponentsRef = useRef({ pd1: null, keytruda: [] })
  const interfaceRepsRef = useRef({ pd1: null, keytruda: [] })
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

        const pdbUrl = `https://files.rcsb.org/download/${KEYTRUDA_PDB_ID}.pdb`
        const structureData = await plugin.builders.data.download({
          url: pdbUrl,
          isBinary: false,
          label: `PDB ${KEYTRUDA_PDB_ID}`,
        })

        const trajectory = await plugin.builders.structure.parseTrajectory(
          structureData,
          "pdb"
        )
        const model = await plugin.builders.structure.createModel(trajectory)
        const structure = await plugin.builders.structure.createStructure(model)

        await plugin.dataTransaction(async () => {
          const keytrudaChains =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              multiChainSelection(CHAINS.KEYTRUDA_COMPLEX.KEYTRUDA),
              "Keytruda"
            )
          if (keytrudaChains) {
            await plugin.builders.structure.representation.addRepresentation(
              keytrudaChains,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: KEYTRUDA_COLOR },
              }
            )
            const keytrudaData = keytrudaChains.cell?.obj?.data
            if (keytrudaData) {
              chainCentersRef.current.keytruda = Vec3.clone(keytrudaData.boundary.sphere.center)
            }
          }

          const pd1Chain =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection(CHAINS.KEYTRUDA_COMPLEX.PD_1),
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

          const keytrudaInterfaces = []
          for (const [chainId, residues] of Object.entries(KEYTRUDA_INTERFACE_RESIDUES)) {
            const component =
              await plugin.builders.structure.tryCreateComponentFromExpression(
                structure,
                residueSelection(chainId, residues),
                `Keytruda interface ${chainId}`
              )
            if (component) {
              keytrudaInterfaces.push(component)
            }
          }
          interfaceComponentsRef.current.keytruda = keytrudaInterfaces

          const pd1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              residueSelection(CHAINS.KEYTRUDA_COMPLEX.PD_1, PD_1_INTERFACE_RESIDUES_KEYTRUDA),
              "PD-1 interface"
            )
          interfaceComponentsRef.current.pd1 = pd1Interface || null
        })

        requestAnimationFrame(() => {
          if (chainCentersRef.current.pd1 && chainCentersRef.current.keytruda) {
            setCameraWithPd1OnLeft(
              plugin,
              chainCentersRef.current.pd1,
              chainCentersRef.current.keytruda
            )
          }
        })

        setIsStructureReady(true)
        setIsLoading(false)
      } catch (e) {
        setError(`Failed to load PDB ${KEYTRUDA_PDB_ID}: ${e.message}`)
        setIsLoading(false)
      }
    }

    initMolstar()

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
      chainCentersRef.current = { pd1: null, keytruda: null }
      interfaceComponentsRef.current = { pd1: null, keytruda: [] }
      interfaceRepsRef.current = { pd1: null, keytruda: [] }
      setIsStructureReady(false)
    }
  }, [])

  useEffect(() => {
    if (!pluginRef.current || !isStructureReady) {
      return
    }

    const plugin = pluginRef.current
    const { pd1, keytruda } = interfaceComponentsRef.current
    const components = [pd1, ...(keytruda || [])].filter(Boolean)

    if (components.length === 0) {
      return
    }

    const option = INTERFACE_REP_OPTIONS.find(
      currentOption => currentOption.id === interfaceStyle
    )

    plugin.dataTransaction(async () => {
      const repsToRemove = []
      if (interfaceRepsRef.current.pd1?.ref) {
        repsToRemove.push(interfaceRepsRef.current.pd1.ref)
      }
      for (const rep of interfaceRepsRef.current.keytruda || []) {
        if (rep?.ref) {
          repsToRemove.push(rep.ref)
        }
      }

      if (repsToRemove.length > 0) {
        const builder = plugin.state.data.build()
        for (const ref of repsToRemove) {
          builder.delete(ref)
        }
        await builder.commit()
      }

      interfaceRepsRef.current = { pd1: null, keytruda: [] }

      if (!option || !option.type) {
        return
      }

      const buildProps = colorValue => ({
        type: option.type,
        color: "uniform",
        colorParams: { value: colorValue },
        ...(option.typeParams ? { typeParams: option.typeParams } : {}),
      })

      if (pd1) {
        interfaceRepsRef.current.pd1 =
          await plugin.builders.structure.representation.addRepresentation(
            pd1,
            buildProps(PD_1_COLOR)
          )
      }
      interfaceRepsRef.current.keytruda = []
      for (const component of keytruda || []) {
        const rep =
          await plugin.builders.structure.representation.addRepresentation(
            component,
            buildProps(KEYTRUDA_COLOR)
          )
        interfaceRepsRef.current.keytruda.push(rep)
      }
    })
  }, [interfaceStyle, isStructureReady])

  const hoverInfo = useHoverInfo(pluginRef, containerRef, isStructureReady)

  const legendItems = [
    { label: "PD-1", color: PD_1_COLOR },
    { label: "Keytruda", color: KEYTRUDA_COLOR },
  ]

  return (
    <ViewerShell
      ref={containerRef}
      title={title}
      isLoading={isLoading}
      error={error}
    >
      <Legend items={legendItems} />
      <HoverInfo info={hoverInfo} chainNames={{ A: "Keytruda", B: "Keytruda", C: "PD-1" }} />
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

export default Pd1KeytrudaViewer
