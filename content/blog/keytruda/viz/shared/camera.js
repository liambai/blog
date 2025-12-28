import { Vec3 } from "molstar/lib/mol-math/linear-algebra"

export const setCameraWithPd1OnLeft = (plugin, pd1Center, partnerCenter) => {
  const camera = plugin.canvas3d.camera
  const currentSnapshot = camera.getSnapshot()

  // Midpoint between PD-1 and partner
  const target = Vec3.scale(
    Vec3(),
    Vec3.add(Vec3(), pd1Center, partnerCenter),
    0.5
  )

  // Vector from PD-1 to partner (partner should appear on the right)
  const pd1ToPartner = Vec3.sub(Vec3(), partnerCenter, pd1Center)

  // We want to look perpendicular to the pd1-to-partner axis
  // Use cross product with a reference up vector to get view direction
  const refUp = Vec3.create(0, 1, 0)
  let viewDir = Vec3.cross(Vec3(), pd1ToPartner, refUp)

  // If pd1ToPartner is nearly parallel to refUp, use a different reference
  if (Vec3.magnitude(viewDir) < 0.001) {
    const altRef = Vec3.create(1, 0, 0)
    viewDir = Vec3.cross(Vec3(), pd1ToPartner, altRef)
  }
  Vec3.normalize(viewDir, viewDir)

  // Camera distance based on current view
  const currentDist = Vec3.distance(currentSnapshot.position, currentSnapshot.target)
  const position = Vec3.scaleAndAdd(Vec3(), target, viewDir, currentDist)

  // Up vector should be perpendicular to both view direction and pd1-to-partner
  const up = Vec3.cross(Vec3(), viewDir, pd1ToPartner)
  Vec3.normalize(up, up)

  camera.setState(
    { ...currentSnapshot, target: [...target], position: [...position], up: [...up] },
    0
  )
}
