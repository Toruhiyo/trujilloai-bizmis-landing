"""The /v2 Setup agent's motion, authored on the studio's shared rig: Will stands easy and
open, taking in the store's data as it flows down the wires into him, then the happy
burst once it's all in, and back.

One clip, `setup_charge`, keyed at 24 fps (one key per rendered frame), 6 s:

- 0-2 s, the stance loop (LOOP): feet under the hips, toes turned out a touch, knees
  soft, upright and easy, shoulders down and relaxed. His arms hang loose a little out
  from his sides, his hands open with the palms turned forward: welcoming what comes
  in. Over it, always, he fills up: a slow breath that lifts his chest and him a touch,
  his arms opening a little with it, and a gentle sway. Everything that moves is
  periodic over the 2 s, so the loop is seamless, and the burst is laid over the same
  periodic motion, so it leaves the loop and comes back to it on the beat.
- 2-6 s, the burst (BURST, two loops long): he takes the last of it in (a deeper
  breath, two gulps of it, he dips a little, his arms open wider, palms forward, his
  eyes half close, smiling), then a happy burst: he springs up tall with his arms up and
  out, palms open, head up, a cheer; a little bounce; then his arms come back down and
  he is back in the stance by 5.5 s.

The feet never slide (two-bone IK to fixed targets every frame). Will is a chibi: a
deep, round torso and short arms, so his arms hang out from his sides far enough that
the wrists and forearms clear the round of the shirt and the hips in every frame
(checked on the skinned meshes: setup-charge-anim.py --check). Authored in glTF
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
    Rig, build_animation, bump, q_align_frames, q_axis_angle, q_mul, q_norm,
    q_slerp, read_glb, v_add, v_dot, v_norm, v_scale, v_sub, write_glb,
)
from create_charge_up_and_thinking_loop import (  # noqa: E402
    copy_pose, curl_fingers, hand_frame, set_world_rot, spline, translate_world,
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
# the wrists (x mirrored), from the shoulder joints in rest axes: hanging loose, out from his
# sides (clear of the round of the shirt and the hips) and a touch forward, the elbows soft
OPEN_AT = (0.272, -0.2, 0.11)
OPEN_WIDE = (0.035, 0.035, 0.06)           # the gather: the arms open wider, a little up and forward
CHEER_AT = (0.085, 0.25, 0.2)             # the cheer's wrists (x mirrored), from the shoulder joints
# on the way up to the cheer (and back), the elbows bend and the hands pass in front, out by the
# shoulders: a straight arm swinging out sideways would leave the frame
SWING_AT = (0.16, 0.0, 0.18)

# ─── the burst's weights (s from the burst's start) ────────────────────────
# gather: he takes the last of it in, arms opening wider, a deep breath
K_GATHER = [(0.0, 0.0), (0.2, 0.1), (0.85, 0.85), (1.25, 1.0), (1.36, 0.95), (1.5, 0.0), (BURST, 0.0)]
K_DIP = [(0.0, 0.0), (0.3, 0.25), (1.05, 0.9), (1.3, 1.0), (1.44, 0.2), (1.56, -1.0), (1.85, -0.7),
         (2.05, -0.15), (2.25, -0.7), (2.5, -0.5), (3.0, -0.1), (3.5, 0.0), (BURST, 0.0)]
# cheer: arms up and out, palms open, chest up
K_CHEER = [(0.0, 0.0), (1.36, 0.0), (1.6, 1.0), (2.55, 0.97), (3.25, 0.06), (3.5, 0.0), (BURST, 0.0)]
# head: positive looks down (eyes half closed, taking it in), negative up (the cheer)
K_HEAD = [(0.0, 0.0), (0.45, 0.3), (1.3, 0.4), (1.45, 0.2), (1.66, -1.0), (2.5, -0.85),
          (3.2, -0.1), (3.55, 0.0), (BURST, 0.0)]
PULSES = ((0.62, 0.9), (0.95, 1.25))       # two gulps of incoming data while he takes it in


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


def solve_arm(rig, pose, side, target, pole, f_want, n_want):
    trial = copy_pose(pose)
    rig.two_bone_ik(trial, side + "Arm", side + "ForeArm", side + "Hand", target, pole)
    hand = rig.idx(side + "Hand")
    if f_want is None:  # the wrist straight: the hand along the forearm
        f_want = v_norm(v_sub(rig.world_pos(trial, hand), rig.world_pos(trial, rig.idx(side + "ForeArm"))))
    f_now, n_now = hand_frame(rig, trial, side)
    rig.apply_world_delta(trial, hand, q_align_frames(f_now, n_now, f_want, n_want))
    return trial


def ortho(f, n):
    """f made perpendicular to n."""
    return v_norm(v_sub(f, v_scale(n, v_dot(f, n))))


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
    # shoulders: down and relaxed, rising a touch with each breath; up and open on the cheer
    for side, s in (("Left", 1.0), ("Right", -1.0)):
        rig.rotate_world(pose, side + "Shoulder", Z, s * (-2.5 + 7.0 * cheer + 1.2 * fill + 1.0 * gulp))
    # head: a friendly tilt, looking at us; down a touch as he takes it in, up on the cheer
    rig.rotate_world(pose, "Neck", X, 0.35 * 9.0 * head)
    rig.rotate_world(pose, "Head", X, -1.0 + 0.65 * 9.0 * head - 0.8 * breath)
    rig.rotate_world(pose, "Head", Z, 2.5 * (1 - cheer) + 1.0 * sway)

    for side, sx in (("Left", 1.0), ("Right", -1.0)):
        sh = rig.world_pos(pose, rig.idx(side + "Arm"))
        # stance: arms loose and out from his sides, hands open, palms turned forward to what comes in;
        # each breath opens them a little more, the gather wider still
        o = tuple(OPEN_AT[i] + OPEN_WIDE[i] * gather + (0.012, 0.012, 0.004)[i] * fill + (0.006, 0.004, 0.0)[i] * gulp
                  for i in range(3))
        wrist = v_add(sh, (sx * o[0], o[1], o[2]))
        n_w = v_norm((-sx * (0.45 - 0.35 * gather), 0.2 + 0.15 * gather, 0.87))
        f_w = ortho((sx * (0.38 + 0.1 * gather), -1.0, 0.12), n_w)
        o_pole = v_add(wrist, (sx * 0.7, 0.15, -0.2))  # the elbows soft, out and behind
        down = solve_arm(rig, pose, side, wrist, o_pole, f_w, n_w)
        # cheer: arms up and out in a V, hands open and up, palms to us (in the frame, clear of his head)
        ch_target = v_add(sh, CHEER_AT if sx > 0 else (-CHEER_AT[0], CHEER_AT[1], CHEER_AT[2]))
        ch_pole = v_add(ch_target, (sx * 0.35, -0.5, -0.3))
        ch_n = v_norm((sx * 0.12, -0.12, 1.0))
        chr_ = solve_arm(rig, pose, side, ch_target, ch_pole, ortho((sx * 0.15, 1.0, 0.0), ch_n), ch_n)
        sw_target = v_add(sh, (sx * SWING_AT[0], SWING_AT[1], SWING_AT[2]))
        sw_n = v_norm((-sx * 0.1, 0.2, 1.0))
        swing = solve_arm(rig, pose, side, sw_target, v_add(sw_target, (sx * 0.4, -0.4, -0.3)),
                          ortho((sx * 0.3, 1.0, 0.0), sw_n), sw_n)
        # blend in rotation space (a blended IK target would swing the elbow through), by way of the swing
        # (the elbow and the wrist lead the shoulder, so the arm never swings out straight)
        for bone, lead in (("Arm", 1.0), ("ForeArm", 2.0), ("Hand", 2.0)):
            i = rig.idx(side + bone)
            c2 = min(1.0, 2.0 * lead * cheer)
            q = q_slerp(down[i][1], swing[i][1], c2) if cheer < 0.5 else q_slerp(swing[i][1], chr_[i][1], 2.0 * cheer - 1.0)
            t_, _, s_ = pose[i]
            pose[i] = (t_, q_norm(q), s_)
        # the fingers: relaxed and open, opening a little more with each breath; spread on the cheer
        curl_fingers(rig, pose, side, (9.0 - 4.0 * fill - 4.0 * gather) * (1 - cheer) + 4.0 * cheer,
                     thumb=6.0 * (1 - cheer))

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
