import React, { useEffect, useRef, useState } from "react"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginContext } from "molstar/lib/mol-plugin/context"
import {
  QueryContext,
  StructureElement,
  StructureSelection,
} from "molstar/lib/mol-model/structure"
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder"
import { alignAndSuperpose } from "molstar/lib/mol-model/structure/structure/util/superposition"
import { compile } from "molstar/lib/mol-script/runtime/query/compiler"
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms"
import ViewerShell from "./components/ViewerShell"
import Legend from "./components/Legend"
import HoverInfo from "./components/HoverInfo"
import SegmentedControl from "./components/SegmentedControl"
import useHoverInfo from "./hooks/useHoverInfo"
import { chainSelection } from "./shared/selections"
import { controlStyles } from "./shared/styles"

const ALPHAFOLD_URL =
  "https://alphafold.ebi.ac.uk/files/AF-Q15116-F1-model_v6.pdb"

const EXPERIMENTAL_PDB_ID = "3BIK"
const EXPERIMENTAL_PDB_URL = `https://files.rcsb.org/download/${EXPERIMENTAL_PDB_ID}.pdb`
const EXPERIMENTAL_CHAIN = "B" // PD-1 chain in 3BIK

const EXPERIMENTAL_COLOR = 0x808080 // Gray for experimental structure

const OVERLAY_OPTIONS = [
  { id: "off", label: "off" },
  { id: "on", label: "on" },
]

const COLOR_MODE_OPTIONS = [
  { id: "confidence", label: "confidence" },
  { id: "location", label: "location" },
]

// PD-1 domain boundaries (UniProt Q15116)
// Signal peptide: 1-20, Extracellular: 21-168, Transmembrane: 169-191, Intracellular: 192-288
const DOMAIN_COLORS = {
  extracellular: 0x5dade2, // Sky blue
  membrane: 0x7f8c8d, // Grey
  intracellular: 0xf39c12, // Warm orange
}

const DOMAIN_RANGES = {
  extracellular: { start: 1, end: 168 }, // Including signal peptide region
  membrane: { start: 169, end: 191 },
  intracellular: { start: 192, end: 288 },
}

const PLDDT_LEGEND = [
  { label: "Very high (>90)", color: 0x0053d6 },
  { label: "Confident (70-90)", color: 0x65cbf3 },
  { label: "Low (50-70)", color: 0xffdb13 },
  { label: "Very low (<50)", color: 0xff7d45 },
]

const LOCATION_LEGEND = [
  { label: "Extracellular", color: DOMAIN_COLORS.extracellular },
  { label: "Membrane", color: DOMAIN_COLORS.membrane },
  { label: "Intracellular", color: DOMAIN_COLORS.intracellular },
]

const getChainLoci = (structure, chainId) => {
  const query = compile(chainSelection(chainId))
  return StructureSelection.toLociWithCurrentUnits(
    query(new QueryContext(structure))
  )
}

const residueRangeSelection = (start, end) =>
  MS.struct.generator.atomGroups({
    "residue-test": MS.core.logic.and([
      MS.core.rel.gre([MS.ammp("auth_seq_id"), start]),
      MS.core.rel.lte([MS.ammp("auth_seq_id"), end]),
    ]),
  })

const applyTransform = (plugin, structure, matrix) => {
  const builder = plugin.state.data
    .build()
    .to(structure)
    .insert(StateTransforms.Model.TransformStructureConformation, {
      transform: { name: "matrix", params: { data: matrix, transpose: false } },
    })
  return plugin.runTask(plugin.state.data.updateTree(builder))
}

