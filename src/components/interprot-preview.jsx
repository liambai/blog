import React, { useEffect, useRef, useState, useCallback } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { CustomElementProperty } from "molstar/lib/mol-model-props/common/custom-element-property"
import { Color } from "molstar/lib/mol-util/color"

const PDB_ID = "7KYX"
const ACTIVATION_VALUES = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  4.2, 8.4, 10.9, 12, 11.4, 9.9, 6.6, 2.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 8.4, 23, 22, 13.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 9.2, 23.5, 22.9, 13.7, 0, 0, 0, 0, 0, 0, 0, 2.9, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  9.1, 24.3, 22.1, 12.8, 0, 0, 0, 0, 0, 0, 0, 2.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8.9, 15,
  16.1, 13.6, 13.5, 10.5, 7.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2.6,
  11.7, 18.1, 15.8, 9.2, 2.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2.7, 3.5, 3.8, 3.7, 2.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

const InterProtPreview = ({ width = "100%", height = "100%" }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const [isStructureLoaded, setIsStructureLoaded] = useState(false)

  // Create color theme function that maps white (0) to red (max)
  const createActivationColorTheme = useCallback((values, maxValue) => {
    if (!values || values.length === 0) {
      return null
    }

    return CustomElementProperty.create({
      label: "Activation Colors",
      name: "activation-colors",
      getData(model) {
        const map = new Map()
        const { residueAtomSegments } = model.atomicHierarchy
        for (
          let i = 0, _i = model.atomicHierarchy.atoms._rowCount;
          i < _i;
          i++
        ) {
          const residueIdx = residueAtomSegments.index[i]
          map.set(i, { residueIdx })
        }
        return { value: map }
      },
      coloring: {
        getColor(p) {
          const { residueIdx } = p
          const value = values[residueIdx]

          if (
            value === undefined ||
            value === null ||
            typeof value !== "number" ||
            value === 0
          ) {
            return Color(0xffffff) // White for zero or missing values
          }

          // Normalize value to range [0, 1]
          const normalized = Math.min(1.0, Math.max(0.0, value / maxValue))

          // Interpolate from white (255, 255, 255) to red (255, 0, 0)
          const r = 255
          const g = Math.round(255 * (1 - normalized))
          const b = Math.round(255 * (1 - normalized))

          return Color.fromRgb(r, g, b)
        },
        defaultColor: Color(0xffffff),
      },
      getLabel() {
        return "Activation Colors"
      },
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const initMolstar = async () => {
      try {
        if (pluginRef.current) {
          pluginRef.current.dispose()
          pluginRef.current = null
        }

        containerRef.current.innerHTML = ""
        setIsStructureLoaded(false)

        const pluginSpec = {
          ...DefaultPluginSpec(),
          config: [
            ...(DefaultPluginSpec().config || []),
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
        await plugin.builders.structure.hierarchy.applyPreset(
          trajectory,
          "default"
        )

        // Filter to show only the first chain
        await plugin.dataTransaction(async () => {
          const structures =
            plugin.managers.structure.hierarchy.current.structures
          if (structures && structures.length > 0) {
            const structure = structures[0]
            const units = structure.units

            if (units.length > 0) {
              // Get the first chain ID from the first unit
              const firstUnit = units[0]
              const firstChainId =
                firstUnit.model.atomicHierarchy.chains.chainId[
                  firstUnit.chainIndex[0]
                ]

              // Collect units to remove (all units not from first chain)
              const unitsToRemove = []
              for (const unit of units) {
                const chainId =
                  unit.model.atomicHierarchy.chains.chainId[unit.chainIndex[0]]
                if (chainId !== firstChainId) {
                  unitsToRemove.push(unit.id)
                }
              }

              // Remove units from other chains
              if (unitsToRemove.length > 0) {
                await plugin.managers.structure.component.removeComponents(
                  structure.components,
                  unitsToRemove
                )
              }
            }
          }
        })

        setIsStructureLoaded(true)
      } catch (e) {
        console.error(`Failed to load PDB ${PDB_ID}:`, e)
        setIsStructureLoaded(false)
      }
    }

    initMolstar()

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
      setIsStructureLoaded(false)
    }
  }, [width, height])

  // Apply coloring when structure is loaded and activation values are provided
  useEffect(() => {
    if (!pluginRef.current || !isStructureLoaded) {
      return
    }

    const plugin = pluginRef.current
    const maxValue = Math.max(...ACTIVATION_VALUES, 1) // Find max value, default to 1
    const colorTheme = createActivationColorTheme(ACTIVATION_VALUES, maxValue)

    if (!colorTheme || !colorTheme.colorThemeProvider) {
      return
    }

    const colorThemeProvider = colorTheme.colorThemeProvider
    const themeName = colorThemeProvider.name

    if (typeof themeName !== "string" || !themeName.trim()) {
      return
    }

    // Remove existing theme if present, then add new one
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
            color: themeName,
          }
        )
      }
    })
  }, [isStructureLoaded, createActivationColorTheme])

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--color-accent)",
        maxWidth: "100%",
        boxSizing: "border-box",
        cursor: "pointer",
      }}
    />
  )
}

export default InterProtPreview
