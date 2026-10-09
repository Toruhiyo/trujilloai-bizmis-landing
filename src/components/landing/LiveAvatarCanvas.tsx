import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

/**
 * The 3D half of LiveAvatar. Lives in its own lazy chunk (three, fiber and
 * drei only load when the avatar is about to be seen). Mirrors the real
 * storefront widget (trujilloai-bizmis-widget, Chibi3dAvatar + LightingRig):
 * same CDN models and shared animation clips, same 0.3 scale and lens, the
 * "lineup 14" flat-vivid light rig, the shirt recolour + logo stamp painted on
 * a canvas texture, random visemes while speaking and random blinks. The lower
 * body is hidden exactly like the widget's HEAD + UPPERBODY card.
 */

// Chibi3dAvatar constants.
const AVATAR_SCALE = 0.3;
const AVATAR_Y_POSITION = -0.5;
/** The widget's HEAD,UPPERBODY camera lens (fov 10° at ~10 units): near-orthographic. */
const CAMERA_FOV = 10;
const ANIMATION_FADE_DURATION = 0.5;
const MOUTH_SHAPE_CHANGE_MIN_S = 0.15;
const MOUTH_SHAPE_CHANGE_RANDOM_S = 0.1;
const BLINK_DURATION_MS = 200;
const BLINK_MIN_INTERVAL_MS = 1000;
const BLINK_MAX_INTERVAL_MS = 5000;
const MORPH_TARGET_LERP_SPEED = 0.1;
const MORPH_TARGET_LERP_SPEED_FAST = 0.2;
const MORPH_TARGET_LERP_SPEED_MEDIUM = 0.15;
const BLINK_LERP_SPEED = 0.5;
const STAMP_CANVAS_SIZE = 512;
const STAMP_FRACTION = 0.45;

const VISIBLE_BODY_GROUPS = ["HEAD_", "UPPERBODY_"];
const BODY_GROUPS = [...VISIBLE_BODY_GROUPS, "LOWERBODY_"];
const VISEMES = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];
const MOUTH_SHAPES = ["A", "E", "B", "F", "C", "D", "G", "H"];
const EXPRESSIONS: Record<AvatarExpression, Record<string, number>> = {
  default: {},
  smile: { smile: 1 },
};

/**
 * DEFAULT_AVATAR_LIGHTING ("lineup 14, flat vivid") from the widget's
 * src/utils/avatarLighting.ts: Khronos PBR Neutral tone mapping, near-uniform
 * ambient + hemisphere light, a faint camera-axis key and rim, a dim
 * RoomEnvironment. Keep in sync with the widget if its default rig changes.
 */
const LIGHTING = {
  exposure: 0.54,
  ambient: { intensity: 4, color: "#ffffff" },
  hemi: { intensity: 0.4, sky: "#fff4e8", ground: "#ffeedd" },
  key: { intensity: 0.15, color: "#fffaf2", position: [0, 1.5, 10] as [number, number, number] },
  rim: { intensity: 0.08, color: "#ffffff", position: [1.4, 3.2, -6] as [number, number, number] },
  env: { intensity: 0.1 },
  material: { hairSpecular: 1.3 },
};

export type AvatarExpression = "default" | "smile";

export type LiveAvatarCanvasProps = {
  modelUrl: string;
  animationsUrl: string;
  shirtColor: string;
  /** Logo painted on the chest (white wordmark PNG); null for a plain shirt. */
  stampUrl: string | null;
  stampScale: number;
  /** Vertical stamp offset, fraction of the texture (positive = up), as in the widget. */
  stampOffsetY: number;
  speaking: boolean;
  expression: AvatarExpression;
  /** Render loop on/off (offscreen or hidden tab = off). */
  active: boolean;
  /** How far the canvas bleeds above the box, as a fraction of the box height. */
  overscanTop: number;
  /** Height of the waist-up figure as a fraction of the box height. */
  figureFraction: number;
  onReady: () => void;
  onError: (error: Error) => void;
};

const isShirtMeshName = (name: string) =>
  name === "UPPERBODY_Top" || name.startsWith("UPPERBODY_Top_") || name.startsWith("UPPERBODY_Shirt");
const isHairMeshName = (name: string) => name.includes("Hair");

const findClip = (names: string[], exact: string, loose: RegExp) =>
  names.find((n) => n === exact) ?? names.find((n) => loose.test(n));

