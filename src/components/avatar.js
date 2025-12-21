import * as React from "react"
import { Link } from "gatsby"

import avatarImage from "../images/liam.jpeg"

const Avatar = ({ className, alt = "Liam Bai", size, loading = "lazy" }) => {
  const dimensions = size ? { width: size, height: size } : {}

  return (
    <Link to="/" aria-label="Home">
      <img
        className={className}
        src={avatarImage}
        alt={alt}
        loading={loading}
        {...dimensions}
      />
    </Link>
  )
}

export default Avatar
