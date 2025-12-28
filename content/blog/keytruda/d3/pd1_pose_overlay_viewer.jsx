import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder"
import {
  QueryContext,
  StructureElement,
  StructureSelection,
} from "molstar/lib/mol-model/structure"
import { alignAndSuperpose } from "molstar/lib/mol-model/structure/structure/util/superposition"
import { compile } from "molstar/lib/mol-script/runtime/query/compiler"
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms"
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"

const PD_L1_PDB_ID = "3BIK"
const KEYTRUDA_PDB_ID = "5B8C"
const PD_L1_CHAIN = "A"
const PD_1_CHAIN_PD_L1 = "B"
const PD_1_CHAIN_KEYTRUDA = "C"
const KEYTRUDA_CHAINS = ["A", "B"]

const PD_1_COLOR = 0x2a9d8f
const PD_L1_COLOR = 0xe9c46a
const KEYTRUDA_COLOR = 0xe76f51

const INTERFACE_REP_OPTIONS = [
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

// Interface residues for PD-L1 complex (3BIK)
const PD_L1_INTERFACE_RESIDUES = [19, 26, 54, 56, 66, 113, 115, 121, 122, 123, 125]
const PD_1_INTERFACE_RESIDUES_PDL1 = [64, 66, 68, 73, 74, 75, 76, 78, 126, 128, 130, 132, 134, 136]

// Interface residues for Keytruda complex (5B8C)
const KEYTRUDA_INTERFACE_RESIDUES = {
  A: [33, 34, 36, 53, 54, 57, 58, 60, 95, 96, 97, 98, 100],
  B: [28, 30, 31, 33, 35, 50, 51, 52, 54, 55, 57, 58, 59, 99, 101, 102, 103, 104, 105],
}
const PD_1_INTERFACE_RESIDUES_KEYTRUDA = [
  59, 60, 61, 62, 63, 64, 66, 68, 75, 76, 77, 78, 81, 83, 85, 86, 87, 88, 89, 90, 126, 128, 129, 130, 131, 132, 134,
]

const chainSelection = chainId =>
  MS.struct.generator.atomGroups({
    "chain-test": MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chainId,
    ]),
  })