/** Bounds of what is actually drawn (skinned + posed), in world space. */
function measureVisible(root: THREE.Object3D): THREE.Box3 {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  root.traverseVisible((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const position = mesh.geometry.attributes.position;
    if (!position) return;
    for (let i = 0; i < position.count; i++) {
      mesh.getVertexPosition(i, v);
      v.applyMatrix4(mesh.matrixWorld);
      box.expandByPoint(v);
    }
  });
  return box;
}

/** The widget's LightingRig with its default config inlined. */
const LightingRig = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useLayoutEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = LIGHTING.exposure;
    gl.shadowMap.enabled = false;
  }, [gl]);

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const environment = new RoomEnvironment();
    const texture = pmrem.fromScene(environment, 0.04).texture;
    environment.dispose();
    pmrem.dispose();
    scene.environment = texture;
    // Same guard as the widget: three r162 has no Scene.environmentIntensity,
    // so the widget's env renders at full strength there; mirroring the guard
    // keeps the two looking identical on any three version.
    if ("environmentIntensity" in scene) {
      (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = LIGHTING.env.intensity;
    }
    return () => {
      scene.environment = null;
      texture.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      <ambientLight intensity={LIGHTING.ambient.intensity} color={LIGHTING.ambient.color} />
      <hemisphereLight intensity={LIGHTING.hemi.intensity} color={LIGHTING.hemi.sky} groundColor={LIGHTING.hemi.ground} />
      <directionalLight intensity={LIGHTING.key.intensity} color={LIGHTING.key.color} position={LIGHTING.key.position} />
      <directionalLight intensity={LIGHTING.rim.intensity} color={LIGHTING.rim.color} position={LIGHTING.rim.position} />
    </>
  );
};

type AvatarProps = Omit<LiveAvatarCanvasProps, "active" | "onError">;

