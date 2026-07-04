// Static site metadata. Replaces Gatsby's `siteMetadata` GraphQL layer.
const social = {
  twitter: "liambai21",
  linkedin: "liambai",
}

export const SITE = {
  title: "Liam Bai",
  description: "Liam Bai's personal website",
  siteUrl: "https://liambai.com",
  defaultImage: "/previews/liam.jpeg",
  social,
  socialUrls: {
    twitter: `https://x.com/${social.twitter}`,
    linkedin: `https://www.linkedin.com/in/${social.linkedin}`,
  },
  repo: "liambai/blog",
  gtagId: "G-HNDQQVBZ0D",
}