const multiChainSelection = chainIds => {
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

const residueSelection = (chainId, residues) => {
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

const setCameraWithPd1OnLeft = (plugin, pd1Center, partnerCenter) => {
  const camera = plugin.canvas3d.camera
  const currentSnapshot = camera.getSnapshot()

  // Midpoint between PD-1 and partner
  const target = Vec3.scale(
    Vec3(),
    Vec3.add(Vec3(), pd1Center, partnerCenter),
    0.5
  )

  // Vector from PD-1 to partner (partner should appear on the right)
  const pd1ToPartner = Vec3.sub(Vec3(), partnerCenter, pd1Center)

  // We want to look perpendicular to the pd1-to-partner axis
  // Use cross product with a reference up vector to get view direction
  const refUp = Vec3.create(0, 1, 0)
  let viewDir = Vec3.cross(Vec3(), pd1ToPartner, refUp)

  // If pd1ToPartner is nearly parallel to refUp, use a different reference
  if (Vec3.magnitude(viewDir) < 0.001) {
    const altRef = Vec3.create(1, 0, 0)
    viewDir = Vec3.cross(Vec3(), pd1ToPartner, altRef)
  }
  Vec3.normalize(viewDir, viewDir)

  // Camera distance based on current view
  const currentDist = Vec3.distance(currentSnapshot.position, currentSnapshot.target)
  const position = Vec3.scaleAndAdd(Vec3(), target, viewDir, currentDist)

  // Up vector should be perpendicular to both view direction and pd1-to-partner
  const up = Vec3.cross(Vec3(), viewDir, pd1ToPartner)
  Vec3.normalize(up, up)

  camera.setState(
    { ...currentSnapshot, target: [...target], position: [...position], up: [...up] },
    0
  )
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
          PD_1_CHAIN_PD_L1
        )
        const pd1KeytrudaLoci = getChainLoci(
          keytrudaStructure.cell.obj.data,
          PD_1_CHAIN_KEYTRUDA
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
              chainSelection(PD_1_CHAIN_PD_L1),
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
            // Compute center of PD-1 chain
            const pd1Data = pd1Component.cell?.obj?.data
            if (pd1Data) {
              chainCentersRef.current.pd1 = Vec3.clone(pd1Data.boundary.sphere.center)
            }
          }

          const pdl1Component =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              pdL1Structure,
              chainSelection(PD_L1_CHAIN),
              "PD-L1"
            )
          pdl1ComponentRef.current = pdl1Component || null
          if (pdl1Component) {
            // Compute center of PD-L1 chain
            const pdl1Data = pdl1Component.cell?.obj?.data
            if (pdl1Data) {
              chainCentersRef.current.pdl1 = Vec3.clone(pdl1Data.boundary.sphere.center)
            }
          }

          const keytrudaComponent =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              keytrudaStructure,
              multiChainSelection(KEYTRUDA_CHAINS),
              "Keytruda"
            )
          keytrudaComponentRef.current = keytrudaComponent || null

          // Create interface components for PD-L1 complex
          const pd1Pdl1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              pdL1Structure,
              residueSelection(PD_1_CHAIN_PD_L1, PD_1_INTERFACE_RESIDUES_PDL1),
              "PD-1 interface (PD-L1)"
            )
          interfaceComponentsRef.current.pd1Pdl1 = pd1Pdl1Interface || null

          const pdl1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              pdL1Structure,
              residueSelection(PD_L1_CHAIN, PD_L1_INTERFACE_RESIDUES),
              "PD-L1 interface"
            )
          interfaceComponentsRef.current.pdl1 = pdl1Interface || null

          // Create interface components for Keytruda complex
          const pd1KeytrudaInterface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              keytrudaStructure,
              residueSelection(PD_1_CHAIN_KEYTRUDA, PD_1_INTERFACE_RESIDUES_KEYTRUDA),
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

        // Set camera orientation with PD-1 on left after a short delay for rendering
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
      // Remove existing interface representations
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

      // Add interface representations based on active ligand
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

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>
  }

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      gap: "12px",
      marginBottom: "20px",
    },
    title: {
      textAlign: "center",
      margin: 0,
      fontSize: "1.1rem",
      fontWeight: 600,
    },
    viewerWrapper: {
      position: "relative",
      width: "100%",
      height: "min(440px, 70vh)",
      minHeight: "300px",
      borderRadius: "12px",
      overflow: "hidden",
      backgroundColor: "#f5f5f5",
    },
    viewer: {
      width: "100%",
      height: "100%",
    },
    loading: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#444",
      fontSize: "0.95rem",
      background: "rgba(255, 255, 255, 0.7)",
    },
    controlsOverlay: {
      position: "absolute",
      bottom: "10px",
      right: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      padding: "8px 10px",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.9)",
      fontSize: "0.8rem",
      color: "#1f2933",
      zIndex: 15,
    },
    controlRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    controlsLabel: {
      fontWeight: 500,
      minWidth: "52px",
    },
    segmentedControl: {
      display: "flex",
      background: "rgba(0, 0, 0, 0.06)",
      borderRadius: "6px",
      padding: "2px",
    },
    segment: {
      padding: "6px 10px",
      border: "none",
      background: "transparent",
      fontSize: "0.75rem",
      fontWeight: 500,
      color: "#616e7c",
      cursor: "pointer",
      borderRadius: "4px",
      transition: "all 150ms ease",
      WebkitTapHighlightColor: "transparent",
    },
    segmentActive: {
      background: "white",
      color: "#1f2933",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    legend: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      position: "absolute",
      top: "10px",
      left: "10px",
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.9)",
      fontSize: "0.85rem",
      color: "#1f2933",
      zIndex: 15,
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    swatch: {
      width: "12px",
      height: "12px",
      borderRadius: "3px",
      display: "inline-block",
    },
  }

  const ligandOptions = [
    { id: "pdl1", label: "PD-L1" },
    { id: "keytruda", label: "Keytruda" },
  ]

  return (
    <div style={styles.container}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <div style={styles.viewerWrapper}>
        <div ref={containerRef} style={styles.viewer} />
        {isLoading && <div style={styles.loading}>Loading...</div>}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span
              style={{
                ...styles.swatch,
                background: `#${PD_1_COLOR.toString(16)}`,
              }}
            />
            PD-1
          </div>
          <div style={styles.legendItem}>
            <span
              style={{
                ...styles.swatch,
                background: `#${PD_L1_COLOR.toString(16)}`,
                opacity: activeLigand === "pdl1" ? 1 : 0.4,
              }}
            />
            PD-L1
          </div>
          <div style={styles.legendItem}>
            <span
              style={{
                ...styles.swatch,
                background: `#${KEYTRUDA_COLOR.toString(16)}`,
                opacity: activeLigand === "keytruda" ? 1 : 0.4,
              }}
            />
            Keytruda
          </div>
        </div>
        <div style={styles.controlsOverlay}>
          <div style={styles.controlRow}>
            <span style={styles.controlsLabel}>Ligand</span>
            <div style={styles.segmentedControl}>
              {ligandOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveLigand(option.id)}
                  style={{
                    ...styles.segment,
                    ...(activeLigand === option.id ? styles.segmentActive : {}),
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.controlRow}>
            <span style={styles.controlsLabel}>Interface</span>
            <div style={styles.segmentedControl}>
              {INTERFACE_REP_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setInterfaceStyle(option.id)}
                  style={{
                    ...styles.segment,
                    ...(interfaceStyle === option.id ? styles.segmentActive : {}),
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pd1PoseOverlayViewer
