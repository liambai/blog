import * as React from "react"
import { Link, graphql } from "gatsby"
import {
  FaTwitter,
  FaGithub,
  FaGraduationCap,
  FaLinkedin,
  FaArrowRight,
} from "react-icons/fa"

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
        </p>
        <Link to="/blog" className="blog-cta-button">
          My blog <FaArrowRight className="arrow-icon" />
        </Link>
        <div className="landing-links">
          <a href={`https://www.x.com/${social.twitter}`} aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="https://github.com/liambai" aria-label="GitHub">
            <FaGithub />
          </a>
          <a
            href="https://scholar.google.com/citations?user=qBKzB2sAAAAJ&hl=en"
            aria-label="Google Scholar"
          >
            <FaGraduationCap />
          </a>
          <a
            href={`https://www.linkedin.com/in/${social.linkedin}`}
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>
        <section className="landing-work">
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
