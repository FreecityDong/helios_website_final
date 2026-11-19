import * as THREE from "three";
import { createSurfaceLibrary } from "./room-surface";
import { createRoomRoute } from "./room-route";
import { createDepthCloud } from "./room-depth";
import { createObservation } from "./room-observation";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function stageFor(name) {
  name = name.replaceAll("_", " ");
  if (/rainbow|route/i.test(name)) return null;
  if (/foundation|floor joint/i.test(name)) return [0, 0.16];
  if (/wall|skirting|window/i.test(name)) return [0.1, 0.38];
  if (/sofa|cushion|rug|coffee table|lounge|chair leg|side table/i.test(name))
    return [0.32, 0.65];
  if (/dining|sideboard|bookcase/i.test(name)) return [0.48, 0.8];
  return [0.72, 0.98];
}
const ease = (n) => {
  const t = THREE.MathUtils.clamp(n, 0, 1);
  return t * t * (3 - 2 * t);
};
export async function createRoomScene(host, initialProgress) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const paper = new THREE.Color(getComputedStyle(host).getPropertyValue("--room-paper").trim() || "#dad8d1");
  renderer.setClearColor(paper, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  camera.position.set(11, 12, 15);
  camera.lookAt(0, 0.9, -0.1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b9bd, 2.0));
  const light = new THREE.DirectionalLight(0xfff9ed, 2.6);
  light.position.set(-3, 9, 4);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  Object.assign(light.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 30,
  });
  light.shadow.normalBias = 0.035;
  scene.add(light);
  const fill = new THREE.DirectionalLight(0xdfeaff, 1.0);
  fill.position.set(6, 5, -3);
  scene.add(fill);
  let disposed = false,
    progress = initialProgress,
    model,
    objects = [];
  let observation, depthCloud;
  const route = createRoomRoute();
  scene.add(route.mesh);
  const surfaces = createSurfaceLibrary();
  const navy = new THREE.Color(0x101f30);
  const depthAmount = (p) =>
    ease((p - 0.5) / 0.15) * (1 - ease((p - 0.72) / 0.1));
  const observationAmount = (p) =>
    p >= 0.72 ? 0 : Math.max(0, Math.min(1, (p - 0.26) / 0.18));
  const draw = () => {
    if (!disposed) {
      if (observation) {
        const mouth = observation.mouth.clone().project(camera);
        const pin = host.closest(".room-story-pin");
        pin?.style.setProperty(
          "--speaker-x",
          `${(mouth.x * 0.5 + 0.5) * host.clientWidth}px`,
        );
        pin?.style.setProperty(
          "--speaker-y",
          `${(-mouth.y * 0.5 + 0.5) * host.clientHeight}px`,
        );
      }
      renderer.render(scene, camera);
    }
  };
  const resize = () => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    // Fixed camera, complete room framed within the viewport on every screen.
    const desktop = w > 900;
    const height = Math.max(9.3, (desktop ? 17.5 : 12.8) / aspect);
    camera.left = -height * aspect * (desktop ? 0.64 : 0.5);
    camera.right = height * aspect * (desktop ? 0.36 : 0.5);
    camera.top = height * (desktop ? 0.5 : 0.6);
    camera.bottom = -height * (desktop ? 0.5 : 0.4);
    camera.updateProjectionMatrix();
    update(progress);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  function update(rawProgress) {
    progress = rawProgress;
    const p =
      rawProgress < 0.56
        ? rawProgress / 0.78
        : rawProgress < 0.63
          ? 0.72 + ((rawProgress - 0.56) / 0.07) * 0.1
          : rawProgress < 0.74
            ? 0.82
            : Math.min(1, 0.86 + ((rawProgress - 0.74) / 0.12) * 0.14);
    for (const { node, position, materials, range } of objects) {
      const build = Math.min(1, p / 0.24);
      const t = ease((build - range[0]) / (range[1] - range[0]));
      node.visible = t > 0.001;
      node.position.copy(position);
      node.position.y += (1 - t) * 0.65;
      for (const m of materials) {
        m.opacity = t * (1 - depthAmount(p) * 0.94);
        m.depthWrite = t > 0.95 && depthAmount(p) < 0.01;
      }
    }
    observation?.update(observationAmount(p), p >= 0.5, {
      restore: p >= 0.72,
      skin: ease((p - 0.86) / 0.14),
    });
    depthCloud?.update(depthAmount(p));
    route.update(
      ease((rawProgress - 0.63) / 0.09),
      1 - ease((rawProgress - 0.76) / 0.06),
    );
    surfaces.update(ease((p - 0.86) / 0.14));
    renderer.setClearColor(paper.clone().lerp(navy, depthAmount(p)), 1);
    draw();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    observation?.dispose();
    surfaces.dispose();
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) for (const m of [].concat(o.material)) m.dispose();
    });
    renderer.dispose();
    renderer.domElement.remove();
  }
  resize();
  try {
    const gltf = await new GLTFLoader().loadAsync("./models/living-dining.glb");
    model = gltf.scene;
    scene.add(model);
    for (const node of model.children) {
      const range = stageFor(node.name);
      if (!range) {
        node.visible = false;
        continue;
      }
      const materials = [];
      node.traverse((mesh) => {
        if (!mesh.isMesh) return;
        const copies = [].concat(mesh.material).map((m) => {
          const clone = m.clone();
          clone.transparent = true;
          surfaces.prepare(clone, node.name);
          return clone;
        });
        mesh.material = Array.isArray(mesh.material) ? copies : copies[0];
        materials.push(...copies);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      });
      objects.push({ node, position: node.position.clone(), materials, range });
    }
    scene.updateMatrixWorld(true);
    observation = createObservation(scene, model, host, camera);
    // Sample once in small batches. Scrolling reuses the resulting geometry.
    const depthSurfaces = observation.occluders.map((mesh) => {
      const copy = new THREE.Mesh(mesh.geometry, mesh.material);
      copy.matrixAutoUpdate = false;
      copy.matrixWorld.copy(mesh.matrixWorld);
      return copy;
    });
    createDepthCloud(observation.sensor, depthSurfaces, {
      width: host.clientWidth < 760 ? 96 : 144,
      height: host.clientWidth < 760 ? 64 : 96,
      cancelled: () => disposed,
    }).then((result) => {
      if (!result) return;
      if (disposed) {
        result.cloud.geometry.dispose();
        result.cloud.material.dispose();
        return;
      }
      depthCloud = result;
      scene.add(result.cloud);
      update(progress);
    });
    update(progress);
    function capture() {
      if (disposed) return null;
      const target = new THREE.WebGLRenderTarget(900, 600);
      target.texture.colorSpace = THREE.SRGBColorSpace;
      const photoCamera = observation.sensor.clone();
      photoCamera.far = 20;
      photoCamera.updateProjectionMatrix();
      const overlays = scene.getObjectByName("Camera observation");
      const visible = overlays.visible;
      const previousTarget = renderer.getRenderTarget();
      try {
        overlays.visible = false;
        renderer.setRenderTarget(target);
        renderer.render(scene, photoCamera);
        const pixels = new Uint8Array(900 * 600 * 4);
        renderer.readRenderTargetPixels(target, 0, 0, 900, 600, pixels);
        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = 600;
        const context = canvas.getContext("2d");
        const image = context.createImageData(900, 600);
        for (let y = 0; y < 600; y++)
          image.data.set(
            pixels.subarray((599 - y) * 900 * 4, (600 - y) * 900 * 4),
            y * 900 * 4,
          );
        context.putImageData(image, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.9);
      } finally {
        overlays.visible = visible;
        renderer.setRenderTarget(previousTarget);
        target.dispose();
        draw();
      }
    }
    return { update, dispose, capture };
  } catch (error) {
    dispose();
    throw error;
  }
}
