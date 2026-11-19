import * as THREE from "three";
import { DEPTH_LUT } from "./depth-palette";

export function depthSample(camera, occluders, x, y) {
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(x, y), camera);
  // Perspective far is measured along the optical axis, not along a corner ray.
  ray.far = camera.far * 2;
  const hit = ray.intersectObjects(occluders, false)[0];
  if (!hit) return null;
  const depth = -hit.point.clone().applyMatrix4(camera.matrixWorldInverse).z;
  return depth >= camera.near && depth <= camera.far
    ? { point: hit.point, depth }
    : null;
}
export async function createDepthCloud(
  camera,
  occluders,
  { width = 144, height = 96, cancelled = () => false } = {},
) {
  const positions = [],
    colors = [],
    depths = [];
  camera.updateMatrixWorld(true);
  for (let row = 0; row < height; row++) {
    if (cancelled()) return null;
    for (let col = 0; col < width; col++) {
      const hit = depthSample(
        camera,
        occluders,
        ((col + 0.5) / width) * 2 - 1,
        1 - ((row + 0.5) / height) * 2,
      );
      if (!hit) continue;
      positions.push(...hit.point);
      depths.push(hit.depth);
    }
    if (row % 8 === 7)
      await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  // Presentation contrast: use the full spectrum over this view's visible depth range.
  const nearest = Math.min(...depths),
    farthest = Math.max(...depths);
  const span = farthest - nearest;
  for (const depth of depths) {
    const t = span > 1e-5 ? (depth - nearest) / span : 0.5;
    const rgb = DEPTH_LUT[Math.min(255, Math.max(0, Math.round(t * 255)))];
    colors.push(...rgb.map((channel) => channel / 255));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    uniforms: {
      opacity: { value: 0 },
      pointSize: { value: 2.6 * Math.min(window.devicePixelRatio || 1, 1.75) },
    },
    vertexShader: `uniform float pointSize; varying vec3 vColor; void main(){vColor=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_PointSize=pointSize;}`,
    fragmentShader: `uniform float opacity; varying vec3 vColor; void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;gl_FragColor=vec4(vColor,opacity*(1.0-smoothstep(.3,.5,d)));}`,
  });
  const cloud = new THREE.Points(geometry, material);
  cloud.name = "Camera-visible depth samples";
  cloud.visible = false;
  return {
    cloud,
    update(amount) {
      cloud.visible = amount > 0;
      material.uniforms.opacity.value = amount;
      geometry.setDrawRange(
        0,
        Math.floor((positions.length / 3) * Math.min(1, amount * 1.3)),
      );
    },
  };
}