const Avatar = ({
  modelUrl,
  animationsUrl,
  shirtColor,
  stampUrl,
  stampScale,
  stampOffsetY,
  speaking,
  expression,
  overscanTop,
  figureFraction,
  onReady,
}: AvatarProps) => {
  const group = useRef<THREE.Group>(null);
  // Models ship meshopt-compressed (EXT_meshopt_compression), never Draco.
  const { scene: cached } = useGLTF(modelUrl, false, true);
  // Own copy per mount (geometry shared): a cached scene can only sit in one
  // canvas, and the shirt material is recoloured per instance.
  const scene = useMemo(() => {
    const copy = cloneSkinned(cached);
    copy.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && isShirtMeshName(child.name) && !Array.isArray(mesh.material)) mesh.material = mesh.material.clone();
    });
    return copy;
  }, [cached]);
  const { animations } = useGLTF(animationsUrl, false, true);
  const clips = useMemo(() => animations.filter((clip) => clip && clip.tracks.length > 0), [animations]);
  const { actions, mixer, names } = useAnimations(clips, group);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  const idleName = findClip(names, "idle_neutral", /idle/i);
  const talkName = findClip(names, "exaggerated_talking", /talk/i);
  const waveName = findClip(names, "waving", /wav/i);

  /** Waist-up band of the idle pose, in world units: drives the framing. */
  const [band, setBand] = useState<{ bottom: number; height: number; x: number } | null>(null);
  const [greeting, setGreeting] = useState(Boolean(waveName));
  const current = useRef<THREE.AnimationAction | null>(null);
  const stampDone = useRef(!stampUrl);
  const readySent = useRef(false);
  const frames = useRef(0);
  const blink = useRef(false);
  const mouth = useRef("X");
  const nextMouthAt = useRef(0);

  const morphMeshes = useMemo(() => {
    const list: THREE.Mesh[] = [];
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) list.push(mesh);
    });
    return list;
  }, [scene]);

  // Body groups: head + upper body, like the widget card.
  useLayoutEffect(() => {
    scene.traverse((child) => {
      const name = child.name.toUpperCase();
      if (BODY_GROUPS.some((g) => name.startsWith(g))) {
        child.visible = VISIBLE_BODY_GROUPS.some((g) => name.startsWith(g));
      }
    });
  }, [scene]);

  // Material lighting (widget: hairSpecular; shirt/skin multipliers are 1).
  useLayoutEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !isHairMeshName(child.name)) return;
      const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[];
      for (const material of materials) {
        if (!material || typeof material.roughness !== "number") continue;
        if (!material.userData.bizmisLightingBase) {
          material.userData.bizmisLightingBase = { roughness: material.roughness, envMapIntensity: material.envMapIntensity ?? 1 };
        }
        const base = material.userData.bizmisLightingBase as { roughness: number; envMapIntensity: number };
        material.roughness = THREE.MathUtils.clamp(base.roughness / LIGHTING.material.hairSpecular, 0.04, 1);
        material.envMapIntensity = base.envMapIntensity * LIGHTING.material.hairSpecular;
        material.needsUpdate = true;
      }
    });
  }, [scene]);

  // Shirt colour + logo stamp (the widget's canvas-texture stamp).
  useEffect(() => {
    let shirt: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (!shirt && (child as THREE.Mesh).isMesh && isShirtMeshName(child.name)) shirt = child as THREE.Mesh;
    });
    const material = (shirt as THREE.Mesh | null)?.material as THREE.MeshStandardMaterial | undefined;
    if (!material) {
      stampDone.current = true;
      return;
    }
    if (!stampUrl) {
      material.map?.dispose();
      material.map = null;
      material.color.set(shirtColor);
      material.needsUpdate = true;
      stampDone.current = true;
      return;
    }
    let cancelled = false;
    const canvas = document.createElement("canvas");
    canvas.width = STAMP_CANVAS_SIZE;
    canvas.height = STAMP_CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    const paint = (drawStamp: boolean) => {
      if (cancelled || !ctx) return;
      ctx.fillStyle = shirtColor;
      ctx.fillRect(0, 0, STAMP_CANVAS_SIZE, STAMP_CANVAS_SIZE);
      if (drawStamp && img.width) {
        const w = STAMP_CANVAS_SIZE * STAMP_FRACTION * stampScale;
        const h = w * (img.height / img.width);
        ctx.drawImage(img, (STAMP_CANVAS_SIZE - w) / 2, (STAMP_CANVAS_SIZE - h) / 2 - stampOffsetY * STAMP_CANVAS_SIZE, w, h);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      material.map?.dispose();
      material.map = texture;
      material.color.set("#ffffff");
      material.needsUpdate = true;
      stampDone.current = true;
    };
    img.onload = () => paint(true);
    img.onerror = () => paint(false);
    img.src = stampUrl;
    return () => {
      cancelled = true;
    };
  }, [scene, shirtColor, stampUrl, stampScale, stampOffsetY]);

  const crossTo = (next: THREE.AnimationAction | undefined, once: boolean) => {
    if (!next) return;
    const prev = current.current;
    if (prev === next && next.isRunning()) return;
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
    next.clampWhenFinished = once;
    next.play();
    if (prev && prev !== next) next.crossFadeFrom(prev, ANIMATION_FADE_DURATION, false);
    current.current = next;
  };

  // Measure the idle pose once (it fixes the framing, so a wave or a talk
  // gesture never re-zooms), then greet with a one-shot wave.
  useEffect(() => {
    const idle = idleName ? actions[idleName] : undefined;
    if (idle) {
      idle.reset().play();
      mixer.update(0);
    }
    const box = measureVisible(scene);
    if (!box.isEmpty()) {
      setBand({ bottom: box.min.y, height: box.max.y - box.min.y, x: (box.min.x + box.max.x) / 2 });
    }
    idle?.stop();
    current.current = null;
    const wave = waveName ? actions[waveName] : undefined;
    if (wave) crossTo(wave, true);
    const onFinished = (event: { action: THREE.AnimationAction }) => {
      if (waveName && event.action === actions[waveName]) setGreeting(false);
    };
    mixer.addEventListener("finished", onFinished);
    return () => {
      mixer.removeEventListener("finished", onFinished);
      mixer.stopAllAction();
      current.current = null;
    };
  }, [scene, actions, mixer, idleName, waveName]);

  // Idle loop, or the talking loop while speaking (after the greeting).
  useEffect(() => {
    if (greeting && waveName) return;
    const name = speaking && talkName ? talkName : idleName;
    crossTo(name ? actions[name] : undefined, false);
  }, [speaking, greeting, actions, idleName, talkName, waveName]);

  // Frame the waist-up figure bottom-centre in the box, same height as the static render.
  useLayoutEffect(() => {
    if (!band || !size.height) return;
    const boxHeight = size.height / (1 + overscanTop);
    const figurePx = boxHeight * figureFraction;
    const visibleHeight = (band.height * size.height) / figurePx;
    const distance = visibleHeight / (2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)));
    camera.fov = CAMERA_FOV;
    camera.position.set(band.x, band.bottom + visibleHeight / 2, distance);
    camera.rotation.set(0, 0, 0);
    camera.near = Math.max(0.1, distance - 5);
    camera.far = distance + 5;
    camera.updateProjectionMatrix();
  }, [band, size.height, size.width, camera, overscanTop, figureFraction]);

  // Random blinks, as in the widget.
  useEffect(() => {
    let t: number;
    const schedule = () => {
      t = window.setTimeout(() => {
        blink.current = true;
        t = window.setTimeout(() => {
          blink.current = false;
          schedule();
        }, BLINK_DURATION_MS);
      }, THREE.MathUtils.randInt(BLINK_MIN_INTERVAL_MS, BLINK_MAX_INTERVAL_MS));
    };
    schedule();
    return () => window.clearTimeout(t);
  }, []);

  // GPU cleanup on unmount. The parsed GLTF stays cached for a quick remount
  // (three re-uploads disposed buffers to whichever context draws them next).
  useEffect(
    () => () => {
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[];
        for (const material of materials) {
          if (!material) continue;
          if (isShirtMeshName(child.name)) material.map?.dispose();
          material.dispose();
        }
      });
    },
    [scene]
  );

  useFrame(() => {
    const now = performance.now() / 1000;
    if (speaking) {
      if (now >= nextMouthAt.current) {
        mouth.current = MOUTH_SHAPES[Math.floor(Math.random() * MOUTH_SHAPES.length)];
        nextMouthAt.current = now + MOUTH_SHAPE_CHANGE_MIN_S + Math.random() * MOUTH_SHAPE_CHANGE_RANDOM_S;
      }
    } else {
      mouth.current = "X";
      nextMouthAt.current = 0;
    }
    const face = EXPRESSIONS[expression] ?? EXPRESSIONS.default;
    // Head, mouth and teeth carry the same targets; drive them together.
    for (const mesh of morphMeshes) {
      const dict = mesh.morphTargetDictionary!;
      const influences = mesh.morphTargetInfluences!;
      for (const key in dict) {
        const i = dict[key];
        let target: number;
        let speed = MORPH_TARGET_LERP_SPEED;
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          target = blink.current ? 1 : 0;
          speed = BLINK_LERP_SPEED;
        } else if (VISEMES.includes(key)) {
          target = speaking && key === mouth.current ? 1 : 0;
          if (speaking) speed = target ? MORPH_TARGET_LERP_SPEED_FAST : MORPH_TARGET_LERP_SPEED_MEDIUM;
        } else {
          target = face[key] ?? 0;
        }
        influences[i] = THREE.MathUtils.lerp(influences[i], target, speed);
      }
    }

    if (!readySent.current && band && stampDone.current) {
      frames.current += 1;
      // useFrame runs before the render: on the 2nd tick one framed, posed,
      // stamped frame is already on screen.
      if (frames.current >= 2) {
        readySent.current = true;
        onReady();
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} position={[0, AVATAR_Y_POSITION, 0]} scale={AVATAR_SCALE} dispose={null} />
    </group>
  );
};

