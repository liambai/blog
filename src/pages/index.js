import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = ({ data, location }) => {
  const site = data.site.siteMetadata
  const author = site.author
  const social = site.social

  return (
    <Layout location={location} title={site.title}>
      <div className="landing-simple">
        <h1 className="landing-title">Hi, I'm Liam</h1>
        <p className="landing-summary">
          I'm a software engineer at{" "}
          <a href="https://generatebiomedicines.com/">Generate:Biomedicines</a>{" "}
          working on accelerating drug discovery. I am broadly interested in
          protein design, interpretability, and automating scientific discovery.
        </p>
        <div className="landing-links">
          <Link className="landing-link-blog" to="/blog">
            Blog
          </Link>
          {social?.twitter && (
            <a href={`https://www.x.com/${social.twitter}`}>Twitter</a>
          )}
          {social?.linkedin && (
            <a href={`https://www.linkedin.com/in/${social.linkedin}`}>
              LinkedIn
            </a>
          )}
        </div>
        <section className="landing-work">
          <h2>Selected work</h2>
          <ul className="work-list">
            <li className="work-item">
              <a href="https://interprot.com/">InterProt</a>
              <p className="work-description">
                Protein language models with a focus on interpretability and
                biological insight.
              </p>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <Seo title="Home" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
        description
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
`
