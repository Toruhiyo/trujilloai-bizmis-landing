"""The /v2 Setup agent's motion, authored on the studio's shared rig: Will stands easy, his
hands low and open, taking in the store's data as it flows down the wires into him, then the happy
burst once it's all in, and back.

One clip, `setup_charge`, keyed at 24 fps (one key per rendered frame), 6 s:

- 0-2 s, the stance loop (LOOP): feet under the hips, toes turned out a touch, knees
  soft, upright and easy, shoulders down and relaxed, his hands held low by his hips, a
  little out and in front, the elbows soft, the palms between forward and up, relaxed and
  softly cupped: gathering what comes in. Over it, always, he fills up: a slow breath that
  lifts his chest and him a touch (and his hands, which open a little with it), and a
  gentle sway.
  Everything that moves is periodic over the 2 s, so the loop is seamless, and the burst
  is laid over the same periodic motion, so it leaves the loop and comes back to it on
  the beat.
- 2-6 s, the burst (BURST, two loops long): he takes the last of it in (a deeper
  breath, two gulps of it, he dips a little, his hands lift and cup a touch more, his
  eyes half close, smiling), then the triumph: he springs up tall and throws both fists up
  beside his head (real fists, the palms to us, the thumbs over the fingers), pumps them
  once with a little bounce, then brings them back down, opening into the stance's hands;
  he is back in the stance by 5.5 s. On the way up and down, the fists pass in front of his shoulders, out
  of the shirt's logo, where the wires land.

The feet never slide (two-bone IK to fixed targets every frame). Will is a chibi: a
deep, round torso, wider than his shoulders, and short arms, so his hands are held out a little from the round of the shirt and his
elbows out and back, clear of his sides (checked on the skinned meshes in every frame:
setup-charge-anim.py --check). The wrists stay in line
with the forearms; the hand's roll is shared between the forearm and the wrist, so the
wrist never twists like a candy wrapper. Authored in glTF
node-local TRS with the studio's helpers (avatar-pipeline/glb_animation_authoring and
the charge_up script's), from the rig's rest pose, as the shared clips are. Writes a
GLB with the rig and this one clip, which scripts/setup-charge-anim.py puts on the
model, and a JSON beside it with the per-frame weights the render keys the face on
(one timeline). The shared avatar-animations.glb is not touched.

    python3 scripts/setup-charge-clip.py --out <dir>/setup-charge.glb
"""
import argparse
import copy
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT.parent / "trujilloai-bizmis-studio" / "avatar-pipeline"
sys.path.insert(0, str(STUDIO))

from glb_animation_authoring import (  # noqa: E402
    Rig, build_animation, bump, q_align_frames, q_axis_angle, q_between, q_mul, q_norm,
    q_slerp, read_glb, v_add, v_cross, v_dot, v_norm, v_scale, v_sub, write_glb,
)
from create_charge_up_and_thinking_loop import (  # noqa: E402
    copy_pose, hand_frame, set_world_rot, spline, translate_world,
)

ANIMATIONS = STUDIO / "models/input/avatar-animations.glb"
FPS = 24
LOOP = 2.0            # the stance loop (s)
BURST = 4.0           # the burst (s), a whole number of loops
B0 = LOOP             # the burst starts after one loop
LENGTH = LOOP + BURST
X = (1.0, 0.0, 0.0)
Y = (0.0, 1.0, 0.0)
Z = (0.0, 0.0, 1.0)

