import * as THREE from "three";

export function surfaceFor(rawName) {
  const n = rawName.replaceAll("_", " ").toLowerCase();
  if (/foundation/.test(n))
    return { color: 0xc3a47b, texture: "wood", roughness: 0.7 };
  if (/floor joint/.test(n)) return { color: 0x967957, roughness: 0.8 };
  if (/window glazing/.test(n))
    return { color: 0xb8d5df, roughness: 0.16, metalness: 0.12 };
  if (/window recess/.test(n)) return { color: 0x64747c, roughness: 0.5 };
  if (/wall|skirting|window.*frame|window sill/.test(n))
    return { color: 0xeee9de, texture: "plaster", roughness: 0.92 };
  if (/plant leaf|vase foliage/.test(n))
    return { color: 0x47754b, roughness: 0.85 };
  if (/plant stem|vase stem/.test(n))
    return { color: 0x69704d, roughness: 0.8 };
  if (/rug/.test(n))
    return { color: 0xb9b5a7, texture: "fabric", roughness: 1 };
  if (/accent pillow/.test(n))
    return { color: 0x63837c, texture: "fabric", roughness: 1 };
  if (
    /cushion|sofa|lounge chair base|lounge chair back|dining seat/.test(n) &&
    !/foot/.test(n)
  )
    return { color: 0xd3c5ae, texture: "fabric", roughness: 0.95 };
  if (
    /coffee table|dining table|dining chair|lounge chair arm|chair leg|bookcase|sideboard|side table/.test(
      n,
    ) &&
    !/book|ceramic|artwork|pull/.test(n)
  )
    return { color: 0xb88d60, texture: "wood", roughness: 0.52 };
  if (/bookcase/.test(n))
    return { color: 0xb88d60, texture: "wood", roughness: 0.6 };
  if (/lamp stem|lamp base|sofa foot|door pull|remote/.test(n))
    return { color: 0x353b3b, roughness: 0.35, metalness: 0.65 };
  if (/lamp shade/.test(n))
    return {
      color: 0xf4e8ce,
      texture: "fabric",
      roughness: 0.9,
      emissive: 0x39220a,
    };
  if (/plant pot/.test(n))
    return { color: 0xb87f60, texture: "plaster", roughness: 0.85 };
  if (/vase|ceramic/.test(n)) return { color: 0x678c89, roughness: 0.35 };
  if (/artwork inset/.test(n))
    return { color: 0x839c99, texture: "plaster", roughness: 0.9 };
  if (/artwork/.test(n))
    return { color: 0x7c614b, texture: "wood", roughness: 0.6 };
  if (/book/.test(n))
    return { color: n.endsWith("1") ? 0x638d90 : 0xb18b68, roughness: 0.9 };
  return { color: 0xf0ebe0, roughness: 0.4 };
}
function texture(kind) {
  const size = 256,
    data = new Uint8Array(size * size * 4);
  let seed = 19;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 4294967296;
      let value;
      if (kind === "wood") {
        const grain = Math.sin(
          x * 0.6 + Math.sin(y * 0.035) * 2 + Math.sin(x * 0.04 + y * 0.015),
        );
        const seam = x % 64 === 0 || y % 128 === 0;
        value = seam ? 0.57 : 0.83 + grain * 0.085 + noise * 0.06;
      } else if (kind === "fabric")
        value = 0.86 + ((x + y) % 2) * 0.06 + noise * 0.08;
      else value = 0.94 + noise * 0.06;
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = Math.round(value * 255);
      data[i + 3] = 255;
    }
  const result = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  result.wrapS = result.wrapT = THREE.RepeatWrapping;
  result.magFilter = THREE.LinearFilter;
  result.minFilter = THREE.LinearMipmapLinearFilter;
  result.generateMipmaps = true;
  result.repeat.set(kind === "fabric" ? 5 : 2, kind === "fabric" ? 5 : 2);
  result.needsUpdate = true;
  return result;
}
export function createSurfaceLibrary() {
  const maps = {
    wood: texture("wood"),
    fabric: texture("fabric"),
    plaster: texture("plaster"),
  };
  const entries = [];
  return {
    prepare(material, name) {
      const preset = surfaceFor(name);
      const original = {
        color: material.color.clone(),
        roughness: material.roughness,
        metalness: material.metalness,
        emissive: material.emissive.clone(),
      };
      const target = new THREE.Color(preset.color),
        glow = new THREE.Color(preset.emissive || 0);
      const weight = { value: 0 };
      if (preset.texture) {
        material.map = maps[preset.texture];
        material.bumpMap = material.map;
        material.bumpScale = 0;
        material.onBeforeCompile = (shader) => {
          shader.uniforms.skinMix = weight;
          shader.fragmentShader =
            "uniform float skinMix;\n" + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <map_fragment>",
            THREE.ShaderChunk.map_fragment.replace(
              "diffuseColor *= sampledDiffuseColor;",
              "diffuseColor *= mix(vec4(1.0), sampledDiffuseColor, skinMix);",
            ),
          );
        };
        material.customProgramCacheKey = () => "helios-surface-transition-v1";
      }
      entries.push({ material, original, preset, target, glow, weight });
    },
    update(t) {
      for (const {
        material,
        original,
        preset,
        target,
        glow,
        weight,
      } of entries) {
        material.color.copy(original.color).lerp(target, t);
        material.roughness = THREE.MathUtils.lerp(
          original.roughness,
          preset.roughness,
          t,
        );
        material.metalness = THREE.MathUtils.lerp(
          original.metalness,
          preset.metalness || 0,
          t,
        );
        material.emissive.copy(original.emissive).lerp(glow, t);
        material.bumpScale = t * (preset.texture === "wood" ? 0.008 : 0.003);
        weight.value = t;
      }
    },
    dispose() {
      Object.values(maps).forEach((map) => map.dispose());
    },
  };
}
