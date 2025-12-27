import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder"

const PDB_ID = "5B8C"
const PD_1_CHAIN = "C"
const KEYTRUDA_CHAINS = ["A", "B"]

const PD_1_COLOR = 0x2a9d8f
const KEYTRUDA_COLOR = 0xe76f51
const INTERFACE_STYLE_ID = "interface-style-keytruda"
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
const PD_1_INTERFACE_RESIDUES = [
  59, 60, 61, 62, 63, 64, 66, 68, 75, 76, 77, 78, 81, 83, 85, 86, 87, 88,
  89, 90, 126, 128, 129, 130, 131, 132, 134,
]
const KEYTRUDA_INTERFACE_RESIDUES = {
  A: [33, 34, 36, 53, 54, 57, 58, 60, 95, 96, 97, 98, 100],
  B: [28, 30, 31, 33, 35, 50, 51, 52, 54, 55, 57, 58, 59, 99, 101, 102, 103,
    104, 105],
}

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

const Pd1KeytrudaViewer = ({ title }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
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
          const keytrudaChains =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              structure,
              multiChainSelection(KEYTRUDA_CHAINS),
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
          }

          const keytrudaInterfaces = []
          for (const [chainId, residues] of Object.entries(
            KEYTRUDA_INTERFACE_RESIDUES
          )) {
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
              residueSelection(PD_1_CHAIN, PD_1_INTERFACE_RESIDUES),
              "PD-1 interface"
            )
          interfaceComponentsRef.current.pd1 = pd1Interface || null
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
      gap: "8px",
      padding: "6px 10px",
      borderRadius: "999px",
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
    select: {
      padding: "4px 18px 4px 8px",
      borderRadius: "999px",
      border: "1px solid #cbd2d9",
      background: "white",
      fontSize: "0.8rem",
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
                background: `#${KEYTRUDA_COLOR.toString(16)}`,
              }}
            />
            Keytruda
          </div>
        </div>
        <div style={styles.controlsOverlay}>
          <label htmlFor={INTERFACE_STYLE_ID} style={styles.controlsLabel}>
            Interface:
          </label>
          <select
            id={INTERFACE_STYLE_ID}
            value={interfaceStyle}
            onChange={event => setInterfaceStyle(event.target.value)}
            style={styles.select}
          >
            {INTERFACE_REP_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default Pd1KeytrudaViewer
