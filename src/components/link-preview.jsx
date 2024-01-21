import React from "react"

import "./link-preview.css"

const LinkPreview = ({ url, title, description, ogImageSrc }) => {
  return (
    <div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={url}
        class="preview-notion-container"
      >
        <div class="preview-notion-wrapper">
          <div class="preview-notion-title">{title}</div>
          <div class="preview-notion-description">{description}</div>
          <div class="preview-notion-url">
            <div class="preview-notion-link">{url}</div>
          </div>
        </div>
        <div class="preview-notion-image-wrapper">
          <img
            class="preview-notion-image"
            src={ogImageSrc}
            alt='link-preview'
          />
        </div>
      </a>
    </div>
  )
}

export default LinkPreview
