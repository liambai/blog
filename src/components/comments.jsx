import React, { useEffect } from "react"
import { useStaticQuery, graphql } from "gatsby"

const commentNodeId = "comments"

const Comments = ({ issueTerm }) => {
  // this query is for retrieving the repo name from gatsby-config
  const data = useStaticQuery(graphql`
    query RepoQuery {
      site {
        siteMetadata {
          repo
        }
      }
    }
  `)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://utteranc.es/client.js"
    script.async = true
    script.setAttribute("repo", data.site.siteMetadata.repo)
    script.setAttribute("issue-term", issueTerm)
    script.setAttribute("label", "comment")
    script.setAttribute("theme", "github-light")
    script.setAttribute("crossOrigin", "anonymous")

    const scriptParentNode = document.getElementById(commentNodeId)
    scriptParentNode.appendChild(script)

    return () => {
      // cleanup - remove the older script with previous theme
      scriptParentNode.removeChild(scriptParentNode.firstChild)
    }
  }, [data, issueTerm])

  return <div id={commentNodeId} />
}

export default Comments