const AlphafoldPd1Viewer = ({ title }) => {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const afStructureRef = useRef(null)
  const afComponentRef = useRef(null)
  const afRepRef = useRef(null)
  const domainComponentsRef = useRef({})
  const domainRepsRef = useRef({})
  const expComponentRef = useRef(null)
  const expRepRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStructureReady, setIsStructureReady] = useState(false)
  const [colorMode, setColorMode] = useState("confidence")
  const [showOverlay, setShowOverlay] = useState("off")
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return

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

        // Load AlphaFold structure
        const afData = await plugin.builders.data.download({
          url: ALPHAFOLD_URL,
          isBinary: false,
          label: "AlphaFold PD-1",
        })

        const afTrajectory = await plugin.builders.structure.parseTrajectory(
          afData,
          "pdb"
        )
        const afModel = await plugin.builders.structure.createModel(
          afTrajectory
        )
        const afStructure = await plugin.builders.structure.createStructure(
          afModel
        )

        // Load experimental structure
        const expData = await plugin.builders.data.download({
          url: EXPERIMENTAL_PDB_URL,
          isBinary: false,
          label: `PDB ${EXPERIMENTAL_PDB_ID}`,
        })

        const expTrajectory = await plugin.builders.structure.parseTrajectory(
          expData,
          "pdb"
        )
        const expModel = await plugin.builders.structure.createModel(
          expTrajectory
        )
        const expStructure = await plugin.builders.structure.createStructure(
          expModel
        )

        // Align experimental structure to AlphaFold using PD-1 chains
        const afStructureData = afStructure.cell?.obj?.data
        const expStructureData = expStructure.cell?.obj?.data

        if (afStructureData && expStructureData) {
          const afLoci = getChainLoci(afStructureData, "A")
          const expLoci = getChainLoci(expStructureData, EXPERIMENTAL_CHAIN)

          if (
            !StructureElement.Loci.isEmpty(afLoci) &&
            !StructureElement.Loci.isEmpty(expLoci)
          ) {
            const transforms = alignAndSuperpose([afLoci, expLoci])
            if (transforms[0]?.bTransform) {
              await applyTransform(
                plugin,
                expStructure,
                transforms[0].bTransform
              )
            }
          }
        }

        // Store structure reference for later use
        afStructureRef.current = afStructure

        // Create AlphaFold component with pLDDT coloring (default)
        const afComponent =
          await plugin.builders.structure.tryCreateComponentStatic(
            afStructure,
            "polymer"
          )
        afComponentRef.current = afComponent || null

        if (afComponent) {
          afRepRef.current =
            await plugin.builders.structure.representation.addRepresentation(
              afComponent,
              {
                type: "cartoon",
                color: "uncertainty",
                colorParams: {
                  domain: [0, 100],
                  list: {
                    kind: "interpolate",
                    colors: [
                      [0xff7d45, 0],
                      [0xffdb13, 0.5],
                      [0x65cbf3, 0.7],
                      [0x0053d6, 0.9],
                      [0x0053d6, 1],
                    ],
                  },
                },
              }
            )
        }

        // Create domain components for location coloring (hidden initially)
        for (const [domainName, range] of Object.entries(DOMAIN_RANGES)) {
          const domainComponent =
            await plugin.builders.structure.tryCreateComponentFromExpression(
              afStructure,
              residueRangeSelection(range.start, range.end),
              `${domainName} domain`
            )
          if (domainComponent) {
            domainComponentsRef.current[domainName] = domainComponent
          }
        }

        // Create experimental structure component (hidden by default)
        const expComponent =
          await plugin.builders.structure.tryCreateComponentFromExpression(
            expStructure,
            chainSelection(EXPERIMENTAL_CHAIN),
            "Experimental PD-1"
          )
        expComponentRef.current = expComponent || null

        setIsStructureReady(true)
        setIsLoading(false)
      } catch (e) {
        setError(`Failed to load AlphaFold structure: ${e.message}`)
        setIsLoading(false)
      }
    }

    initMolstar()

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
      afStructureRef.current = null
      afComponentRef.current = null
      afRepRef.current = null
      domainComponentsRef.current = {}
      domainRepsRef.current = {}
      expComponentRef.current = null
      expRepRef.current = null
      setIsStructureReady(false)
    }
  }, [])

  // Handle overlay toggle
  useEffect(() => {
    if (!pluginRef.current || !isStructureReady) {
      return
    }

    const plugin = pluginRef.current

    const updateOverlay = async () => {
      // Remove existing experimental representation
      if (expRepRef.current?.ref) {
        const builder = plugin.state.data.build()
        builder.delete(expRepRef.current.ref)
        await builder.commit()
        expRepRef.current = null
      }

      // Add experimental representation if overlay is on
      if (showOverlay === "on" && expComponentRef.current) {
        expRepRef.current =
          await plugin.builders.structure.representation.addRepresentation(
            expComponentRef.current,
            {
              type: "cartoon",
              color: "uniform",
              colorParams: { value: EXPERIMENTAL_COLOR },
            }
          )
      }
    }

    plugin.dataTransaction(updateOverlay)
  }, [showOverlay, isStructureReady])

  // Handle color mode toggle
  useEffect(() => {
    if (!pluginRef.current || !isStructureReady) {
      return
    }

    const plugin = pluginRef.current

    const updateColorMode = async () => {
      // Remove confidence representation
      if (afRepRef.current?.ref) {
        const builder = plugin.state.data.build()
        builder.delete(afRepRef.current.ref)
        await builder.commit()
        afRepRef.current = null
      }

      // Remove domain representations
      for (const domainName of Object.keys(domainRepsRef.current)) {
        if (domainRepsRef.current[domainName]?.ref) {
          const builder = plugin.state.data.build()
          builder.delete(domainRepsRef.current[domainName].ref)
          await builder.commit()
        }
      }
      domainRepsRef.current = {}

      if (colorMode === "confidence") {
        // Add confidence coloring representation
        if (afComponentRef.current) {
          afRepRef.current =
            await plugin.builders.structure.representation.addRepresentation(
              afComponentRef.current,
              {
                type: "cartoon",
                color: "uncertainty",
                colorParams: {
                  domain: [0, 100],
                  list: {
                    kind: "interpolate",
                    colors: [
                      [0xff7d45, 0],
                      [0xffdb13, 0.5],
                      [0x65cbf3, 0.7],
                      [0x0053d6, 0.9],
                      [0x0053d6, 1],
                    ],
                  },
                },
              }
            )
        }
      } else if (colorMode === "location") {
        // Add location coloring representations for each domain
        for (const [domainName, component] of Object.entries(
          domainComponentsRef.current
        )) {
          domainRepsRef.current[domainName] =
            await plugin.builders.structure.representation.addRepresentation(
              component,
              {
                type: "cartoon",
                color: "uniform",
                colorParams: { value: DOMAIN_COLORS[domainName] },
              }
            )
        }
      }
    }

    plugin.dataTransaction(updateColorMode)
  }, [colorMode, isStructureReady])

  const hoverInfo = useHoverInfo(pluginRef, containerRef, isStructureReady)

  const baseLegend = colorMode === "confidence" ? PLDDT_LEGEND : LOCATION_LEGEND
  const legendItems = [
    ...baseLegend,
    ...(showOverlay === "on"
      ? [{ label: "Experimental", color: EXPERIMENTAL_COLOR }]
      : []),
  ]

  return (
    <ViewerShell
      ref={containerRef}
      title={title}
      isLoading={isLoading}
      error={error}
    >
      <Legend items={legendItems} />
      <HoverInfo info={hoverInfo} chainNames={{ A: "PD-1", B: "PD-1" }} />
      <div style={controlStyles.container}>
        <div style={controlStyles.row}>
          <span style={controlStyles.label}>Color by</span>
          <SegmentedControl
            options={COLOR_MODE_OPTIONS}
            value={colorMode}
            onChange={setColorMode}
          />
        </div>
        <div style={controlStyles.row}>
          <span style={controlStyles.label}>Experimental</span>
          <SegmentedControl
            options={OVERLAY_OPTIONS}
            value={showOverlay}
            onChange={setShowOverlay}
          />
        </div>
      </div>
    </ViewerShell>
  )
}

export default AlphafoldPd1Viewer
