import React from "react"
import { controlStyles } from "../shared/styles"

const SegmentedControl = ({ options, value, onChange }) => {
  return (
    <div style={controlStyles.segmentedControl}>
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          style={{
            ...controlStyles.segment,
            ...(value === option.id ? controlStyles.segmentActive : {}),
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
