"""The /v2 Setup agent's motion, authored on the studio's shared rig: a power-up
stance that is always charging, and the big charge-up burst out of it and back.

One clip, `setup_charge`, keyed at 24 fps (one key per rendered frame), 6 s:

- 0-2 s, the stance loop (LOOP): feet planted wide and turned out a touch, knees
  soft, hips square and low, chest up, shoulders set (down and back, never
  shrugged), fists clenched at his sides with the elbows out, chin a touch down.
  Over it, always: a quick breath, a fine tremble (hips, arms, head), the fists
  squeezing once a loop as a surge goes through him. Everything that moves is
  periodic over the 2 s, so the loop is seamless, and the burst is laid over the
  same periodic motion, so it leaves the loop and comes back to it on the beat.
- 2-6 s, the burst (BURST, two loops long): he sinks, hunches and cups the energy
  in front of his chest (two gulps of it, the tremble building), then explodes:
  he rises, chest out, head back, arms flung out and down with the fists clenched,
  holds it shaking, and settles back into the stance by 5.4 s.

The feet never slide (two-bone IK to fixed targets every frame). Authored in glTF
node-local TRS with the studio's helpers (avatar-pipeline/glb_animation_authoring
and the charge_up script's), from the rig's rest pose, as the shared clips are.
Writes a GLB with the rig and this one clip, which scripts/setup-charge-anim.py
puts on the model. The shared avatar-animations.glb is not touched.

    python3 scripts/setup-charge-clip.py --out <dir>/setup-charge.glb
"""
import argparse
import copy
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT.parent / "trujilloai-bizmis-studio" / "avatar-pipeline"
sys.path.insert(0, str(STUDIO))