const LiveAvatarCanvas = ({ active, onError, ...avatar }: LiveAvatarCanvasProps) => {
  const disposed = useRef(false);
  const glRef = useRef<HTMLCanvasElement | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Start both downloads together (the widget's BIZ-276 fix): otherwise the
  // animations only start after the model has finished.
  useGLTF.preload(avatar.modelUrl, false, true);
  useGLTF.preload(avatar.animationsUrl, false, true);

  useEffect(() => {
    disposed.current = false;
    const canvas = glRef.current;
    const onLost = (event: Event) => {
      event.preventDefault();
      if (!disposed.current) onErrorRef.current(new Error("WebGL context lost"));
    };
    canvas?.addEventListener("webglcontextlost", onLost);
    return () => {
      // R3F force-loses the context ~500 ms after unmount: not an error.
      disposed.current = true;
      canvas?.removeEventListener("webglcontextlost", onLost);
    };
  }, []);

  return (
    <Canvas
      ref={glRef}
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV, near: 0.1, far: 100, position: [0, 0, 10] }}
      resize={{ offsetSize: true, scroll: false }}
      style={{ background: "transparent", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <LightingRig />
      <Suspense fallback={null}>
        <Avatar {...avatar} />
      </Suspense>
    </Canvas>
  );
};

export default LiveAvatarCanvas;
