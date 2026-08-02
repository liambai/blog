// Ambient type for X/Twitter's widgets.js, which attaches `twttr` to the global
// window at runtime. Used by src/components/Tweet.astro's client script.
interface Window {
  twttr?: {
    widgets?: {
      load: (element?: HTMLElement) => void
    }
  }
}