from glb_animation_authoring import (  # noqa: E402
    Rig, build_animation, bump, q_align_frames, q_axis_angle, q_mul, q_norm, q_rot,
    q_slerp, read_glb, v_add, v_norm, v_sub, write_glb,
)
from create_charge_up_and_thinking_loop import (  # noqa: E402
    _torso_point, copy_pose, curl_fingers, hand_frame, set_world_rot, spline, translate_world,
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
HIP_SOFT = 0.042                          # hips lowered: soft knees
FOOT = (0.30, 0.085, 0.01)                # ankle target (x mirrored), wider than the hips
TOE_OUT = 11.0                            # degrees
FIST_AT = (0.44, 0.72, 0.03)              # fists at his sides, by the hips
# ─── the burst's weights (s from the burst's start) ────────────────────────
K_CROUCH = [(0.0, 0.0), (0.18, 0.12), (0.7, 0.85), (1.45, 1.0), (1.64, 1.08), (1.8, -0.35),
            (2.2, -0.25), (2.8, -0.05), (3.3, 0.0), (BURST, 0.0)]
K_HUNCH = [(0.0, 0.0), (0.2, 0.15), (0.75, 0.9), (1.45, 1.0), (1.64, 1.1), (1.8, 0.0), (BURST, 0.0)]
K_CHEST = [(0.0, 0.0), (1.62, 0.0), (1.82, 1.0), (2.5, 0.92), (3.05, 0.28), (3.5, 0.0), (BURST, 0.0)]
K_GATHER = [(0.0, 0.0), (0.12, 0.04), (0.68, 0.9), (1.45, 1.0), (1.64, 1.04), (1.8, 0.0), (BURST, 0.0)]
K_POWER = [(0.0, 0.0), (1.6, 0.0), (1.8, 1.0), (2.5, 0.96), (3.1, 0.15), (3.5, 0.0), (BURST, 0.0)]
# head: positive looks down; it leads the gather and is thrown back on the burst
K_HEAD = [(0.0, 0.0), (0.5, 0.6), (1.42, 0.68), (1.62, 0.5), (1.86, -1.25), (2.5, -0.95),
          (3.1, -0.1), (3.5, 0.0), (BURST, 0.0)]
K_SHAKE = [(0.0, 1.0), (0.35, 1.0), (1.0, 2.6), (1.6, 3.4), (1.8, 2.0), (2.55, 2.4), (3.2, 1.0), (BURST, 1.0)]
PULSES = ((0.78, 1.02), (1.08, 1.4))      # two gulps of incoming energy while gathering
HEAD_DEG = 8.0


def loop_wave(t, cycles, phase=0.0):
    """A sine with a whole number of cycles per loop: periodic over LOOP."""
    return math.sin(2 * math.pi * cycles * t / LOOP + phase)


def tremble(t, seed):
    """A fine shake, -1..1-ish, periodic over the loop (3.5 to 6.5 Hz)."""
    return (0.5 * loop_wave(t, 7, seed) + 0.32 * loop_wave(t, 9, seed * 2.1 + 1)
            + 0.22 * loop_wave(t, 13, seed * 3.7 + 2))


def surge(t):
    """Once a loop the energy surges through him (0..1, peaking mid-loop)."""
    return (0.5 - 0.5 * math.cos(2 * math.pi * t / LOOP)) ** 3


def solve_arm(rig, pose, side, target, pole, f_want, n_want):
    trial = copy_pose(pose)
    rig.two_bone_ik(trial, side + "Arm", side + "ForeArm", side + "Hand", target, pole)
    hand = rig.idx(side + "Hand")
    if f_want is None:  # the wrist straight: the hand along the forearm
        f_want = v_norm(v_sub(rig.world_pos(trial, hand), rig.world_pos(trial, rig.idx(side + "ForeArm"))))
    f_now, n_now = hand_frame(rig, trial, side)
    rig.apply_world_delta(trial, hand, q_align_frames(f_now, n_now, f_want, n_want))
    return trial


def leg(rig, pose, side, sx):
    target = (sx * FOOT[0], FOOT[1], FOOT[2])
    knee = rig.world_pos(pose, rig.idx(side + "Leg"))
    pole = v_add(knee, (sx * 0.18, 0.0, 0.5))  # knees over the toes: forward and a touch out
    rig.two_bone_ik(pose, side + "UpLeg", side + "Leg", side + "Foot", target, pole)


def pose_at(rig, rest, foot_rot, t):
    u = t - B0
    on = u >= 0
    w = (lambda keys: spline(keys, u)) if on else (lambda keys: keys[0][1])
    crouch, hunch, chest = w(K_CROUCH), w(K_HUNCH), w(K_CHEST)
    gather, power, head = max(0.0, w(K_GATHER)), max(0.0, w(K_POWER)), w(K_HEAD)
    shake = w(K_SHAKE)
    gulp = sum(bump(u, a, b) for a, b in PULSES) if on else 0.0
    breath = loop_wave(t, 1)            # one quick breath a loop
    sg = surge(t)
    tr = [tremble(t, s) for s in (0.3, 1.7, 2.9, 4.1, 5.3, 6.6)]

    pose = copy_pose(rest)
    # hips: low and square; the crouch sinks them, the burst lifts him tall; the shake rides them
    translate_world(rig, pose, "Hips", (
        0.0022 * shake * tr[0],
        -HIP_SOFT - 0.036 * crouch - 0.007 * gulp + 0.0025 * breath - 0.004 * sg + 0.0012 * shake * tr[1],
        -0.008 - 0.012 * max(crouch, 0.0),
    ))
    # spine: a touch forward into it, chest up; the breath lifts the chest
    for bone, base, h, c, b in (("Spine", 2.5, 3.5, -3.0, 0.0), ("Spine1", 0.5, 2.8, -6.0, -0.9),
                                ("Spine2", -2.5, 2.2, -8.0, -1.1)):
        rig.rotate_world(pose, bone, X, base + h * hunch + c * chest + b * breath + 1.2 * gulp)
    # shoulders set: down and back; they draw in over the gather and open on the burst
    for side, s in (("Left", 1.0), ("Right", -1.0)):
        rig.rotate_world(pose, side + "Shoulder", Y, s * (3.0 - 9.0 * gather + 7.0 * chest))
        rig.rotate_world(pose, side + "Shoulder", Z, s * (-4.0 - 1.5 * gather + 3.5 * power + 0.5 * breath))
    # head: chin a touch down (determined), the shake in it too
    rig.rotate_world(pose, "Neck", X, 2.0 + 0.35 * HEAD_DEG * head)
    rig.rotate_world(pose, "Head", X, 3.0 + 0.65 * HEAD_DEG * head + 1.5 * gulp + 0.5 * shake * tr[2])
    rig.rotate_world(pose, "Head", Y, 0.35 * shake * tr[3])

    for side, sx in (("Left", 1.0), ("Right", -1.0)):
        # stance: fists at the sides, elbows out and back, wrists straight, knuckles out
        s_target = (sx * (FIST_AT[0] + 0.008 * sg), FIST_AT[1] - 0.018 * crouch, FIST_AT[2])
        s_pole = v_add(rig.world_pos(pose, rig.idx(side + "Arm")), (sx * 0.6, -0.15, -0.55))
        stance = solve_arm(rig, pose, side, s_target, s_pole, None, v_norm((-sx * 0.9, 0.2, -0.2)))
        # gather: hands cup the energy in front of his chest, palms facing
        orb, cd = _torso_point(rig, pose, rest, (0.0, 0.09, 0.33))
        pull = 0.035 * gulp
        g_target = v_add(orb, q_rot(cd, (sx * (0.2 - pull), 0.0, -0.03 - pull)))
        g_pole = v_add(g_target, (sx * 0.5, -0.5, -0.35))
        gath = solve_arm(rig, pose, side, g_target, g_pole, v_norm((-sx * 0.35, 0.25, 1.0)),
                         v_norm((-sx * 1.0, 0.45, 0.0)))
        # power: the fists thrust down and out by the hips, arms locked, elbows flared
        sh = rig.world_pos(pose, rig.idx(side + "Arm"))
        p_target = v_add(sh, (sx * 0.24, -0.25, 0.03))
        p_pole = v_add(p_target, (sx * 0.6, 0.2, -0.5))
        powr = solve_arm(rig, pose, side, p_target, p_pole, None, v_norm((-sx * 0.9, 0.2, -0.2)))
        # blend in rotation space (a blended IK target would swing the elbow through)
        total = gather + power
        for bone in ("Arm", "ForeArm", "Hand"):
            i = rig.idx(side + bone)
            r = stance[i][1]
            if total > 1e-5:
                other = q_slerp(gath[i][1], powr[i][1], power / total)
                r = q_slerp(r, other, min(1.0, total))
            t_, _, s_ = pose[i]
            pose[i] = (t_, q_norm(r), s_)
        # the shake in the arms, more in the fists
        rig.rotate_world(pose, side + "Arm", Z, 0.7 * shake * tr[4] * sx)
        rig.rotate_world(pose, side + "ForeArm", X, 0.9 * shake * tr[5])
        open_hand = min(1.0, gather) * (1 - min(1.0, power))
        curl_fingers(rig, pose, side, 72.0 * (1 - open_hand) + 10.0 * open_hand + 5.0 * sg,
                     thumb=40.0 * (1 - open_hand))

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
    print(f"setup_charge: {n} frames at {FPS} fps -> {a.out}")


if __name__ == "__main__":
    main()
