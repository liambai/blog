import * as React from "react"
import { Link } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const header = (
    <div className="header-inner">
      <Link className="header-logo" to="/">
        {title}
      </Link>
      <nav className="header-nav" aria-label="Primary">
        <Link to="/blog">Blog</Link>
      </nav>
    </div>
  )

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
    </div>
  )
}

export default Layout
