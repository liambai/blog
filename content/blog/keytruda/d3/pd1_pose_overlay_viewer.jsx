import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import {
  QueryContext,
  StructureElement,
  StructureSelection,
} from "molstar/lib/mol-model/structure"
import { alignAndSuperpose } from "molstar/lib/mol-model/structure/structure/util/superposition"
import { compile } from "molstar/lib/mol-script/runtime/query/compiler"
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms"
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"

import {
  PD_1_COLOR,
  PD_L1_COLOR,
  KEYTRUDA_COLOR,
  PD_L1_PDB_ID,
  KEYTRUDA_PDB_ID,
  CHAINS,
  INTERFACE_REP_OPTIONS,
  PD_L1_INTERFACE_RESIDUES,
  PD_1_INTERFACE_RESIDUES_PDL1,
  KEYTRUDA_INTERFACE_RESIDUES,
  PD_1_INTERFACE_RESIDUES_KEYTRUDA,
} from "./shared/constants"
import { chainSelection, multiChainSelection, residueSelection } from "./shared/selections"
import { setCameraWithPd1OnLeft } from "./shared/camera"
import { controlStyles } from "./shared/styles"
import ViewerShell from "./components/ViewerShell"
import Legend from "./components/Legend"
import SegmentedControl from "./components/SegmentedControl"

const LIGAND_OPTIONS = [
  { id: "pdl1", label: "PD-L1" },
  { id: "keytruda", label: "Keytruda" },
]

const getChainLoci = (structure, chainId) => {
  const query = compile(chainSelection(chainId))
  return StructureSelection.toLociWithCurrentUnits(
    query(new QueryContext(structure))
  )
}

const applyTransform = (plugin, structure, matrix) => {
  const builder = plugin.state.data
    .build()
    .to(structure)
    .insert(StateTransforms.Model.TransformStructureConformation, {
      transform: { name: "matrix", params: { data: matrix, transpose: false } },
    })
  return plugin.runTask(plugin.state.data.updateTree(builder))
}

