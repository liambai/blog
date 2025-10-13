import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"

const StructureViewer = ({ title, pdbId }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pdbId) return

    let isCancelled = false

    const init = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!containerRef.current) return

        // Clean any previous instance
        if (pluginRef.current) {
          pluginRef.current.dispose()
          pluginRef.current = null
        }
        containerRef.current.innerHTML = ""

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
        containerRef.current.appendChild(canvas)
        plugin.initViewer(canvas, containerRef.current)

        try {
          if (plugin.layout && plugin.layout.state) {
            plugin.layout.state.set({ isExpanded: false })
            if (plugin.layout.controls) {
              plugin.layout.controls.set({ visible: false })
            }
          }
        } catch (e) {
          // Non-fatal; layout tweaks may vary with versions
          // eslint-disable-next-line no-console
          console.warn("Layout config warning:", e)
        }

        const pdbUrl = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`
        const data = await plugin.builders.data.download({
          url: pdbUrl,
          isBinary: false,
          label: `PDB ${pdbId}`,
        })

        const traj = await plugin.builders.structure.parseTrajectory(data, "pdb")
        await plugin.builders.structure.hierarchy.applyPreset(traj, "default")

        if (!isCancelled) setIsLoading(false)
      } catch (e) {
        if (!isCancelled) {
          setError(`Failed to load PDB ${pdbId}: ${e.message}`)
          setIsLoading(false)
        }
      }
    }

    init()

    return () => {
      isCancelled = true
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
    }
  }, [pdbId])

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "450px",
      marginBottom: "20px",
      overflow: "hidden",
    },
    title: {
      textAlign: "center",
      margin: "0 0 15px 0",
      padding: 0,
      fontSize: "1.2rem",
      fontWeight: "bold",
    },
    viewerContainer: {
      flex: 1,
      position: "relative",
      backgroundColor: isLoading || error ? "#f0f0f0" : "transparent",
      overflow: "hidden",
    },
    viewer: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    message: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      padding: "15px",
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: "5px",
      zIndex: 20,
    },
  }

  return (
    <div style={styles.container}>
      {title && <h2 style={styles.title}>{title}</h2>}
      <div style={styles.viewerContainer}>
        <div ref={containerRef} style={styles.viewer} />
        {(isLoading && !error) && (
          <div style={styles.message}>Loading structure...</div>
        )}
        {error && <div style={{ ...styles.message, color: "red" }}>{error}</div>}
      </div>
    </div>
  )
}

export default StructureViewer

