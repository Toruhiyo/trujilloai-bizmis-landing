"""The /v2 Setup agent, Will (the studio's 3D model, in the Bizmis shirt), standing easy
with a small ball of energy glowing between his hands, then a happy burst out of it and
back (the motion: scripts/setup-charge-clip.py), and his face goes with it: a warm
smile with his brows up while he stands; a softer smile looking down at the ball,
eyes half closed, while he gathers it; a big open smile, brows high, on the cheer;
then the stance's face again. The ball is lit (an emissive core, a soft halo and a
warm light on his hands and face), sits between his palms, pulses with the loop,
swells as he gathers, pops on the burst and forms again as his hands come home.
Transparent frames, full figure, 144 at 24 fps:

- f_0000..f_0047: the stance loop (2 s, seamless: frame 48 would be frame 0 again),
  played in real time whenever the scroll rests, and scrubbed before the burst;
- f_0048..f_0143: the burst (4 s), leaving the loop on its frame 0 and landing back
  on it (the loop's motion goes on under it, two whole loops), scrubbed by the scroll.

  python3 scripts/setup-charge-clip.py --out <dir>/setup-charge.glb
  /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/setup-charge-anim.py -- \\
      --clip <dir>/setup-charge.glb --out <frames dir> [--start 0 --end 143 --frames 0,60 --w 720 --h 1200 --samples 32]
  ... --check   (no render: every frame, are his hands or forearms inside his torso or legs?)

Encode with scripts/encode-setup-charge.sh. The clip goes on the model with the
pipeline's own importer (transform_avatar.import_animations), as the shared clips
do; the face and the ball are keyed from the weights the clip script writes beside
the GLB (setup-charge.json), so they share its timeline. Will has no brow shape key:
one is authored here on the eyebrow mesh (inner ends up and the brows raised, a
happy, open look). Renders one frame at a time and skips frames already on disk, so
a Metal crash only costs a re-run.
"""
import argparse
import importlib.util
import json
import math
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT.parent / "trujilloai-bizmis-studio"
spec = importlib.util.spec_from_file_location("clay_scene", ROOT / "scripts/clay-scene.py")
cs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cs)
rsc = cs.rsc
sys.path.insert(0, str(STUDIO / "avatar-pipeline"))
import transform_avatar  # noqa: E402

FPS = 24
LOOP = 48          # frames of the stance loop
LENGTH = 144       # the loop, then the burst (two loops long)
B0 = LOOP          # the burst's first frame


def find(suffix, keys=True):
    return [o for o in bpy.data.objects if o.type == "MESH" and o.name.endswith(suffix)
            and (not keys or o.data.shape_keys)]


def build_timeline(arm):
    ad = arm.animation_data
    clip = next(a for a in bpy.data.actions if a.name == "setup_charge")
    ad.action = None
    ad.use_nla = True
    for t in ad.nla_tracks:
        t.mute = True
    top = ad.nla_tracks.new()
    top.name = "setup_charge"
    c = top.strips.new("setup_charge", 0, clip)
    c.blend_type = "REPLACE"
    c.extrapolation = "HOLD"


def happy_brows():
    """Author a 'happy' shape key on the eyebrows: raised, the outer ends a touch higher (inner
    ends up would read as worried)."""
    for o in find("HEAD_Eyebrows", keys=False):
        if not o.data.shape_keys:
            o.shape_key_add(name="Basis")
        key = o.shape_key_add(name="happy", from_mix=False)
        xs = [v.co.x for v in o.data.vertices]
        mid = (min(xs) + max(xs)) / 2
        for side in (-1, 1):
            idx = [i for i, v in enumerate(o.data.vertices) if (v.co.x - mid) * side > 0]
            bcx = sum(o.data.vertices[i].co.x for i in idx) / len(idx)
            inner = -side  # toward the middle of the face
            for i in idx:
                co = key.data[i].co
                co.z += 0.9 - 0.12 * (co.x - bcx) * inner


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def face_at(fr, w):
    """The face's shape-key values on frame `fr`, from the clip's weights `w` (keyed on every frame)."""
    stance = {"smile": 0.75, "F": 0.0, "blink": 0.0, "happy": 0.35}
    gather = {"smile": 0.55, "F": 0.0, "blink": 0.5, "happy": 0.55}   # looking down at the ball
    cheer = {"smile": 1.0, "F": 0.55, "blink": 0.0, "happy": 0.8}     # a big open smile
    g = smooth(w["gather"] / 0.8)
    c = smooth(w["cheer"] / 0.85)
    g *= 1 - c
    out = {k: stance[k] * (1 - g - c) + gather[k] * g + cheer[k] * c for k in stance}
    # a soft blink once a loop, on top of whatever the eyes are doing
    ph = fr % LOOP
    b = max(0.0, 1 - abs(ph - 35.5) / 2.5)
    out["blink"] = max(out["blink"], 0.85 * smooth(b))
    return out


