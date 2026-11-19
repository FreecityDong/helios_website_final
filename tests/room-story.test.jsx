import { expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoomStory from "../src/RoomStory";
it("offers a complete scene and manual chapters when motion is reduced", async () => {
  render(<RoomStory reduce />);
  expect(
    screen.getByRole("heading", { name: "Ask. Hear. Understand." }),
  ).toBeInTheDocument();
  const stages = within(
    screen.getByRole("navigation", { name: "Room scene stages" }),
  );
  await userEvent.click(
    stages.getByRole("button", { name: "Your surroundings" }),
  );
  expect(
    screen.getByRole("heading", { name: "Every space has a story." }),
  ).toBeInTheDocument();
  expect(
    stages.getByRole("button", { name: "Your surroundings" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("Choose a view to explore")).toBeInTheDocument();
});

it("loads the Blender asset with staged furniture and a hidden route", async () => {
  const { readFileSync } = await import("node:fs");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { stageFor } = await import("../src/room-scene");
  const bytes = readFileSync("public/models/living-dining.glb");
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  const gltf = await new GLTFLoader().parseAsync(buffer, "");
  const meshes = [];
  gltf.scene.traverse((node) => {
    if (node.isMesh) meshes.push(node);
  });
  expect(meshes.length).toBeGreaterThan(100);
  expect(stageFor("Foundation")[0]).toBe(0);
  expect(stageFor("Back wall")[0]).toBeLessThan(stageFor("Sofa back")[0]);
  expect(stageFor("Plant leaf")[0]).toBeGreaterThan(stageFor("Dining seat")[0]);
  const routes = gltf.scene.children.filter((node) => /route/i.test(node.name));
  expect(routes.length).toBeGreaterThan(0);
  for (const route of routes) {
    expect(stageFor(route.name)).toBeNull();
    route.traverse((mesh) => {
      if (!mesh.isMesh) return;
      for (const material of [].concat(mesh.material)) {
        expect(material.color.g).toBeGreaterThan(material.color.r);
        expect(Math.abs(material.color.b - material.color.g)).toBeLessThan(
          0.03,
        );
      }
    });
  }
});

it("rejects objects outside the sensor view and behind an opaque obstacle", async () => {
  const THREE = await import("three");
  const { canSeeTarget } = await import("../src/room-observation");
  const camera = new THREE.PerspectiveCamera(60, 1.5, 0.1, 10);
  camera.position.set(0, 0, 3);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const target = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial(),
  );
  target.updateMatrixWorld(true);
  expect(canSeeTarget({ meshes: [target] }, camera, [target])).toBe(true);
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 0.2),
    new THREE.MeshBasicMaterial(),
  );
  wall.position.z = 1.5;
  wall.updateMatrixWorld(true);
  expect(canSeeTarget({ meshes: [target] }, camera, [target, wall])).toBe(
    false,
  );
  target.position.x = 8;
  target.updateMatrixWorld(true);
  expect(canSeeTarget({ meshes: [target] }, camera, [target])).toBe(false);
});

it("separates the dining table and four chairs in the real asset", async () => {
  const { readFileSync } = await import("node:fs");
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { diningTargets, createObservation } =
    await import("../src/room-observation");
  const bytes = readFileSync("public/models/living-dining.glb");
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  const { scene: model } = await new GLTFLoader().parseAsync(buffer, "");
  const targets = diningTargets(model);
  expect(targets.filter((t) => t.label === "Chair")).toHaveLength(4);
  expect(targets.filter((t) => t.label === "Table")).toHaveLength(1);
  for (const target of targets)
    expect(target.meshes.length).toBeGreaterThanOrEqual(5);
  const scene = new THREE.Scene();
  scene.add(model);
  const host = document.createElement("div");
  const camera = new THREE.PerspectiveCamera();
  const observation = createObservation(scene, model, host, camera);
  observation.update(1);
  const labels = [...host.querySelectorAll(".room-detection-label")]
    .filter((e) => !e.hidden)
    .map((e) => e.textContent);
  expect(labels).toContain("Table");
  expect(labels).toContain("Chair");
  observation.update(1, true);
  expect(
    [...host.querySelectorAll(".room-detection-label")].every((e) => e.hidden),
  ).toBe(true);
  observation.update(0, true, { restore: true, skin: 1 });
  const wearer = scene.getObjectByName("Wearer facing dining area");
  expect(wearer.parent.visible).toBe(true);
  expect(scene.getObjectByName("Observation overlays").visible).toBe(false);
  expect(scene.getObjectByName("Hair").material.color.getHex()).toBe(0x352b26);
  observation.update(0, true, { restore: true, skin: 0 });
  expect(scene.getObjectByName("Hair").material.color.getHex()).toBe(0xe0e4e2);
  observation.dispose();
  expect(host.children).toHaveLength(0);
});

it("clips the sensor volume to the floor and inside wall faces", async () => {
  const THREE = await import("three");
  const { clipViewPolygon } = await import("../src/room-observation");
  const polygon = clipViewPolygon([
    new THREE.Vector3(2.5, 1.28, 2.45),
    new THREE.Vector3(-7, -2, -5),
    new THREE.Vector3(7, 4, -5),
  ]);
  expect(polygon.length).toBeGreaterThan(2);
  for (const p of polygon) {
    expect(p.y).toBeGreaterThanOrEqual(0.015 - 1e-6);
    expect(p.z).toBeGreaterThanOrEqual(-2.72 - 1e-6);
    expect(p.x).toBeGreaterThanOrEqual(-4.12 - 1e-6);
    expect(p.x).toBeLessThanOrEqual(4.22 + 1e-6);
  }
});