const Pd1PoseOverlayViewer = ({ title }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const chainCentersRef = useRef({ pd1: null, pdl1: null })
  const pd1ComponentRef = useRef(null)
  const pdl1ComponentRef = useRef(null)
  const keytrudaComponentRef = useRef(null)
  const ligandRepsRef = useRef({ pdl1: null, keytruda: null })
  const interfaceComponentsRef = useRef({
    pd1Pdl1: null,
    pdl1: null,
    pd1Keytruda: null,
    keytruda: [],
  })
  const interfaceRepsRef = useRef({ pd1: null, ligand: [] })
  const [activeLigand, setActiveLigand] = useState("pdl1")
  const [interfaceStyle, setInterfaceStyle] = useState("none")
  const [isLoading, setIsLoading] = useState(true)
  const [isStructureReady, setIsStructureReady] = useState(false)
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

        const pdL1Data = await plugin.builders.data.download({
          url: `https://files.rcsb.org/download/${PD_L1_PDB_ID}.pdb`,
          isBinary: false,
          label: `PDB ${PD_L1_PDB_ID}`,
        })
        const keytrudaData = await plugin.builders.data.download({
          url: `https://files.rcsb.org/download/${KEYTRUDA_PDB_ID}.pdb`,
          isBinary: false,
          label: `PDB ${KEYTRUDA_PDB_ID}`,
        })

        const pdL1Trajectory = await plugin.builders.structure.parseTrajectory(
          pdL1Data,
          "pdb"
        )
        const keytrudaTrajectory =
          await plugin.builders.structure.parseTrajectory(keytrudaData, "pdb")

        const pdL1Model =
          await plugin.builders.structure.createModel(pdL1Trajectory)
        const keytrudaModel =
          await plugin.builders.structure.createModel(keytrudaTrajectory)

        const pdL1Structure =
          await plugin.builders.structure.createStructure(pdL1Model)
        const keytrudaStructure =
          await plugin.builders.structure.createStructure(keytrudaModel)

        const pd1RefLoci = getChainLoci(
          pdL1Structure.cell.obj.data,
          CHAINS.PD_L1_COMPLEX.PD_1
        )
        const pd1KeytrudaLoci = getChainLoci(
          keytrudaStructure.cell.obj.data,
          CHAINS.KEYTRUDA_COMPLEX.PD_1
        )

        if (
          StructureElement.Loci.isEmpty(pd1RefLoci) ||
          StructureElement.Loci.isEmpty(pd1KeytrudaLoci)
        ) {
          throw new Error("PD-1 chain not found in one of the structures")
        }

        const transforms = alignAndSuperpose([pd1RefLoci, pd1KeytrudaLoci])
        if (!transforms[0]?.bTransform) {
          throw new Error("Failed to align PD-1 chains")
        }
        await applyTransform(plugin, keytrudaStructure, transforms[0].bTransform)

        await plugin.dataTransaction(async () => {
          const pd1Component =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              pdL1Structure,
              chainSelection(CHAINS.PD_L1_COMPLEX.PD_1),
              "PD-1"
            )
          pd1ComponentRef.current = pd1Component || null
          if (pd1Component) {
            await plugin.builders.structure.representation.addRepresentation(
              pd1Component,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: PD_1_COLOR },
              }
            )
            const pd1Data = pd1Component.cell?.obj?.data
            if (pd1Data) {
              chainCentersRef.current.pd1 = Vec3.clone(pd1Data.boundary.sphere.center)
            }
          }

          const pdl1Component =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              pdL1Structure,
              chainSelection(CHAINS.PD_L1_COMPLEX.PD_L1),
              "PD-L1"
            )
          pdl1ComponentRef.current = pdl1Component || null
          if (pdl1Component) {
            const pdl1Data = pdl1Component.cell?.obj?.data
            if (pdl1Data) {
              chainCentersRef.current.pdl1 = Vec3.clone(pdl1Data.boundary.sphere.center)
            }
          }

          const keytrudaComponent =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              keytrudaStructure,
              multiChainSelection(CHAINS.KEYTRUDA_COMPLEX.KEYTRUDA),
              "Keytruda"
            )
          keytrudaComponentRef.current = keytrudaComponent || null

          // Create interface components for PD-L1 complex
          const pd1Pdl1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              pdL1Structure,
              residueSelection(CHAINS.PD_L1_COMPLEX.PD_1, PD_1_INTERFACE_RESIDUES_PDL1),
              "PD-1 interface (PD-L1)"
            )
          interfaceComponentsRef.current.pd1Pdl1 = pd1Pdl1Interface || null

          const pdl1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              pdL1Structure,
              residueSelection(CHAINS.PD_L1_COMPLEX.PD_L1, PD_L1_INTERFACE_RESIDUES),
              "PD-L1 interface"
            )
          interfaceComponentsRef.current.pdl1 = pdl1Interface || null

          // Create interface components for Keytruda complex
          const pd1KeytrudaInterface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              keytrudaStructure,
              residueSelection(CHAINS.KEYTRUDA_COMPLEX.PD_1, PD_1_INTERFACE_RESIDUES_KEYTRUDA),
              "PD-1 interface (Keytruda)"
            )
          interfaceComponentsRef.current.pd1Keytruda = pd1KeytrudaInterface || null

          const keytrudaInterfaces = []
          for (const [chainId, residues] of Object.entries(KEYTRUDA_INTERFACE_RESIDUES)) {
            const component =
              await plugin.builders.structure.tryCreateComponentFromExpression(
                keytrudaStructure,
                residueSelection(chainId, residues),
                `Keytruda interface ${chainId}`
              )
            if (component) {
              keytrudaInterfaces.push(component)
            }
          }
          interfaceComponentsRef.current.keytruda = keytrudaInterfaces
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
        setError(`Failed to load superposed structures: ${e.message}`)
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
      pd1ComponentRef.current = null
      pdl1ComponentRef.current = null
      keytrudaComponentRef.current = null
      ligandRepsRef.current = { pdl1: null, keytruda: null }
      interfaceComponentsRef.current = { pd1Pdl1: null, pdl1: null, pd1Keytruda: null, keytruda: [] }
      interfaceRepsRef.current = { pd1: null, ligand: [] }
      setIsStructureReady(false)
    }
  }, [])

  useEffect(() => {
    if (!pluginRef.current || !isStructureReady) {
      return
    }

    const plugin = pluginRef.current

    const updateLigand = async () => {
      const repsToRemove = []
      if (ligandRepsRef.current.pdl1?.ref) {
        repsToRemove.push(ligandRepsRef.current.pdl1.ref)
      }
      if (ligandRepsRef.current.keytruda?.ref) {
        repsToRemove.push(ligandRepsRef.current.keytruda.ref)
      }

      if (repsToRemove.length > 0) {
        const builder = plugin.state.data.build()
        for (const ref of repsToRemove) {
          builder.delete(ref)
        }
        await builder.commit()
      }

      ligandRepsRef.current = { pdl1: null, keytruda: null }

      if (activeLigand === "pdl1" && pdl1ComponentRef.current) {
        ligandRepsRef.current.pdl1 =
          await plugin.builders.structure.representation.addRepresentation(
            pdl1ComponentRef.current,
            {
              type: "cartoon",
              color: "uniform",
              colorParams: { value: PD_L1_COLOR },
            }
          )
      }

      if (activeLigand === "keytruda" && keytrudaComponentRef.current) {
        ligandRepsRef.current.keytruda =
          await plugin.builders.structure.representation.addRepresentation(
            keytrudaComponentRef.current,
            {
              type: "cartoon",
              color: "uniform",
              colorParams: { value: KEYTRUDA_COLOR },
            }
          )
      }
    }

    plugin.dataTransaction(updateLigand)
  }, [activeLigand, isStructureReady])

  useEffect(() => {
    if (!pluginRef.current || !isStructureReady) {
      return
    }

    const plugin = pluginRef.current
    const option = INTERFACE_REP_OPTIONS.find(opt => opt.id === interfaceStyle)

    plugin.dataTransaction(async () => {
      const repsToRemove = []
      if (interfaceRepsRef.current.pd1?.ref) {
        repsToRemove.push(interfaceRepsRef.current.pd1.ref)
      }
      for (const rep of interfaceRepsRef.current.ligand || []) {
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

      interfaceRepsRef.current = { pd1: null, ligand: [] }

      if (!option || !option.type) {
        return
      }

      const buildProps = colorValue => ({
        type: option.type,
        color: "uniform",
        colorParams: { value: colorValue },
        ...(option.typeParams ? { typeParams: option.typeParams } : {}),
      })

      if (activeLigand === "pdl1") {
        if (interfaceComponentsRef.current.pd1Pdl1) {
          interfaceRepsRef.current.pd1 =
            await plugin.builders.structure.representation.addRepresentation(
              interfaceComponentsRef.current.pd1Pdl1,
              buildProps(PD_1_COLOR)
            )
        }
        if (interfaceComponentsRef.current.pdl1) {
          const rep = await plugin.builders.structure.representation.addRepresentation(
            interfaceComponentsRef.current.pdl1,
            buildProps(PD_L1_COLOR)
          )
          interfaceRepsRef.current.ligand = [rep]
        }
      } else if (activeLigand === "keytruda") {
        if (interfaceComponentsRef.current.pd1Keytruda) {
          interfaceRepsRef.current.pd1 =
            await plugin.builders.structure.representation.addRepresentation(
              interfaceComponentsRef.current.pd1Keytruda,
              buildProps(PD_1_COLOR)
            )
        }
        interfaceRepsRef.current.ligand = []
        for (const component of interfaceComponentsRef.current.keytruda || []) {
          const rep = await plugin.builders.structure.representation.addRepresentation(
            component,
            buildProps(KEYTRUDA_COLOR)
          )
          interfaceRepsRef.current.ligand.push(rep)
        }
      }
    })
  }, [activeLigand, interfaceStyle, isStructureReady])

  const legendItems = [
    { label: "PD-1", color: PD_1_COLOR },
    { label: "PD-L1", color: PD_L1_COLOR, opacity: activeLigand === "pdl1" ? 1 : 0.4 },
    { label: "Keytruda", color: KEYTRUDA_COLOR, opacity: activeLigand === "keytruda" ? 1 : 0.4 },
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
          <span style={controlStyles.label}>Ligand</span>
          <SegmentedControl
            options={LIGAND_OPTIONS}
            value={activeLigand}
            onChange={setActiveLigand}
          />
        </div>
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

export default Pd1PoseOverlayViewer
