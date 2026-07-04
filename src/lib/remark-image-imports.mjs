// Lets posts write `<Image path="./images/x.png" />` with a relative string
// instead of a top-of-file `import img from "./images/x.png"` + `path={img}`.
//
// At build time this walks each MDX tree, and for every <Image> whose `path` is
// a relative string ("./…" or "../…") it hoists an ESM default import to the top
// of the file and rewrites the attribute to reference it. Repeated paths in one
// file share a single import. Absolute paths ("/data/…") and expression values
// (`path={foo}`) are left untouched.
//
// Scoped to the <Image> component's `path` attribute so it can't accidentally
// rewrite unrelated props (e.g. the d3 heatmaps' absolute `tokensPath`).

const COMPONENT = "Image"
const ATTRIBUTE = "path"

function isRelative(value) {
  return (
    typeof value === "string" &&
    (value.startsWith("./") || value.startsWith("../"))
  )
}

function importNode(identifier, source) {
  return {
    type: "mdxjsEsm",
    value: `import ${identifier} from ${JSON.stringify(source)}`,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ImportDeclaration",
            specifiers: [
              {
                type: "ImportDefaultSpecifier",
                local: { type: "Identifier", name: identifier },
              },
            ],
            source: {
              type: "Literal",
              value: source,
              raw: JSON.stringify(source),
            },
          },
        ],
      },
    },
  }
}

function identifierAttributeValue(identifier) {
  return {
    type: "mdxJsxAttributeValueExpression",
    value: identifier,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ExpressionStatement",
            expression: { type: "Identifier", name: identifier },
          },
        ],
      },
    },
  }
}

export default function remarkImageImports() {
  return tree => {
    const importsByPath = new Map() // source path -> generated identifier
    const imports = []

    const visit = node => {
      if (
        (node.type === "mdxJsxFlowElement" ||
          node.type === "mdxJsxTextElement") &&
        node.name === COMPONENT &&
        Array.isArray(node.attributes)
      ) {
        for (const attr of node.attributes) {
          if (
            attr.type === "mdxJsxAttribute" &&
            attr.name === ATTRIBUTE &&
            isRelative(attr.value)
          ) {
            let identifier = importsByPath.get(attr.value)
            if (!identifier) {
              identifier = `__autoImg${importsByPath.size}`
              importsByPath.set(attr.value, identifier)
              imports.push(importNode(identifier, attr.value))
            }
            attr.value = identifierAttributeValue(identifier)
          }
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(visit)
    }

    visit(tree)
    if (imports.length) tree.children.unshift(...imports)
  }
}