# ─── the stance ────────────────────────────────────────────────────────────
HIP_SOFT = 0.022                          # hips lowered a touch: soft, easy knees
FOOT = (0.175, 0.085, 0.0)                # ankle target (x mirrored): under the hip joints
TOE_OUT = 6.0                             # degrees
# the arms: each pose is a wrist target (x mirrored) from the shoulder joint in rest axes, an elbow pole
# (from the wrist) and the palm's normal; the wrist is straight (the hand along the forearm)
REST_AT = (0.23, -0.23, 0.13)             # the stance: the hands low, a little out and in front, by his hips
REST_POLE = (1.0, -0.2, -0.6)             # the elbows soft, out and back, clear of his sides
REST_N = (-0.2, 0.6, 0.75)                # the palms between forward and up: gathering what comes in
REST_FILL = (0.006, 0.012, 0.006)         # each breath lifts the hands a touch (and a little out and forward)
REST_GATHER = (0.0, 0.02, 0.012)          # taking the last of it in: the hands lift a touch more
CUP_CURL = 24.0                           # the hands relaxed and softly cupped: degrees at the first joint
CUP_JOINTS = (1.0, 1.4, 0.9)
CUP_CASCADE = (0.85, 1.0, 1.1, 1.2)       # the index curls the least, the pinky the most
CUP_OPEN = 5.0                            # each breath opens them by this much
CUP_THUMB = (0.85, 0.25, 0.5)             # the thumb, relaxed by the index (in the hand's fingers, index, palm axes)
CUP_THUMB_BEND = 14.0
MID_AT = (0.2, 0.0, 0.18)                 # on the way up and down: the fists in front of his shoulders
MID_POLE = (0.7, -0.4, -0.3)
MID_N = (-1.0, 0.0, 0.1)                  # the palms in, the thumbs up: between the stance's palms up and the top's
UP_AT = (0.13, 0.31, 0.05)                # the triumph: the fists up beside his head
UP_POLE = (0.6, -0.4, -0.3)
UP_N = (-0.35, 0.1, 1.0)                  # the palms to us
TWIST_SHARE = 0.5                         # of the hand's roll, what the forearm takes (the rest, the wrist)
# a real fist: the fingers curled into the palm, the thumb over the index and middle fingers
FINGERS = ("Index", "Middle", "Ring", "Pinky")
FIST_CURL = 74.0                          # degrees at the first joint
FIST_JOINTS = (1.0, 1.25, 0.95)           # per joint
THUMB_OVER = 0.03                         # the thumb rests this far out of the curled fingers
THUMB_BEND = 10.0

# ─── the burst's weights (s from the burst's start) ────────────────────────
# gather: he takes the last of it in, a deep breath
K_GATHER = [(0.0, 0.0), (0.2, 0.1), (0.85, 0.85), (1.25, 1.0), (1.36, 0.95), (1.5, 0.0), (BURST, 0.0)]
K_DIP = [(0.0, 0.0), (0.3, 0.25), (1.05, 0.9), (1.3, 1.0), (1.44, 0.2), (1.56, -1.0), (1.85, -0.7),
         (2.05, -0.15), (2.25, -0.7), (2.5, -0.5), (3.0, -0.1), (3.5, 0.0), (BURST, 0.0)]
# cheer: chest up, head up, the big smile (the fists go up on K_UP)
K_CHEER = [(0.0, 0.0), (1.36, 0.0), (1.6, 1.0), (2.55, 0.97), (3.25, 0.06), (3.5, 0.0), (BURST, 0.0)]
# head: positive looks down (eyes half closed, taking it in), negative up (the cheer)
K_HEAD = [(0.0, 0.0), (0.45, 0.3), (1.3, 0.4), (1.45, 0.2), (1.66, -1.0), (2.5, -0.85),
          (3.2, -0.1), (3.55, 0.0), (BURST, 0.0)]
PULSES = ((0.62, 0.9), (0.95, 1.25))       # two gulps of incoming data while he takes it in
# the hands: 0 the stance's, 1 the fists up (by way of MID_AT at 0.5)
K_UP = [(0.0, 0.0), (1.32, 0.0), (1.6, 1.0), (2.6, 1.0), (3.25, 0.0), (BURST, 0.0)]
# the gather: the stance's hands lift and cup a touch more with the deep breath
K_WIND = [(0.0, 0.0), (0.3, 0.1), (1.0, 0.7), (1.3, 1.0), (1.6, 1.0), (2.6, 1.0), (3.25, 0.0), (BURST, 0.0)]
FIST_PUMP = (1.66, 2.06)                   # a pump of the fists at the top


def loop_wave(t, cycles, phase=0.0):
    """A sine with a whole number of cycles per loop: periodic over LOOP."""
    return math.sin(2 * math.pi * cycles * t / LOOP + phase)


