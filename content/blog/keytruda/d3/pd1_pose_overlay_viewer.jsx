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
  const [activeLigand, setActiveLigand] = useState("pdl1")
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
      height: "440px",
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
      top: "10px",
      right: "10px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "6px 12px",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.9)",
      fontSize: "0.8rem",
      color: "#1f2933",
      zIndex: 15,
    },
    controlsLabel: {
      fontWeight: 500,
    },
    toggleWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    toggleText: {
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    switchButton: {
      position: "relative",
      width: "46px",
      height: "26px",
      borderRadius: "999px",
      border: "1px solid rgba(31, 41, 51, 0.12)",
      padding: 0,
      background: "#d6dde5",
      cursor: "pointer",
      transition: "background 150ms ease",
    },
    switchThumb: {
      position: "absolute",
      top: "1px",
      left: "1px",
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
      transition: "transform 150ms ease",
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

  const isPdl1Active = activeLigand === "pdl1"
  const isKeytrudaActive = activeLigand === "keytruda"

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
                opacity: isPdl1Active ? 1 : 0.4,
              }}
            />
            PD-L1
          </div>
          <div style={styles.legendItem}>
            <span
              style={{
                ...styles.swatch,
                background: `#${KEYTRUDA_COLOR.toString(16)}`,
                opacity: isKeytrudaActive ? 1 : 0.4,
              }}
            />
            Keytruda
          </div>
        </div>
        <div style={styles.controlsOverlay}>
          <span style={styles.controlsLabel}>Ligand</span>
          <div style={styles.toggleWrapper}>
            <span
              style={{
                ...styles.toggleText,
                color: isPdl1Active ? "#1f2933" : "#9aa5b1",
              }}
            >
              PD-L1
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isKeytrudaActive}
              aria-label="Toggle ligand between PD-L1 and Keytruda"
              onClick={() =>
                setActiveLigand(isKeytrudaActive ? "pdl1" : "keytruda")
              }
              style={{
                ...styles.switchButton,
                background: isKeytrudaActive ? "#1d71b7" : "#d6dde5",
              }}
            >
              <span
                style={{
                  ...styles.switchThumb,
                  transform: isKeytrudaActive
                    ? "translateX(20px)"
                    : "translateX(0)",
                }}
              />
            </button>
            <span
              style={{
                ...styles.toggleText,
                color: isKeytrudaActive ? "#1f2933" : "#9aa5b1",
              }}
            >
              Keytruda
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pd1PoseOverlayViewer
