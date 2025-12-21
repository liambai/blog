/**
 * SEO component that queries for data with
 * Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Seo = ({ description, title, children, pathname, image, type = "website" }) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
            defaultImage
            social {
              twitter
            }
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description
  const defaultTitle = site.siteMetadata?.title
  const siteUrl = site.siteMetadata?.siteUrl || ""
  const defaultImage = site.siteMetadata?.defaultImage || "/favicon.ico"
  const fullTitle = defaultTitle ? `${title} | ${defaultTitle}` : title
  const canonicalUrl =
    siteUrl && pathname ? `${siteUrl}${pathname}` : siteUrl || null
  const seoImage = image || defaultImage
  const isAbsoluteImage = seoImage && /^https?:\/\//i.test(seoImage)
  const imageUrl = seoImage
    ? isAbsoluteImage
      ? seoImage
      : `${siteUrl}${seoImage.startsWith("/") ? "" : "/"}${seoImage}`
    : null
  const twitterHandle = site.siteMetadata?.social?.twitter || ""
  const twitterCreator = twitterHandle
    ? twitterHandle.startsWith("@")
      ? twitterHandle
      : `@${twitterHandle}`
    : ""

  return (
    <>
      <title>{fullTitle}</title>
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {siteUrl ? (
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${defaultTitle || title} RSS Feed`}
          href={`${siteUrl}/rss.xml`}
        />
      ) : null}
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      <meta
        name="twitter:card"
        content={imageUrl ? "summary_large_image" : "summary"}
      />
      {twitterCreator ? (
        <>
          <meta name="twitter:creator" content={twitterCreator} />
          <meta name="twitter:site" content={twitterCreator} />
        </>
      ) : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {children}
    </>
  )
}

export default Seo
