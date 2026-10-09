"""The /v2 hero's agent, animated: a real Bizmis avatar (the studio's 3D model, in the
Bizmis shirt), waist-up as the widget's card shows it, listening, thinking while the
widget searches, talking while it recommends and giving a thumbs up as the product
goes to the cart. Transparent frames for the silent hero loop (BIZ-423).

  /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/hero-avatar-anim.py -- \
      --out tmp/hero-anim/frames [--start 0 --end 311 --w 1000 --h 1250 --samples 48]

The timeline chains the model's own clips on the NLA (idle → thinking → talking → thumbs up → idle)
with blended hand-offs, and is seamless: the last frame is the idle pose the loop starts
from. Mouth shapes (visemes A–H) are keyed while it talks; it blinks now and then. A
shadow-catcher floor keeps its contact shadow in the alpha, so it stands on whatever
stage the page draws.
"""
import argparse
import importlib.util
import math
import random
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("clay_scene", ROOT / "scripts/clay-scene.py")
cs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cs)
rsc = cs.rsc

FPS = 24
LENGTH = 336  # 14 s
TALK = (110, 244)
VISEMES = ["A", "B", "C", "D", "E", "F", "G", "H"]


def strip(track_name, ad, action, start, a0, a1, blend_in=0, blend_out=0, hold=False):
    tr = ad.nla_tracks.new()
    tr.name = track_name
    s = tr.strips.new(track_name, int(start), action)
    s.action_frame_start = a0
    s.action_frame_end = a1
    s.frame_end = start + (a1 - a0)
    s.blend_type = "REPLACE"
    s.use_auto_blend = False
    s.blend_in = blend_in
    s.blend_out = blend_out
    s.extrapolation = "HOLD" if hold else "NOTHING"
    return s


def build_timeline(arm):
    ad = arm.animation_data
    actions = {a.name: a for a in bpy.data.actions}
    ad.action = None
    ad.use_nla = True
    for t in ad.nla_tracks:
        t.mute = True
    # bottom to top: later tracks override earlier ones while their influence is up.
    # listen → think (the widget searches) → talk (it recommends) → thumbs up (added to cart) → idle
    strip("loop_idle_a", ad, actions["idle_neutral"], 0, 100, 150, hold=True)
    strip("loop_think", ad, actions["thinking"], 34, 0, 76, blend_in=12, blend_out=14)
    strip("loop_talk", ad, actions["exaggerated_talking"], 100, 30, 176, blend_in=14, blend_out=16)
    strip("loop_thumbs", ad, actions["thumbsup"], 240, 0, 86, blend_in=12, blend_out=16)
    # ends on idle frame 100, the pose frame 0 starts from: the loop has no seam
    strip("loop_idle_b", ad, actions["idle_neutral"], LENGTH - 40, 60, 100, blend_in=16)


def key_face():
    """Lip-sync while it talks, a smile otherwise, and the odd blink."""
    rng = random.Random(7)
    meshes = [bpy.data.objects.get(n) for n in ("HEAD_Head", "HEAD_Mouth", "HEAD_Teeth")]
    meshes = [m for m in meshes if m and m.data.shape_keys]
    # objects were renamed by clay_scene.avatar (done_<model>_...): find them by suffix
    if not meshes:
        meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.data.shape_keys
                  and any(o.name.endswith(n) for n in ("HEAD_Head", "HEAD_Mouth", "HEAD_Teeth"))]
    eyes = [o for o in bpy.data.objects if o.type == "MESH" and o.data.shape_keys and o.name.endswith("HEAD_Eyes")]

    def setkey(name, frame, value):
        for m in meshes:
            kb = m.data.shape_keys.key_blocks.get(name)
            if kb:
                kb.value = value
                kb.keyframe_insert("value", frame=frame)

    names = ["smile"] + VISEMES + ["X"]
    for f in (0, TALK[0] - 6):
        for n in names:
            setkey(n, f, 0.75 if n == "smile" else 0.0)
    # speech: a new mouth shape every 3–4 frames, with closed-mouth pauses between phrases
    f = TALK[0]
    while f < TALK[1]:
        pause = rng.random() < 0.12
        for n in names:
            setkey(n, f, 0.0)
        if pause:
            setkey("smile", f, 0.45)
        else:
            setkey(rng.choice(VISEMES), f, rng.uniform(0.65, 1.0))
            setkey("smile", f, 0.25)
        f += rng.choice((3, 3, 4)) * (2 if pause else 1)
    for f in (TALK[1] + 6, LENGTH):
        for n in names:
            setkey(n, f, 0.75 if n == "smile" else 0.0)
    for blink in (22, 96, 186, 276, 322):
        for fr, v in ((blink - 2, 0.0), (blink, 1.0), (blink + 3, 0.0)):
            for e in eyes:
                for side in ("eyeBlinkLeft", "eyeBlinkRight"):
                    kb = e.data.shape_keys.key_blocks.get(side)
                    if kb:
                        kb.value = v
                        kb.keyframe_insert("value", frame=fr)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="yusuke")
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--end", type=int, default=LENGTH - 1)
    ap.add_argument("--step", type=int, default=1)
    ap.add_argument("--w", type=int, default=1100)
    ap.add_argument("--h", type=int, default=1200)
    ap.add_argument("--samples", type=int, default=48)
    a = ap.parse_args(argv)

    rsc._clear_scene()
    sc = bpy.context.scene
    sc.render.fps = FPS
    cs.world("#f2d2b4", 0.35)
    holder, H = cs.avatar(a.model, (0, 0, 0), height=2.0, animation="idle_neutral", progress=0.5)
    arm = next(o for o in bpy.data.objects if o.type == "ARMATURE" and o.animation_data and o.animation_data.nla_tracks)
    build_timeline(arm)
    key_face()

    # waist-up, as the widget's card shows its agent (no floor: the card's composer covers the hips)

    focus = cs.focus_at((0, 0, H * 0.52))
    # studio light like the other Bizmis renders: a soft high key (short, soft contact shadow),
    # a warm fill and an orange rim that ties it to the stage
    cs.area("key", 260, 4.0, (1.0, 0.96, 0.9), (-1.6, -2.6, 4.6), focus)
    cs.area("fill", 120, 4.0, (1.0, 0.93, 0.86), (2.6, -2.8, 1.6), focus)
    cs.area("rim", 260, 1.6, (1.0, 0.78, 0.55), (1.8, 2.4, 3.0), focus)
    # only the key casts a shadow: the rim and fill would streak long shadows across the floor
    for name in ("FillLight", "RimLight", "fill", "rim"):
        o = bpy.data.objects.get(name)
        if o is None:
            continue
        o.data.use_shadow = False
        try:
            o.data.cycles.cast_shadow = False
        except Exception:
            pass
    cs.camera((0, -3.1, H * 0.72), (0, 0, H * 0.64), lens=50)

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
    sc.frame_start = a.start
    sc.frame_end = a.end
    sc.frame_step = a.step
    out = Path(a.out)
    if not out.is_absolute():
        out = ROOT / out
    out.mkdir(parents=True, exist_ok=True)
    sc.render.filepath = str(out / "f_")
    bpy.ops.render.render(animation=True)


main()