def weights(t):
    """Every weight of the timeline at clip time t (the render keys the face on them)."""
    u = t - B0
    on = u >= 0
    w = (lambda keys: spline(keys, u)) if on else (lambda keys: keys[0][1])
    gulp = sum(bump(u, a, b) for a, b in PULSES) if on else 0.0
    return {
        "gather": max(0.0, w(K_GATHER)), "dip": w(K_DIP), "cheer": max(0.0, w(K_CHEER)),
        "head": w(K_HEAD), "gulp": gulp, "breath": loop_wave(t, 1),
    }


def ortho(f, n):
    """f made perpendicular to n."""
    return v_norm(v_sub(f, v_scale(n, v_dot(f, n))))


def fist(rig, pose, side):
    """Curl the fingers into the palm and lay the thumb over the index and middle fingers."""
    f, n = hand_frame(rig, pose, side)
    w = lambda b: rig.world_pos(pose, rig.idx(side + b))
    hinge = v_norm(v_cross(f, n))
    for finger in FINGERS:
        for j, k in enumerate(FIST_JOINTS, start=1):
            rig.rotate_world(pose, f"{side}Hand{finger}{j}", hinge, FIST_CURL * k)
    pts = [w(f"Hand{x}{j}") for x in ("Index", "Middle") for j in (2, 3)]
    over = v_add(v_scale(tuple(sum(p[i] for p in pts) for i in range(3)), 1.0 / len(pts)), v_scale(n, THUMB_OVER))
    want = v_norm(v_sub(over, w("HandThumb1")))
    rig.apply_world_delta(pose, rig.idx(side + "HandThumb1"),
                          q_between(v_norm(v_sub(w("HandThumb3"), w("HandThumb1"))), want))
    th = v_norm(v_cross(want, n))  # the thumb's joints bend toward the palm
    if v_dot(v_cross(th, want), n) < 0:
        th = v_scale(th, -1.0)
    for j, k in ((2, 0.5), (3, 0.8)):
        rig.rotate_world(pose, f"{side}HandThumb{j}", th, THUMB_BEND * k)


def cup(rig, pose, side, curl):
    """A relaxed hand, softly cupped: the fingers curled a little (the index the least), the thumb by the index."""
    f, n = hand_frame(rig, pose, side)
    w = lambda b: rig.world_pos(pose, rig.idx(side + b))
    s = ortho(v_sub(w("HandIndex1"), w("HandPinky1")), f)
    hinge = v_norm(v_cross(f, n))
    for finger, c in zip(FINGERS, CUP_CASCADE):
        for j, k in enumerate(CUP_JOINTS, start=1):
            rig.rotate_world(pose, f"{side}Hand{finger}{j}", hinge, curl * c * k)
    a, b, c = CUP_THUMB
    want = v_norm(v_add(v_add(v_scale(f, a), v_scale(s, b)), v_scale(n, c)))
    rig.apply_world_delta(pose, rig.idx(side + "HandThumb1"),
                          q_between(v_norm(v_sub(w("HandThumb3"), w("HandThumb1"))), want))
    th = v_norm(v_cross(want, n))
    if v_dot(v_cross(th, want), n) < 0:
        th = v_scale(th, -1.0)
    for j, k in ((2, 0.5), (3, 0.8)):
        rig.rotate_world(pose, f"{side}HandThumb{j}", th, CUP_THUMB_BEND * k)


