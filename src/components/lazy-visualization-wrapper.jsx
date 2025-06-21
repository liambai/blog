import React, { useState, useEffect, useRef } from "react"

const LazyVisualizationWrapper = ({
  children,
  placeholder = "Loading visualization...",
  rootMargin = "200px",
  minHeight = "400px",
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    )

    const currentElement = elementRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [hasLoaded, rootMargin])

  return (
    <div ref={elementRef} style={{ minHeight }}>
      {isVisible ? (
        children
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: minHeight,
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "4px",
            color: "#666",
            fontSize: "14px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}

export default LazyVisualizationWrapper
