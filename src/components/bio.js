/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Avatar from "./avatar"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          social {
            twitter
            linkedin
          }
        }
      }
    }
  `)

  const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      <Avatar className="bio-avatar" alt="Profile picture" size={50} />
      <p>
        Written by <strong>Liam Bai</strong>, who works on software at{" "}
        <a href="https://generatebiomedicines.com/">Generate:Biomedicines</a>{" "}
        and writes about machine learning and biology. He is on{" "}
        <a href={`https://x.com/${social.twitter}`}>Twitter</a> and{" "}
        <a href={`https://www.linkedin.com/in/${social.linkedin}`}>LinkedIn</a>.
      </p>
    </div>
  )
}

export default Bio
