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
import InterProtPreview from "../components/interprot-preview"

const IndexPage = ({ data, location }) => {
  const site = data.site.siteMetadata
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
            <li className="work-item work-item-paper">
              <div className="work-item-content">
                <div className="work-thumbnail">
                  <InterProtPreview />
                </div>
                <div className="work-details">
                  <a href="https://interprot.com/" className="work-title">
                    From Mechanistic Interpretability to Mechanistic Biology:
                    Training, Evaluating, and Interpreting Sparse Autoencoders
                    on Protein Language Models
                  </a>
                  <p className="work-authors">
                    Etowah Adams*, Liam Bai*, Minji Lee, Yiyang Yu, Mohammed
                    AlQuraishi
                  </p>
                  <p className="work-venue">
                    International Conference on Machine Learning (ICML), 2025
                    (Spotlight)
                  </p>
                  <div className="work-links">
                    <a href="https://interprot.com/">Website</a>
                    <a href="https://www.biorxiv.org/content/10.1101/2025.02.06.636901v2">
                      Paper
                    </a>
                    <a href="https://github.com/etowahadams/interprot">Code</a>
                  </div>
                </div>
              </div>
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
