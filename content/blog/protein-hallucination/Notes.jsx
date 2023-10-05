import React from "react"
import getNoteComponents from "../../../src/components/notes"
import { InlineMath } from "react-katex"

const notes = {
  1: (
    <>
      <span>In </span>
      <a href="https://en.wikipedia.org/wiki/Metropolis%E2%80%93Hastings_algorithm">
        Metropolis-Hastings
      </a>
      <span>
        , we still accept this change some percentage of the time, proportional
        to how counterproductive it was.
      </span>
    </>
  ),
  2: "Residue, meaning unit, refers to a position in the amino acid chain.",
  3: (
    <>
      <span>Notation is slightly rewritten to be consistent with </span>
      <a href="https://www.nature.com/articles/s41586-021-04184-w">
        this paper.
      </a>
      <span> It's conventional to use double bars like </span>
      <InlineMath>{"D_{KL}(P || Q) "}</InlineMath>
      <span> to emphasize the fact that</span>
      <InlineMath>{"D_{KL}(P || Q) \\neq D_{KL}(Q || P)"}</InlineMath>
      <span>, i.e. KL divergence is not a distance metric.</span>
    </>
  ),
  4: (
    <>
      <span>If you're new to deep learning, I highly recommend this </span>
      <a href="https://youtu.be/VMj-3S1tku0?si=QKn0kH44GPjA1eBG">video</a>
      <span> by Andrej Karpathy explaining gradients from the ground up.</span>
    </>
  ),
  5: (
    <>
      <span>
        Enzymes are proteins that catalyze a reaction by binding to the
        reactant, called{" "}
      </span>
      <b>substrate</b>
      <span>
        . Enzyme are indispensible to our bodily functions: as you read this, an
        enzyme called{" "}
      </span>
      <a href="https://en.wikipedia.org/wiki/PDE6">PDE6</a>
      <span>
        {" "}
        catalyzes the reactions converting the light hitting your retina to
        signals sent to your brain.
      </span>
    </>
  ),
  6: (
    <>
      <span>
        We omitted an important detail: how do we choose which residues should
        constitute the motif? The cited{" "}
      </span>
      <a href="https://www.biorxiv.org/content/10.1101/2020.11.29.402743v1">
        paper{" "}
      </a>
      <span>
        tried two approaches, described in a section called 'Motif placement
        algorithms'.
      </span>
    </>
  ),
}

export const { Note, NoteList } = getNoteComponents(notes)
