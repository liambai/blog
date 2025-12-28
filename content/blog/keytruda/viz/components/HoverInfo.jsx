import React from "react"

const baseStyles = {
  container: {
    position: "fixed",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    fontSize: "0.85rem",
    color: "#1f2933",
    zIndex: 1000,
    pointerEvents: "none",
    transform: "translate(12px, 12px)",
  },
  chain: {
    fontWeight: 600,
    marginBottom: "2px",
  },
  residue: {
    fontFamily: "monospace",
    color: "#52606d",
  },
}

const HoverInfo = ({ info, chainNames = {} }) => {
  if (!info || !info.position) return null

  const { residueName, residueNumber, chainId, position } = info
  const chainLabel = chainNames[chainId] || `Chain ${chainId}`

  const style = {
    ...baseStyles.container,
    left: position.x,
    top: position.y,
  }

  return (
    <div style={style}>
      <div style={baseStyles.chain}>{chainLabel}</div>
      <div style={baseStyles.residue}>
        {residueName} {residueNumber}
      </div>
    </div>
  )
}

export default HoverInfo
