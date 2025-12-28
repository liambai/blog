import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder"
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"

const PDB_ID = "3BIK"
const PD_L1_CHAIN = "A"
const PD_1_CHAIN = "B"

const PD_L1_COLOR = 0xe9c46a
const PD_1_COLOR = 0x2a9d8f
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
const PD_L1_INTERFACE_RESIDUES = [
  19, 26, 54, 56, 66, 113, 115, 121, 122, 123, 125,
]
const PD_1_INTERFACE_RESIDUES = [
  64, 66, 68, 73, 74, 75, 76, 78, 126, 128, 130, 132, 134, 136,
]

const chainSelection = chainId =>
  MS.struct.generator.atomGroups({
    "chain-test": MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chainId,
    ]),
  })

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

        const pdbUrl = `https://files.rcsb.org/download/${PDB_ID}.pdb`
        const structureData = await plugin.builders.data.download({
          url: pdbUrl,
          isBinary: false,
          label: `PDB ${PDB_ID}`,
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
              chainSelection(PD_L1_CHAIN),
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
            // Compute center of PD-L1 chain
            const pdl1Data = pdL1Chain.cell?.obj?.data
            if (pdl1Data) {
              chainCentersRef.current.pdl1 = Vec3.clone(pdl1Data.boundary.sphere.center)
            }
          }

          const pd1Chain =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              chainSelection(PD_1_CHAIN),
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
            // Compute center of PD-1 chain
            const pd1Data = pd1Chain.cell?.obj?.data
            if (pd1Data) {
              chainCentersRef.current.pd1 = Vec3.clone(pd1Data.boundary.sphere.center)
            }
          }

          const pdL1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              residueSelection(PD_L1_CHAIN, PD_L1_INTERFACE_RESIDUES),
              "PD-L1 interface"
            )
          interfaceComponentsRef.current.pdl1 = pdL1Interface || null

          const pd1Interface =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              residueSelection(PD_1_CHAIN, PD_1_INTERFACE_RESIDUES),
              "PD-1 interface"
            )
          interfaceComponentsRef.current.pd1 = pd1Interface || null
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
        setError(`Failed to load PDB ${PDB_ID}: ${e.message}`)
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
      alignItems: "center",
      gap: "8px",
      padding: "6px 10px",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.9)",
      fontSize: "0.8rem",
      color: "#1f2933",
      zIndex: 15,
    },
    controlsLabel: {
      fontWeight: 500,
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
              }}
            />
            PD-L1
          </div>
        </div>
        <div style={styles.controlsOverlay}>
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
  )
}

export default Pd1Pdl1Viewer
