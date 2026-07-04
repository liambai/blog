import React from "react"

import "./link-preview.css"

const LinkPreview = ({ url, title, description, ogImageSrc }) => {
  return (
    <div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={url}
        className="preview-notion-container"
      >
        <div className="preview-notion-wrapper">
          <div className="preview-notion-title">{title}</div>
          <div className="preview-notion-description">{description}</div>
          <div className="preview-notion-url">
            <div className="preview-notion-link">{url}</div>
          </div>
        </div>
        <div className="preview-notion-image-wrapper">
          <img
            className="preview-notion-image"
            src={ogImageSrc}
            alt="link-preview"
          />
        </div>
      </a>
    </div>
  )
}

export default LinkPreview