def arm_pose(rig, pose, side, sx, wrist_rel, pole_rel, n_want, curl=None):
    """The arm on two-bone IK to a wrist target (from the shoulder joint), the wrist straight, the
    palm's normal n_want, its roll shared between the forearm and the wrist; a fist, or (curl given)
    a softly cupped hand."""
    m = lambda v: (sx * v[0], v[1], v[2])
    wrist = v_add(rig.world_pos(pose, rig.idx(side + "Arm")), m(wrist_rel))
    trial = copy_pose(pose)
    rig.two_bone_ik(trial, side + "Arm", side + "ForeArm", side + "Hand", wrist, v_add(wrist, m(pole_rel)))
    ia, ih = rig.idx(side + "ForeArm"), rig.idx(side + "Hand")
    fa = v_norm(v_sub(rig.world_pos(trial, ih), rig.world_pos(trial, ia)))
    n = ortho(v_norm(m(n_want)), fa)
    _, n_now = hand_frame(rig, trial, side)
    a, b = ortho(n_now, fa), n
    roll = math.degrees(math.atan2(v_dot(v_cross(a, b), fa), v_dot(a, b)))
    rig.rotate_world(trial, side + "ForeArm", fa, TWIST_SHARE * roll)
    f_now, n_now = hand_frame(rig, trial, side)
    rig.apply_world_delta(trial, ih, q_align_frames(f_now, n_now, fa, n))
    if curl is None:
        fist(rig, trial, side)
    else:
        cup(rig, trial, side, curl)
    return trial


ARM_CHAIN = ("Arm", "ForeArm", "Hand") + tuple(f"Hand{f}{j}" for f in FINGERS + ("Thumb",) for j in (1, 2, 3))


def blend_arm(rig, pose, side, a, b, w):
    """Write into pose the slerp (in rotation space: a blended IK target would swing the elbow
    through) of the arm chains of poses a and b."""
    for bone in ARM_CHAIN:
        i = rig.idx(side + bone)
        t_, _, s_ = pose[i]
        pose[i] = (t_, q_norm(q_slerp(a[i][1], b[i][1], max(0.0, min(1.0, w)))), s_)


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def leg(rig, pose, side, sx):
    target = (sx * FOOT[0], FOOT[1], FOOT[2])
    knee = rig.world_pos(pose, rig.idx(side + "Leg"))
    pole = v_add(knee, (sx * 0.06, 0.0, 0.5))  # knees over the toes
    rig.two_bone_ik(pose, side + "UpLeg", side + "Leg", side + "Foot", target, pole)


