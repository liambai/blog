import React, { useState, useEffect, useRef, useCallback } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { CustomElementProperty } from "molstar/lib/mol-model-props/common/custom-element-property"
import { Color } from "molstar/lib/mol-util/color"
import Papa from "papaparse"

// Function to fetch CSV data (similar to true_tokens_ranks_heatmap.jsx)
const fetchCSV = async path => {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch CSV: ${response.status} ${response.statusText}`
    )
  }
  return await response.text()
}

// Color interpolation function (e.g., Viridis)
const viridisColorMapRGB = t => {
  // Simplified Viridis color scale (adjust as needed)
  // t is expected to be between 0 and 1
  const colors = [
    [68, 1, 84], // Dark purple
    [59, 82, 139], // Blue
    [33, 145, 140], // Teal
    [94, 201, 98], // Green
    [253, 231, 37], // Yellow
  ]
  const i = Math.max(
    0,
    Math.min(colors.length - 1, Math.floor(t * (colors.length - 1)))
  )
  const color1 = colors[i]
  const color2 = colors[Math.min(colors.length - 1, i + 1)]
  const localT = t * (colors.length - 1) - i

  return [
    Math.round(color1[0] * (1 - localT) + color2[0] * localT),
    Math.round(color1[1] * (1 - localT) + color2[1] * localT),
    Math.round(color1[2] * (1 - localT) + color2[2] * localT),
  ]
}

const StructureOverlay = ({ title, pdbId, logitsPath, maxLogit }) => {
  const pluginRef = useRef(null)
  const [logitData, setLogitData] = useState([])
  const [currentLayer, setCurrentLayer] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [logitsLoading, setLogitsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isStructureLoaded, setIsStructureLoaded] = useState(false)

  const containerRef = useRef(null)

  // Fetch and parse CSV data
  useEffect(() => {
    if (!logitsPath) {
      setLogitsLoading(false)
      return
    }
    setLogitsLoading(true)
    const loadLogits = async () => {
      const csvData = await fetchCSV(logitsPath)
      if (csvData) {
        const parsedData = Papa.parse(csvData, {
          header: false,
          dynamicTyping: true,
        }).data.filter(
          row =>
            row && row.length > 0 && row.some(val => val !== null && val !== "")
        )
        setLogitData(parsedData)
        if (parsedData.length > 0) {
          setCurrentLayer(0) // Default to first layer
        }
      }
      setLogitsLoading(false)
    }
    loadLogits()
  }, [logitsPath])

  const createResidueColorTheme = useCallback(
    (layerLogits, name = "residue-logit-colors") => {
      if (!layerLogits || layerLogits.length === 0) {
        return CustomElementProperty.create({
          label: "Default Colors",
          name: name + "_default",
          getData(model) {
            const map = new Map()
            for (
              let i = 0, _i = model.atomicHierarchy.atoms._rowCount;
              i < _i;
              i++
            ) {
              map.set(i, { residueIdx: 0, chainId: "" }) // Dummy data
            }
            return { value: map }
          },
          coloring: {
            getColor() {
              return Color(0xcccccc)
            }, // Default gray
            defaultColor: Color(0xcccccc),
          },
          getLabel() {
            return "Default Colors"
          },
        })
      }

      return CustomElementProperty.create({
        label: "Residue Logit Colors",
        name,
        getData(model) {
          const map = new Map()
          const { residueAtomSegments } = model.atomicHierarchy
          for (
            let i = 0, _i = model.atomicHierarchy.atoms._rowCount;
            i < _i;
            i++
          ) {
            const residueIdx = residueAtomSegments.index[i]
            map.set(i, { residueIdx }) // Store 0-based model residue index
          }
          return { value: map }
        },
        coloring: {
          getColor(p) {
            const { residueIdx } = p
            // layerLogits is 0-indexed based on sequence position from CSV
            const logit = layerLogits[residueIdx]

            if (
              logit === undefined ||
              logit === null ||
              typeof logit !== "number"
            ) {
              return Color(0xcccccc) // Default color for missing/invalid logit
            }
            // Normalize logit value to range [0, 1] based on maxLogit
            const normalizedLogit = Math.min(
              1.0,
              Math.max(0.0, logit / maxLogit)
            )
            const rgbColor = viridisColorMapRGB(normalizedLogit)
            return Color.fromRgb(rgbColor[0], rgbColor[1], rgbColor[2])
          },
          defaultColor: Color(0xffffff), // Default to white if no specific color
        },
        getLabel() {
          return "Residue Logit Colors"
        },
      })
    },
    [maxLogit]
  )

  // Initialize Molstar and load structure
  useEffect(() => {
    if (!pdbId) {
      setIsLoading(false)
      setError(null)
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
      setIsStructureLoaded(false) // Ensure structure is marked as not loaded
      return
    }

    // If we have a PDB ID, we intend to load.
    // The actual initialization will check containerRef.current.
    setIsLoading(true)
    setError(null)
    setIsStructureLoaded(false) // Reset before loading new structure

    const initMolstar = async () => {
      if (!containerRef.current) {
        setIsLoading(false) // Can't load if container isn't there
        setIsStructureLoaded(false) // Ensure consistent state
        return
      }

      try {
        if (pluginRef.current) {
          pluginRef.current.dispose()
          pluginRef.current = null
        }

        containerRef.current.innerHTML = "" // Clear previous viewer

        const plugin = new PluginContext(DefaultPluginSpec())
        pluginRef.current = plugin
        await plugin.init()

        const canvas = document.createElement("canvas")
        containerRef.current.appendChild(canvas)
        plugin.initViewer(canvas, containerRef.current)

        const pdbUrl = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`
        const structureData = await plugin.builders.data.download({
          url: pdbUrl,
          isBinary: false,
          label: `PDB ${pdbId}`,
        })

        const trajectory = await plugin.builders.structure.parseTrajectory(
          structureData,
          "pdb"
        )
        await plugin.builders.structure.hierarchy.applyPreset(
          trajectory,
          "default"
        )
        setIsLoading(false)
        setIsStructureLoaded(true) // Structure is now loaded
      } catch (e) {
        setError(`Failed to load PDB ${pdbId}: ${e.message}`)
        setIsLoading(false)
        setIsStructureLoaded(false) // Structure loading failed
      }
    }

    initMolstar()

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
      setIsStructureLoaded(false) // Cleanup, structure no longer considered loaded
    }
  }, [pdbId]) // Only depend on pdbId. The check for containerRef.current handles its availability.

  // Update coloring when layer changes
  useEffect(() => {
    if (
      !pluginRef.current ||
      !pluginRef.current.managers.structure ||
      !isStructureLoaded || // Added check for structure readiness
      logitData.length === 0 ||
      currentLayer >= logitData.length ||
      !pdbId
    ) {
      return
    }

    const plugin = pluginRef.current
    const layerLogits = logitData[currentLayer]

    if (!layerLogits) {
      return
    }

    const themeName = `residue-logit-theme-layer-${currentLayer}`
    const ResidueLogitTheme = createResidueColorTheme(layerLogits, themeName)

    if (!ResidueLogitTheme || !ResidueLogitTheme.colorThemeProvider) {
      return
    }

    const colorThemeProvider = ResidueLogitTheme.colorThemeProvider
    const actualThemeName = colorThemeProvider.name

    if (typeof actualThemeName !== "string" || !actualThemeName.trim()) {
      return
    }

    // Always attempt to remove the theme before adding the new instance.
    plugin.representation.structure.themes.colorThemeRegistry.remove(
      colorThemeProvider
    )
    plugin.representation.structure.themes.colorThemeRegistry.add(
      colorThemeProvider
    )

    plugin.dataTransaction(async () => {
      if (
        !plugin.managers.structure.hierarchy.current.structures ||
        plugin.managers.structure.hierarchy.current.structures.length === 0
      ) {
        return
      }
      for (const s of plugin.managers.structure.hierarchy.current.structures) {
        await plugin.managers.structure.component.updateRepresentationsTheme(
          s.components,
          {
            color: actualThemeName, // Use the name from the colorThemeProvider
          }
        )
      }
    })
  }, [
    currentLayer,
    logitData,
    createResidueColorTheme,
    pdbId,
    isStructureLoaded,
  ]) // Added isStructureLoaded to dependencies

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "450px",
        marginBottom: 20,
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginLeft: 50,
          marginTop: 15,
          marginBottom: 15,
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        {title}
      </h2>
      <div
        id={`molstar-viewer-${pdbId}`}
        ref={containerRef}
        style={{
          width: "100%",
          height: "calc(100% - 30px)",
          position: "absolute",
          top: title ? "30px" : "0",
          left: 0,
          backgroundColor:
            isLoading || error || logitsLoading ? "#f0f0f0" : "transparent",
        }}
      />

      {(isLoading || logitsLoading) && !error && (
        <div
          style={{
            position: "absolute",
            top: title ? "calc(50% + 15px)" : "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "5px",
            zIndex: 20,
          }}
        >
          Loading...
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: title ? "calc(50% + 15px)" : "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "red",
            padding: "20px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "5px",
            zIndex: 20,
          }}
        >
          Error: {error}
        </div>
      )}

      {!isLoading && !error && pdbId && logitData.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="layer-slider"
            style={{
              marginRight: "10px",
              whiteSpace: "nowrap",
              fontWeight: "500",
              fontSize: "14px",
              color: "#333",
            }}
          >
            Layer: {currentLayer + 1}
          </label>
          <input
            type="range"
            id="layer-slider"
            value={currentLayer}
            min={0}
            max={logitData.length - 1}
            step={1}
            onChange={e => setCurrentLayer(parseInt(e.target.value, 10))}
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  )
}

export default StructureOverlay
