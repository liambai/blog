import React from "react"
import { legendStyles } from "../shared/styles"

const Legend = ({ items }) => {
  return (
    <div style={legendStyles.container}>
      {items.map(item => (
        <div key={item.label} style={legendStyles.item}>
          <span
            style={{
              ...legendStyles.swatch,
              background: `#${item.color.toString(16).padStart(6, "0")}`,
              opacity: item.opacity ?? 1,
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default Legend
