/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
            linkedin
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp"]}
        src="../images/liam.jpeg"
        width={50}
        height={50}
        quality={50}
        alt="Profile picture"
      />
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
