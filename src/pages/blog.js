import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMdx.nodes

  return (
    <Layout location={location} title={siteTitle}>
      <section className="blog-hero">
        <h1 className="page-title">Liam's Blog</h1>
        <div className="blog-intro-row">
          <img
            className="blog-avatar"
            src="/previews/liam.jpeg"
            alt="Liam Bai"
          />
          <p className="blog-intro">
            Exploring machine learning and biology. Come learn with me!
          </p>
        </div>
      </section>
      <ol className="post-list">
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug

          return (
            <li key={post.fields.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
                  <small>{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          )
        })}
      </ol>
    </Layout>
  )
}

export default BlogPage

export const Head = ({ location }) => (
  <Seo title="Blog" pathname={location?.pathname} />
)

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMdx(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