def pose_at(rig, rest, foot_rot, t):
    k = weights(t)
    gather, dip, cheer, head = k["gather"], k["dip"], k["cheer"], k["head"]
    gulp, breath = k["gulp"], k["breath"]
    fill = 0.5 + 0.5 * breath              # 0..1: filling up with each breath
    sway = loop_wave(t, 1, 0.9)

    pose = copy_pose(rest)
    # hips: soft knees, a small rise with each breath; the gather dips him, the cheer springs him up
    # (a bounce in it); a gentle sway
    translate_world(rig, pose, "Hips", (
        0.004 * sway,
        -HIP_SOFT - 0.03 * max(dip, 0.0) + 0.019 * max(-dip, 0.0) + 0.005 * fill + 0.003 * gulp,
        0.0,
    ))
    rig.rotate_world(pose, "Hips", Z, 0.8 * sway)
    # spine: upright and easy; the breath lifts and opens the chest (more as he takes it in), more on the cheer
    for bone, base, g, c, b in (("Spine", 0.5, 0.0, -1.5, -0.4), ("Spine1", 0.0, -1.5, -3.0, -1.0),
                                ("Spine2", -1.0, -2.0, -4.0, -1.2)):
        rig.rotate_world(pose, bone, X, base + g * gather + c * cheer + b * breath - 1.0 * gulp)
    rig.rotate_world(pose, "Spine1", Z, -0.6 * sway)
    # shoulders: down and relaxed, rising a touch with each breath; up with the fists
    for side, s in (("Left", 1.0), ("Right", -1.0)):
        rig.rotate_world(pose, side + "Shoulder", Z, s * (-2.5 + 7.0 * cheer + 1.2 * fill + 1.0 * gulp))
    # head: a friendly tilt, looking at us; down a touch as he takes it in, up on the cheer
    rig.rotate_world(pose, "Neck", X, 0.35 * 9.0 * head)
    rig.rotate_world(pose, "Head", X, -1.0 + 0.65 * 9.0 * head - 0.8 * breath)
    rig.rotate_world(pose, "Head", Z, 2.5 * (1 - cheer) + 1.0 * sway)

    # the arms: the hands low and open (lifting a touch on the gather), then both fists up by way of
    # the front of his shoulders, a pump at the top, and back down into the stance's hands
    u = t - B0
    up = max(0.0, min(1.0, spline(K_UP, u))) if u >= 0 else 0.0
    wind = max(0.0, min(1.0, spline(K_WIND, u))) if u >= 0 else 0.0
    pump = bump(u, *FIST_PUMP) if u >= 0 else 0.0
    for side, sx in (("Left", 1.0), ("Right", -1.0)):
        at = lambda g: tuple(REST_AT[i] + REST_FILL[i] * fill + REST_GATHER[i] * g for i in range(3))
        base = arm_pose(rig, pose, side, sx, at(0.0), REST_POLE, REST_N, CUP_CURL - CUP_OPEN * fill)
        blend_arm(rig, base, side, base, arm_pose(rig, pose, side, sx, at(1.0), REST_POLE, REST_N, CUP_CURL + 6.0),
                  smooth(wind))
        mid = arm_pose(rig, pose, side, sx, MID_AT, MID_POLE, MID_N)
        top = arm_pose(rig, pose, side, sx, (UP_AT[0], UP_AT[1] + 0.025 * pump, UP_AT[2] + 0.01 * pump), UP_POLE, UP_N)
        if up < 0.5:
            blend_arm(rig, pose, side, base, mid, 2.0 * up)
        else:
            blend_arm(rig, pose, side, mid, top, 2.0 * up - 1.0)

    # feet planted (they never slide), toes turned out a touch
    for side, sx in (("Left", 1.0), ("Right", -1.0)):
        leg(rig, pose, side, sx)
        set_world_rot(rig, pose, side + "Foot", foot_rot[side])
    return pose


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    gltf, bin_chunk = read_glb(str(ANIMATIONS))
    rig = Rig(gltf)
    rest = list(rig.rest)
    foot_rot = {}
    for side, sx in (("Left", 1.0), ("Right", -1.0)):
        r = rig.world_rot(rest, rig.idx(side + "Foot"))
        foot_rot[side] = q_norm(q_mul(q_axis_angle(Y, math.radians(sx * TOE_OUT)), r))

    n = round(LENGTH * FPS)
    times = [k / FPS for k in range(n)]
    poses = [pose_at(rig, rest, foot_rot, t) for t in times]

    out = copy.deepcopy(gltf)
    out["accessors"], out["bufferViews"], out["animations"] = [], [], []
    parts, offset = [], 0
    for skin in out.get("skins", []):
        if "inverseBindMatrices" in skin:
            acc = copy.deepcopy(gltf["accessors"][skin["inverseBindMatrices"]])
            view = gltf["bufferViews"][acc["bufferView"]]
            start = view.get("byteOffset", 0)
            raw = bin_chunk[start:start + view["byteLength"]]
            new_view = {k: v for k, v in view.items() if k != "byteOffset"}
            new_view["byteOffset"] = offset
            out["bufferViews"].append(new_view)
            parts.append(raw)
            offset += len(raw)
            pad = -offset % 4
            if pad:
                parts.append(b"\x00" * pad)
                offset += pad
            acc["bufferView"] = len(out["bufferViews"]) - 1
            out["accessors"].append(acc)
            skin["inverseBindMatrices"] = len(out["accessors"]) - 1
    node_ids = sorted({ch["target"]["node"] for ch in gltf["animations"][0]["channels"]})
    offset = build_animation("setup_charge", times, poses, node_ids, out, parts, offset)
    blob = b"".join(parts)
    out["buffers"] = [{"byteLength": len(blob) + (-len(blob) % 4)}]
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    write_glb(a.out, out, blob)
    # the timeline's weights, per frame, for the render's face
    side = Path(a.out).with_suffix(".json")
    side.write_text(json.dumps({"fps": FPS, "frames": [
        {k: round(v, 4) for k, v in weights(t).items()} for t in times]}))
    print(f"setup_charge: {n} frames at {FPS} fps -> {a.out} (+ {side.name})")


if __name__ == "__main__":
    main()