def key_face(weights):
    heads = find("HEAD_Head") + find("HEAD_Mouth") + find("HEAD_Teeth")
    eyes = find("HEAD_Eyes")
    brows = find("HEAD_Eyebrows")

    def setk(objs, name, frame, value):
        for o in objs:
            kb = o.data.shape_keys.key_blocks.get(name)
            if kb:
                kb.value = value
                kb.keyframe_insert("value", frame=frame)

    for fr, w in enumerate(weights):
        v = face_at(fr, w)
        for n in ("smile", "F"):
            setk(heads, n, fr, v[n])
        for n in ("sad", "A", "B", "C", "D", "E", "G", "H", "X", "neutral"):
            setk(heads, n, fr, 0.0)
        setk(eyes, "eyeBlinkLeft", fr, v["blink"])
        setk(eyes, "eyeBlinkRight", fr, v["blink"])
        setk(brows, "happy", fr, v["happy"])


def emission(name, hex_color, strength, soft=False):
    """An emissive material; soft: a halo that fades out toward its rim (and lets the page through)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*cs.hex_lin(hex_color), 1)
    em.inputs["Strength"].default_value = strength
    if not soft:
        nt.links.new(em.outputs[0], out.inputs[0])
        return m
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.5
    ramp = nt.nodes.new("ShaderNodeMath")
    ramp.operation = "POWER"
    nt.links.new(lw.outputs["Facing"], ramp.inputs[0])
    ramp.inputs[1].default_value = 0.6
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(ramp.outputs[0], mix.inputs[0])  # facing 0 (the middle) shows the glow, the rim fades out
    nt.links.new(em.outputs[0], mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m


def energy_ball(arm, weights):
    """The ball between his palms: an emissive core, a soft halo and a warm light, keyed on
    every frame at the middle of his two palms, sized by the clip's 'ball' weight (0: gone)."""
    sc = bpy.context.scene
    core = cs.ball("energy_core", 1.0, (0, 0, 0), emission("energy_core", "#FFE7C9", 4.5, soft=True))
    halo = cs.ball("energy_halo", 1.0, (0, 0, 0), emission("energy_halo", "#F9A353", 2.2, soft=True))
    for o in (core, halo):
        o.visible_shadow = False
    halo.visible_diffuse = False
    light = bpy.data.lights.new("energy_light", "POINT")
    light.color = (1.0, 0.72, 0.42)
    light.shadow_soft_size = 0.05
    lamp = bpy.data.objects.new("energy_light", light)
    sc.collection.objects.link(lamp)

    def palm(side):
        bones = arm.pose.bones
        pb = lambda n: arm.matrix_world @ next(bones[k] for k in ("mixamorig:" + n, "mixamorig" + n, n) if k in bones).head
        return pb(side + "Hand").lerp(pb(side + "HandMiddle1"), 0.6)

    sc.frame_set(0)
    bpy.context.view_layer.update()
    # its size at rest: the room between the palms (less the hands' own thickness and a gap)
    r0 = (palm("Left") - palm("Right")).length / 2 - 0.085
    for fr, w in enumerate(weights):
        sc.frame_set(fr)
        at = (palm("Left") + palm("Right")) / 2
        r = max(0.0, r0 * w["ball"])
        for o, k in ((core, 0.72), (halo, 1.0)):
            o.location = at
            o.scale = (r * k + 1e-4,) * 3
            o.keyframe_insert("location", frame=fr)
            o.keyframe_insert("scale", frame=fr)
        lamp.location = at
        lamp.keyframe_insert("location", frame=fr)
        light.energy = 6.0 * min(1.6, w["ball"])
        light.keyframe_insert("energy", frame=fr)


def recentre(holder):
    """Centre the stance (on the loop's first frame) in the frame, side to side."""
    bpy.context.scene.frame_set(0)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    xs = []
    for o in bpy.data.objects:
        if o.type == "MESH" and not o.hide_render and o.name.startswith("done_"):
            e = o.evaluated_get(dg)
            me = e.to_mesh()
            xs += [(o.matrix_world @ v.co).x for v in me.vertices]
            e.to_mesh_clear()
    if xs:
        holder.location.x -= (min(xs) + max(xs)) / 2


def dominant(o):
    """Each vertex's most-weighted bone (vertex group) name."""
    names = [g.name for g in o.vertex_groups]
    return [names[max(v.groups, key=lambda g: g.weight).group] if len(v.groups) else "" for v in o.data.vertices]


