import React, { forwardRef } from "react"
import { viewerStyles } from "../shared/styles"

const ViewerShell = forwardRef(({ title, isLoading, error, children }, ref) => {
  if (error) {
    return <div style={viewerStyles.error}>Error: {error}</div>
  }

  return (
    <div style={viewerStyles.container}>
      {title && <h3 style={viewerStyles.title}>{title}</h3>}
      <div style={viewerStyles.viewerWrapper}>
        <div ref={ref} style={viewerStyles.viewer} />
        {isLoading && <div style={viewerStyles.loading}>Loading...</div>}
        {children}
      </div>
    </div>
  )
})

ViewerShell.displayName = "ViewerShell"

export default ViewerShell