it("builds depth samples from the first visible surface, respecting sensor range", async () => {
  const THREE = await import("three");
  const { depthSample, createDepthCloud } = await import("../src/room-depth");
  const camera = new THREE.PerspectiveCamera(55, 1.5, 0.1, 5);
  camera.position.set(0, 0, 3);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial(),
  );
  back.updateMatrixWorld(true);
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial(),
  );
  front.position.z = 1;
  front.updateMatrixWorld(true);
  const sample = depthSample(camera, [back, front], 0, 0);
  expect(sample.depth).toBeCloseTo(2);
  expect(sample.point.z).toBeCloseTo(1);
  const result = await createDepthCloud(camera, [back, front], {
    width: 8,
    height: 4,
  });
  expect(result.cloud.geometry.attributes.position.count).toBe(32);
  const positions = result.cloud.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++)
    expect(positions.getZ(i)).toBeCloseTo(1);
  result.update(1);
  expect(result.cloud.visible).toBe(true);
  result.update(0);
  expect(result.cloud.visible).toBe(false);
  back.position.z = -10;
  back.updateMatrixWorld(true);
  expect(depthSample(camera, [back], 0, 0)).toBeNull();
  result.cloud.geometry.dispose();
  result.cloud.material.dispose();
});

it("matches the Android depth LUT with a fixed five-metre range", async () => {
  const { depthPalette, DEPTH_LUT } = await import("../src/depth-palette");
  for (const invalid of [0, -1, NaN, Infinity])
    expect(depthPalette(invalid)).toEqual([0, 0, 0]);
  expect(depthPalette(1)).toEqual([255, 0, 0]);
  expect(depthPalette(5000)).toEqual([0, 0, 255]);
  expect(depthPalette(9000)).toEqual([0, 0, 255]);
  expect(depthPalette(1250)).toEqual(DEPTH_LUT[63]);
  expect(depthPalette(2500)).toEqual(DEPTH_LUT[127]);
  expect(depthPalette(3750)).toEqual(DEPTH_LUT[191]);
  const yellow = depthPalette(1250),
    green = depthPalette(2500),
    cyan = depthPalette(3750);
  expect(yellow[0]).toBe(255);
  expect(yellow[1]).toBeGreaterThan(250);
  expect(yellow[2]).toBe(0);
  expect(green[1]).toBe(255);
  expect(green[0]).toBeLessThan(3);
  expect(green[2]).toBe(0);
  expect(cyan[0]).toBe(0);
  expect(cyan[1]).toBe(255);
  expect(cyan[2]).toBeGreaterThan(250);
});

it("blends room materials in place and restores the original white model", async () => {
  const THREE = await import("three");
  const { createSurfaceLibrary, surfaceFor } =
    await import("../src/room-surface");
  const library = createSurfaceLibrary();
  const wood = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.8,
  });
  const original = wood.color.clone();
  library.prepare(wood, "Dining_tabletop");
  const map = wood.map;
  expect(map).toBeTruthy();
  const shader = { uniforms: {}, fragmentShader: "#include <map_fragment>" };
  wood.onBeforeCompile(shader);
  expect(shader.fragmentShader).toContain(
    "mix(vec4(1.0), sampledDiffuseColor, skinMix)",
  );
  library.update(1);
  expect(wood.color.getHex()).toBe(surfaceFor("Dining tabletop").color);
  expect(wood.bumpScale).toBeGreaterThan(0);
  expect(shader.uniforms.skinMix.value).toBe(1);
  library.update(0);
  expect(wood.color.equals(original)).toBe(true);
  expect(wood.roughness).toBe(0.8);
  expect(wood.bumpScale).toBe(0);
  expect(shader.uniforms.skinMix.value).toBe(0);
  expect(wood.map).toBe(map);
  library.dispose();
  wood.dispose();
});

it("shows an English question, captured photo, then scene feedback", async () => {
  const { vi } = await import("vitest");
  const { act } = await import("@testing-library/react");
  const { default: RoomConversation } = await import("../src/RoomConversation");
  vi.useFakeTimers();
  try {
    const capture = vi.fn(() => "data:image/jpeg;base64,dGVzdA==");
    const view = render(
      <RoomConversation active ready capture={capture} reduce={false} />,
    );
    expect(
      screen.getByText("Hi Helios, what kind of place am I in?"),
    ).toBeInTheDocument();
    expect(capture).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(650);
    });
    expect(capture).toHaveBeenCalledTimes(1);
    expect(
      screen.getByAltText(
        "First-person camera photo of the dining table and chairs ahead",
      ),
    ).toHaveAttribute("src", "data:image/jpeg;base64,dGVzdA==");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1400);
    });
    expect(
      screen.getByText(
        "You’re in a living and dining area. A dining table and chairs are in front of you.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Replay ↻" }),
    ).not.toBeInTheDocument();
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});

it("reveals the route progressively and hides it outside the route stage", async () => {
  const { createRoomRoute } = await import("../src/room-route");
  const route = createRoomRoute();
  route.update(0);
  expect(route.mesh.visible).toBe(false);
  route.update(0.5);
  const partial = route.mesh.geometry.drawRange.count;
  expect(route.mesh.visible).toBe(true);
  expect(partial).toBeGreaterThan(0);
  route.update(1);
  expect(route.mesh.geometry.drawRange.count).toBeGreaterThan(partial);
  const points = route.mesh.geometry.attributes.position;
  expect((points.getX(0) + points.getX(1)) / 2).toBeCloseTo(2.5);
  expect((points.getZ(0) + points.getZ(1)) / 2).toBeCloseTo(2.65);
  const end = points.count - 2;
  expect((points.getX(end) + points.getX(end + 1)) / 2).toBeCloseTo(-2.9);
  route.update(1, 0);
  expect(route.mesh.visible).toBe(false);
  route.mesh.geometry.dispose();
  route.mesh.material.dispose();
});
