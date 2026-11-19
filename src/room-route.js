import * as THREE from "three";

// Presentation route in the authored room, not a live navigation result.
export function createRoomRoute() {
  // Match the approved reference: right-front entrance, central aisle, sofa front.
  // Blender XY route coordinates are converted to Three.js XZ here.
  const controls = [
    [2.5, 2.65],
    [1.45, 2.24],
    [0.42, 1.55],
    [0.12, 0.72],
    [-0.35, 0.14],
    [-1.4, 0],
    [-2.9, 0],
  ].map(([x, z]) => new THREE.Vector3(x, 0.055, z));
  const curve = new THREE.CatmullRomCurve3(controls, false, "catmullrom", 0.5);
  const points = curve.getSpacedPoints(192);
  const positions = [],
    indices = [];
  points.forEach((point, i) => {
    const tangent = points[Math.min(i + 1, points.length - 1)]
      .clone()
      .sub(points[Math.max(0, i - 1)])
      .normalize();
    const across = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(
      0.14,
    );
    positions.push(...point.clone().add(across), ...point.clone().sub(across));
    if (i < points.length - 1) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshBasicMaterial({
    color: 0x39858a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Illustrative path to sofa";
  mesh.visible = false;
  return {
    mesh,
    update(reveal, opacity = 1) {
      mesh.visible = reveal > 0 && opacity > 0;
      material.opacity = opacity * 0.92;
      geometry.setDrawRange(
        0,
        Math.floor(THREE.MathUtils.clamp(reveal, 0, 1) * (points.length - 1)) *
          6,
      );
    },
  };
}
