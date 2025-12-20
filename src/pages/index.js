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
        <p className="landing-summary">
          Hi! I'm Liam. I work on software at{" "}
          <a href="https://generatebiomedicines.com/">Generate:Biomedicines</a>.
        </p>
        <p className="landing-summary">
          I am interested in protein design, interpretability, and systems for
          automating scientific discovery. I enjoy writing about things I learn.
          Check out my <Link to="/blog">blog</Link>!
        </p>
        <div className="landing-links">
          <Link to="/blog">Blog</Link>
          <a href={`https://www.x.com/${social.twitter}`}>Twitter</a>
          <a href="https://github.com/liambai">GitHub</a>
          <a href="https://scholar.google.com/citations?user=qBKzB2sAAAAJ&hl=en">
            Google Scholar
          </a>
          <a href={`https://www.linkedin.com/in/${social.linkedin}`}>
            LinkedIn
          </a>
        </div>
        <section className="landing-work">
          <h2>My work</h2>
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
