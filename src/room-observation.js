import * as THREE from "three";

// Samples actual mesh surfaces, then checks both the camera frustum and first-hit occlusion.
export function canSeeTarget(target, camera, occluders) {
  camera.updateMatrixWorld(true);
  const frustum = new THREE.Frustum().setFromProjectionMatrix(
    new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    ),
  );
  const origin = camera.getWorldPosition(new THREE.Vector3());
  const ray = new THREE.Raycaster();
  const members = new Set(target.meshes);
  for (const mesh of target.meshes) {
    const vertices = mesh.geometry.attributes.position;
    if (!vertices) continue;
    const stride = Math.max(1, Math.floor(vertices.count / 32));
    for (let i = 0; i < vertices.count; i += stride) {
      const point = new THREE.Vector3()
        .fromBufferAttribute(vertices, i)
        .applyMatrix4(mesh.matrixWorld);
      if (!frustum.containsPoint(point)) continue;
      const delta = point.clone().sub(origin),
        distance = delta.length();
      ray.set(origin, delta.normalize());
      ray.far = distance + 0.03;
      const hit = ray.intersectObjects(occluders, false)[0];
      if (hit && members.has(hit.object)) return true;
    }
  }
  return false;
}
export function diningTargets(model) {
  model.updateMatrixWorld(true);
  const nodes = model.children;
  const name = (o) => o.name.replaceAll("_", " ");
  const seats = nodes.filter((o) => name(o).startsWith("Dining seat"));
  const targets = seats.map((seat, i) => ({
    label: "Chair",
    id: `chair-${i}`,
    nodes: [seat],
    center: new THREE.Box3().setFromObject(seat).getCenter(new THREE.Vector3()),
  }));
  const table = { label: "Table", id: "table", nodes: [] };
  for (const node of nodes) {
    const n = name(node);
    if (n.startsWith("Dining table")) table.nodes.push(node);
    if (n.startsWith("Dining chair")) {
      const center = new THREE.Box3()
        .setFromObject(node)
        .getCenter(new THREE.Vector3());
      const closest = targets.toSorted(
        (a, b) =>
          a.center.distanceToSquared(center) -
          b.center.distanceToSquared(center),
      )[0];
      closest?.nodes.push(node);
    }
  }
  return [table, ...targets]
    .filter((t) => t.nodes.length)
    .map((t) => {
      const meshes = [];
      const box = new THREE.Box3();
      for (const node of t.nodes) {
        box.expandByObject(node);
        node.traverse((m) => {
          if (m.isMesh) meshes.push(m);
        });
      }
      return { ...t, meshes, box };
    });
}
// Clip the view volume against the room interior, rather than merely hiding it in depth.
export function clipViewPolygon(polygon) {
  const planes = [
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.015),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 2.72),
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 4.12),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 4.22),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 2.82),
  ];
  let output = polygon;
  for (const plane of planes) {
    const input = output;
    output = [];
    for (let i = 0; i < input.length; i++) {
      const a = input[i],
        b = input[(i + 1) % input.length];
      const da = plane.distanceToPoint(a),
        db = plane.distanceToPoint(b);
      if (da >= 0) output.push(a);
      if (da >= 0 !== db >= 0) output.push(a.clone().lerp(b, da / (da - db)));
    }
  }
  return output;
}
export function createObservation(scene, model, host, viewCamera) {
  const group = new THREE.Group();
  group.name = "Camera observation";
  scene.add(group);
  const person = new THREE.Group();
  group.add(person);
  person.name = "Wearer facing dining area";
  person.position.set(0.15, 0, 1.65);
  person.rotation.y = Math.atan2(2.4 - 0.15, -0.3 - 1.65);
  const white = new THREE.MeshStandardMaterial({
    color: 0xe0e4e2,
    roughness: 0.85,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x172027,
    roughness: 0.5,
  });
  const personMaterials = [];
  function part(geometry, material, position, scale, tint) {
    if (material === white) {
      material = white.clone();
      const y = position[1];
      const box = geometry.type === "BoxGeometry";
      const color =
        tint ??
        (y >= 1.5
          ? box
            ? 0x18232b
            : 0xbd8e70
          : y > 1.4
            ? 0xbd8e70
            : y < 0.2
              ? 0x37403e
              : y < 0.65
                ? 0x45546a
                : y < 0.8
                  ? 0xbd8e70
                  : y < 0.95
                    ? 0x26343d
                    : y < 1.2
                      ? 0xb2bfb4
                      : 0x303d40);
      personMaterials.push({
        material,
        base: white.color.clone(),
        target: new THREE.Color(color),
      });
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true;
    person.add(mesh);
    return mesh;
  }
  // Neutral clothed mannequin with sunglasses; compact camera on a support below it.
  part(
    new THREE.CapsuleGeometry(0.16, 0.4, 6, 12),
    white,
    [0, 1.08, 0],
    [1.15, 1, 0.7],
  );
  part(
    new THREE.SphereGeometry(0.13, 20, 12),
    white,
    [0, 1.62, 0],
    [0.85, 1.2, 0.95],
  );
  part(new THREE.CylinderGeometry(0.055, 0.065, 0.12, 12), white, [0, 1.43, 0]);
  for (const side of [-1, 1]) {
    part(new THREE.CapsuleGeometry(0.065, 0.61, 4, 10), white, [
      side * 0.095,
      0.45,
      0,
    ]);
    const arm = part(new THREE.CapsuleGeometry(0.05, 0.46, 4, 10), white, [
      side * 0.235,
      1.03,
      0,
    ]);
    arm.rotation.z = side * 0.12;
    part(new THREE.SphereGeometry(0.052, 12, 8), white, [side * 0.27, 0.75, 0]);
    part(new THREE.BoxGeometry(0.13, 0.08, 0.24), white, [
      side * 0.095,
      0.055,
      0.045,
    ]);
    part(new THREE.BoxGeometry(0.085, 0.043, 0.022), white, [
      side * 0.049,
      1.65,
      0.115,
    ]);
  }
  part(new THREE.BoxGeometry(0.04, 0.014, 0.023), white, [0, 1.65, 0.12]);
  part(
    new THREE.TorusGeometry(0.11, 0.015, 8, 24, Math.PI),
    white,
    [0, 1.34, 0.06],
  ).rotation.x = Math.PI / 2;
  part(new THREE.BoxGeometry(0.085, 0.024, 0.045), dark, [0, 1.255, 0.158]);
  part(new THREE.BoxGeometry(0.1, 0.035, 0.026), dark, [0, 1.285, 0.18]);
  for (const x of [-0.032, 0.032])
    part(
      new THREE.SphereGeometry(0.009, 12, 8),
      dark,
      [x, 1.285, 0.196],
      [1, 1, 0.3],
    );
  part(new THREE.BoxGeometry(0.065, 0.13, 0.02), white, [0.17, 0.88, 0.1]);
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 1.28, 0.18),
    new THREE.Vector3(0.18, 1.19, 0.16),
    new THREE.Vector3(0.2, 1.01, 0.12),
    new THREE.Vector3(0.17, 0.94, 0.11),
  ]);
  part(
    new THREE.TubeGeometry(cable, 24, 0.003, 5, false),
    white,
    [0, 0, 0],
    undefined,
    0x303d40,
  );
  const hair = part(
    new THREE.SphereGeometry(0.132, 20, 12, 0, Math.PI * 2, 0, 1.15),
    white,
    [0, 1.62, -0.005],
    [0.86, 1.21, 0.96],
    0x352b26,
  );
  hair.name = "Hair";
  const sensing = new THREE.Group();
  sensing.name = "Observation overlays";
  group.add(sensing);
  scene.updateMatrixWorld(true);
  const origin = person.localToWorld(new THREE.Vector3(0, 1.285, 0.2));
  const sensor = new THREE.PerspectiveCamera(55, 1.5, 0.08, 4.7);
  sensor.position.copy(origin);
  sensor.lookAt(2.4, 0.72, -0.3);
  sensor.updateMatrixWorld(true);
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, y]) => new THREE.Vector3(x, y, 1).unproject(sensor));
  const lines = [];
  const faces = [];
  for (let i = 0; i < 4; i++) {
    const polygon = clipViewPolygon([origin, corners[i], corners[(i + 1) % 4]]);
    for (let j = 0; j < polygon.length; j++)
      lines.push(...polygon[j], ...polygon[(j + 1) % polygon.length]);
    for (let j = 1; j < polygon.length - 1; j++)
      faces.push(...polygon[0], ...polygon[j], ...polygon[j + 1]);
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  sensing.add(
    new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0x2e79c5,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      }),
    ),
  );
  const faceGeo = new THREE.BufferGeometry();
  faceGeo.setAttribute("position", new THREE.Float32BufferAttribute(faces, 3));
  sensing.add(
    new THREE.Mesh(
      faceGeo,
      new THREE.MeshBasicMaterial({
        color: 0x2e79c5,
        transparent: true,
        opacity: 0.035,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  const targets = diningTargets(model);
  const occluders = [];
  model.traverse((m) => {
    if (!m.isMesh) return;
    for (let ancestor = m; ancestor; ancestor = ancestor.parent) {
      if (!ancestor.visible || /route/i.test(ancestor.name)) return;
    }
    occluders.push(m);
  });
  const overlays = [];
  for (const target of targets) {
    const helper = new THREE.Box3Helper(target.box, 0x2e79c5);
    helper.material.transparent = true;
    helper.material.opacity = 0.85;
    sensing.add(helper);
    const label = document.createElement("span");
    label.className = "room-detection-label";
    label.textContent = target.label;
    host.appendChild(label);
    overlays.push({
      target,
      helper,
      label,
      visible: canSeeTarget(target, sensor, occluders),
    });
  }
  function labelAt(element, point) {
    const p = point.clone().project(viewCamera);
    element.style.left = `${(p.x * 0.5 + 0.5) * 100}%`;
    element.style.top = `${(-p.y * 0.5 + 0.5) * 100}%`;
  }
  function update(amount, depth = false, { restore = false, skin = 0 } = {}) {
    group.visible = amount > 0 || restore;
    sensing.visible = !restore;
    for (const entry of personMaterials)
      entry.material.color.copy(entry.base).lerp(entry.target, skin);
    for (const { target, helper, label, visible } of overlays) {
      const show = amount > 0.55 && visible && !depth && !restore;
      helper.visible = show;
      label.hidden = !show;
      labelAt(
        label,
        new THREE.Vector3(
          target.box.getCenter(new THREE.Vector3()).x,
          target.box.max.y + 0.08,
          target.box.getCenter(new THREE.Vector3()).z,
        ),
      );
    }
  }
  return {
    update,
    dispose() {
      for (const o of overlays) o.label.remove();
    },
    targets,
    sensor,
    mouth: person.localToWorld(new THREE.Vector3(0, 1.57, 0.13)),
    occluders,
  };
}