def check_clipping(frames):
    """Every frame: how deep any hand or forearm vertex sits inside the torso (the shirt
    without its sleeves) or the legs (the pants). Prints the worst per frame, in cm of
    the 2 m figure, and returns the worst overall (0 = nothing inside)."""
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    sc = bpy.context.scene
    top = find("UPPERBODY_Top", keys=False)[0]
    pants = find("LOWERBODY_Pants", keys=False)[0]
    skin = find("UPPERBODY_Upperbody", keys=False)[0]
    arm_bone = lambda n: any(k in n for k in ("Arm", "Hand"))
    d_top, d_skin = dominant(top), dominant(skin)
    body_faces = [(top, [list(p.vertices) for p in top.data.polygons
                         if not any(arm_bone(d_top[i]) for i in p.vertices)]),
                  (pants, [list(p.vertices) for p in pants.data.polygons])]
    probe = [i for i, n in enumerate(d_skin) if "Hand" in n or "ForeArm" in n]
    worst_all = 0.0
    for fr in frames:
        sc.frame_set(fr)
        dg = bpy.context.evaluated_depsgraph_get()
        verts, faces = [], []
        for o, polys in body_faces:
            e = o.evaluated_get(dg)
            me = e.to_mesh()
            base = len(verts)
            verts += [o.matrix_world @ v.co for v in me.vertices]
            faces += [[base + i for i in p] for p in polys]
            e.to_mesh_clear()
        bvh = BVHTree.FromPolygons(verts, faces)
        e = skin.evaluated_get(dg)
        me = e.to_mesh()
        pts = [skin.matrix_world @ me.vertices[i].co for i in probe]
        e.to_mesh_clear()
        worst, who, at, clear = 0.0, "", None, 9.0
        for i, p in zip(probe, pts):
            loc, _, _, dist = bvh.find_nearest(p)
            if loc is None:
                continue
            # inside the body: the cloth is a thick shell (outer and inner walls), so inside the cloth or
            # the hollow behind it, a ray toward the camera and one away from it both meet a wall
            inside = all(bvh.ray_cast(p, d)[0] is not None for d in (Vector((0, -1, 0)), Vector((0, 1, 0))))
            if inside and dist > worst:
                worst, who, at = dist, d_skin[i], tuple(round(c, 3) for c in p)
            clear = min(clear, -dist if inside else dist)
        worst_all = max(worst_all, worst)
        print(f"CHECK f{fr:04d} inside {100 * worst:5.2f} cm {who:28s} clearance {100 * clear:6.2f} cm {at or ''}")
    print(f"CHECK worst {100 * worst_all:.2f} cm")
    return worst_all


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--clip", required=True, help="scripts/setup-charge-clip.py's GLB")
    ap.add_argument("--frames", default="", help="only these frames (comma separated), for a quick look")
    ap.add_argument("--model", default="will")
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--end", type=int, default=LENGTH - 1)
    ap.add_argument("--w", type=int, default=720)
    ap.add_argument("--h", type=int, default=1200)
    ap.add_argument("--samples", type=int, default=32)
    ap.add_argument("--yaw", type=float, default=0.0, help="turn him (degrees), to look at a pose from the side")
    ap.add_argument("--check", action="store_true", help="no render: report hands inside the body, every frame")
    a = ap.parse_args(argv)

    rsc._clear_scene()
    sc = bpy.context.scene
    sc.render.fps = FPS
    cs.world("#f2d2b4", 0.35)
    # the Bizmis orange shirt (the landing's --primary) with the Bizmis logo
    holder, H = cs.avatar(a.model, (0, 0, 0), height=2.0, shirt="#F9A353", expression="smile", progress=0.0)
    arm = next(o for o in bpy.data.objects if o.type == "ARMATURE" and o.animation_data and o.animation_data.nla_tracks)
    transform_avatar.import_animations(arm, a.clip)
    build_timeline(arm)
    weights = json.loads(Path(a.clip).with_suffix(".json").read_text())["frames"]
    happy_brows()
    key_face(weights)
    recentre(holder)
    holder.rotation_euler.z = math.radians(a.yaw)
    if a.check:
        frames = [int(x) for x in a.frames.split(",") if x] or range(a.start, a.end + 1)
        check_clipping(frames)
        return
    energy_ball(arm, weights)

    focus = cs.focus_at((0, 0, H * 0.55))
    cs.area("key", 260, 4.0, (1.0, 0.96, 0.9), (-1.6, -2.6, 4.6), focus)
    cs.area("fill", 120, 4.0, (1.0, 0.93, 0.86), (2.6, -2.8, 1.6), focus)
    cs.area("rim", 260, 1.6, (1.0, 0.78, 0.55), (1.8, 2.4, 3.0), focus)
    for name in ("FillLight", "RimLight", "fill", "rim"):
        o = bpy.data.objects.get(name)
        if o is not None:
            o.data.use_shadow = False
    # the whole figure, framed like the static setup render (720 x 1199)
    cs.camera((0, -3.6, H * 0.52), (0, 0, H * 0.5), lens=50)

    sc.render.engine = "CYCLES"
    sc.cycles.samples = a.samples
    sc.cycles.use_denoising = True
    try:
        sc.cycles.device = "GPU"
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
    except Exception:
        pass
    sc.render.resolution_x = a.w
    sc.render.resolution_y = a.h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    # one frame at a time, skipping frames already on disk: a Metal crash only costs a re-run
    frames = [int(x) for x in a.frames.split(",") if x] or range(a.start, a.end + 1)
    for fr in frames:
        path = out / f"f_{fr:04d}.png"
        if path.exists():
            continue
        sc.frame_set(fr)
        sc.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)


main()
