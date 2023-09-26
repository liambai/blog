// custom typefaces
import "@fontsource-variable/montserrat"
import "@fontsource/merriweather"
// normalize CSS across browsers
import "./src/normalize.css"
// custom CSS styles
import "./src/style.css"

// Highlighting for code blocks
import "prismjs/themes/prism.css"

import "katex/dist/katex.min.css"

import littlefoot from "littlefoot"
require("littlefoot/dist/littlefoot.css")

export function onRouteUpdate() {
  littlefoot({
    activateOnHover: true,
    dismissOnUnhover: true,
    allowDuplicates: true,
    footnoteSelector: "span",
    buttonTemplate: `
      <button
        aria-label="Reference <% reference %>"
        class="littlefoot-button"
        id="<% reference %>"
      />
        [<% reference %>]
      </button>
    `,
  })
}
