"""Clay dioramas around real Bizmis avatars, for the landing's hero and style frames.

Run with the studio's Blender:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/clay-scene.py -- \
      --scene shop --out tmp/clay/shop.png [--w 1920 --h 1080 --samples 160]

The avatars come from the studio (models/render/*.glb, uncompressed with named
meshes) and are posed, coloured and stamped with the studio renderer's own
helpers, so they match every other Bizmis render. Everything around them is
built here from primitives with a hand-made clay material (soft subsurface,
fingerprint bump), warm area lights and a curved cyclorama.
"""
import argparse
import math
import sys
from pathlib import Path

import bpy
import mathutils

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT.parent / "trujilloai-bizmis-studio"
sys.path.insert(0, str(STUDIO / "marketing"))
import render_store_clerk as rsc  # noqa: E402

MODELS = STUDIO / "avatar-pipeline/models/render"
LOGO = ROOT / "scripts/assets/bizmis-logo-white-tight.png"
ORANGE = "#F28C38"


def hex_lin(h):
    return rsc._hex_to_linear(h)


# ── materials ──────────────────────────────────────────────────────────────
def clay(name, hex_color, rough=0.62, sss=0.12, bump=0.12, scale=38.0):
    """Matte modelling clay: a little subsurface, a fingerprint/noise bump."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    r, g, bl = hex_lin(hex_color)
    b.inputs["Base Color"].default_value = (r, g, bl, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Radius"].default_value = (0.08, 0.05, 0.04)
    b.inputs["Subsurface Scale"].default_value = 0.05
    b.inputs["Specular IOR Level"].default_value = 0.25
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 6
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = scale * 0.35
    mix = nt.nodes.new("ShaderNodeMath")
    mix.operation = "ADD"
    nt.links.new(noise.outputs["Fac"], mix.inputs[0])
    nt.links.new(vor.outputs["Distance"], mix.inputs[1])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = bump
    bp.inputs["Distance"].default_value = 0.02
    nt.links.new(mix.outputs["Value"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def glow(name, hex_color, strength=2.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    r, g, bl = hex_lin(hex_color)
    b.inputs["Base Color"].default_value = (r, g, bl, 1)
    b.inputs["Emission Color"].default_value = (r, g, bl, 1)
    b.inputs["Emission Strength"].default_value = strength
    return m


# ── shapes ─────────────────────────────────────────────────────────────────
def finish(obj, mat, bevel=0.0, subdiv=2, smooth=True):
    if bevel:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 6
        mod.limit_method = "NONE"
    if subdiv:
        s = obj.modifiers.new("subd", "SUBSURF")
        s.levels = subdiv
        s.render_levels = subdiv
    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True
    obj.data.materials.append(mat)
    return obj


def box(name, size, loc, mat, bevel=0.04, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, mat, bevel=bevel, subdiv=1)


def ball(name, r, loc, mat, squash=1.0):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.active_object
    o.name = name
    o.scale = (1, 1, squash)
    return finish(o, mat, subdiv=1)


def capsule(name, r, h, loc, mat, rot=(0, 0, 0)):
    bpy.ops.object.metaball_add(type="CAPSULE", radius=r, location=loc, rotation=rot)
    mb = bpy.context.active_object
    mb.data.elements[0].size_x = h / 2
    mb.data.resolution = 0.02
    mb.data.render_resolution = 0.02
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.active_object
    o.name = name
    return finish(o, mat, subdiv=0)


def torus(name, R, r, loc, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=64, minor_segments=24)
    o = bpy.context.active_object
    o.name = name
    return finish(o, mat, subdiv=1)


def cone(name, r, h, loc, mat):
    bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r * 0.12, depth=h, location=loc, vertices=48)
    o = bpy.context.active_object
    o.name = name
    return finish(o, mat, bevel=r * 0.25, subdiv=1)


def cyl(name, r, h, loc, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=48)
    o = bpy.context.active_object
    o.name = name
    return finish(o, mat, bevel=min(r, h) * 0.3, subdiv=1)


def cyclorama(mat, width=16, front=8.0, wall_y=2.6, height=7.0, radius=2.0):
    """A floor that curves up into a back wall, so there is no horizon line."""
    import bmesh
    prof = [(-front + i * (front + wall_y - radius) / 16, 0.0) for i in range(17)]
    for i in range(1, 17):
        a = math.pi / 2 * i / 16
        prof.append((wall_y - radius + radius * math.sin(a), radius - radius * math.cos(a)))
    prof += [(wall_y, radius + i * (height - radius) / 8) for i in range(1, 9)]
    me = bpy.data.meshes.new("cyc")
    bm = bmesh.new()
    rows = [[bm.verts.new((x, y, z)) for (y, z) in prof] for x in (-width / 2, width / 2)]
    for i in range(len(prof) - 1):
        bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    bm.to_mesh(me)
    o = bpy.data.objects.new("cyclorama", me)
    bpy.context.scene.collection.objects.link(o)
    for p in o.data.polygons:
        p.use_smooth = True
    o.data.materials.append(mat)
    return o


# ── avatars ────────────────────────────────────────────────────────────────
def avatar(model, loc, rot_z=0.0, height=None, *, shirt=ORANGE, stamp=LOGO, stamp_scale=1.15,
           animation="idle_neutral", progress=0.5, expression="smile", mesh_colors=None, hat=None):
    """Import one avatar, pose, colour and stamp it, then move it into place."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(MODELS / f"{model}.glb"))
    new = [o for o in bpy.data.objects if o not in before]
    arm = next(o for o in new if o.type == "ARMATURE" and any(c.type == "MESH" for c in o.children))
    rsc._apply_pose(arm, animation, progress)
    rsc._apply_expression(expression, 0.0, 0.0)
    colors = {"Shirt_Color": shirt, **(mesh_colors or {})}
    rsc._apply_mesh_colors(colors)
    if hat:
        rsc._apply_mesh_group_color(rsc.HAT_MESH_PREFIX, rsc.ROLE_HAT, hat, "hat")
    if stamp:
        rsc._apply_shirt_stamp(arm, str(stamp), stamp_scale, 0.0, 0.0)
    # rename what we've styled so the next avatar's helpers don't match it
    for o in new:
        if o.type == "MESH":
            o.name = f"done_{model}_{o.name}"
            for s in o.material_slots:
                if s.material and not s.material.name.startswith("done_"):
                    s.material.name = f"done_{model}_{s.material.name}"
    # the studio's models are Y-down/Z-forward: stand it up (feet down, facing -Y, the camera)
    for o in new:
        if o.type == "MESH" and o.parent is not arm:
            o.hide_render = True
            o.hide_viewport = True
    root = bpy.data.objects.new(f"rig_{model}", None)
    bpy.context.scene.collection.objects.link(root)
    for o in new:
        if o.parent is None:
            o.parent = root
    root.rotation_euler = (-math.pi / 2, 0, 0)
    bpy.context.view_layer.update()
    # measure the posed avatar (its own meshes only: some GLBs carry a stray helper mesh)
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in new:
        if o.type == "MESH" and o.parent is arm:
            e = o.evaluated_get(dg)
            me = e.to_mesh()
            pts += [o.matrix_world @ v.co for v in me.vertices]
            e.to_mesh_clear()
    zmin = min(p.z for p in pts)
    zmax = max(p.z for p in pts)
    cx = (min(p.x for p in pts) + max(p.x for p in pts)) / 2
    cy = (min(p.y for p in pts) + max(p.y for p in pts)) / 2
    k = (height / (zmax - zmin)) if height else 1.0
    root.location = (-cx * k, -cy * k, -zmin * k)
    root.scale = (k, k, k)
    holder = bpy.data.objects.new(f"place_{model}", None)
    bpy.context.scene.collection.objects.link(holder)
    root.parent = holder
    holder.location = loc
    holder.rotation_euler = (0, 0, rot_z)
    return holder, (zmax - zmin) * k


# ── light, camera, render ─────────────────────────────────────────────────
def area(name, energy, size, color, loc, target):
    rsc._add_area_light(name, energy, size, color, loc, target)


def camera(loc, target, lens=50, dof_obj=None, fstop=4.0):
    cam = bpy.data.cameras.new("cam")
    cam.lens = lens
    o = bpy.data.objects.new("cam", cam)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    t = bpy.data.objects.new("cam_target", None)
    bpy.context.scene.collection.objects.link(t)
    t.location = target
    c = o.constraints.new("TRACK_TO")
    c.target = t
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    if dof_obj is not None:
        cam.dof.use_dof = True
        cam.dof.focus_object = dof_obj
        cam.dof.aperture_fstop = fstop
    bpy.context.scene.camera = o
    return o, t


def world(hex_color, strength=0.6):
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    r, g, b = hex_lin(hex_color)
    bg.inputs["Color"].default_value = (r, g, b, 1)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w


def render(out, w, h, samples):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = samples
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
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = str(out)
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = 0.0
    bpy.ops.render.render(write_still=True)


# ── scenes ─────────────────────────────────────────────────────────────────
def scene_shop():
    """K1: the agent at a clay shop counter, products on the counter, sound rings."""
    rsc._clear_scene()
    world("#f6dcc2", 0.55)
    cyclorama(clay("wall", "#F6D2AE", bump=0.05, scale=12))
    amber, H = avatar("amber", (0.45, 0.45, 0), rot_z=math.radians(-6), height=2.35, animation="waving", progress=0.45)
    # the counter
    top = clay("counter_top", "#FFF3E4")
    front = clay("counter_front", "#F28C38")
    box("counter", (2.5, 0.62, 0.8), (0.2, -0.2, 0.4), front, bevel=0.06)
    box("counter_top", (2.68, 0.76, 0.08), (0.2, -0.2, 0.84), top, bevel=0.035)
    # products on the counter
    sage, sand, blush, butter, cream = (clay(n, c) for n, c in [("sage", "#A9BE92"), ("sand", "#D9BE9A"), ("blush", "#EDA59B"), ("butter", "#F4CF6A"), ("cream", "#FBEBD8")])
    capsule("capsule", 0.1, 0.24, (-0.62, -0.28, 1.0), sage, rot=(0, math.radians(90), math.radians(20)))
    ball("sphere", 0.12, (-0.3, -0.36, 1.0), blush)
    torus("torus", 0.1, 0.045, (-0.92, -0.36, 0.93), butter, rot=(math.radians(75), 0, math.radians(15)))
    cone("cone", 0.09, 0.24, (-1.12, -0.12, 1.0), sand)
    # a paper bag, ready
    bag = clay("bag", "#E8A36A")
    box("bag", (0.36, 0.2, 0.42), (1.12, -0.3, 1.09), bag, bevel=0.025)
    torus("bag_handle", 0.08, 0.014, (1.12, -0.3, 1.31), clay("handle", "#C9793E"), rot=(math.radians(90), 0, 0))
    # sound rings by the agent's head (it speaks)
    ring = glow("ring", "#F9A353", 1.2)
    for i, (R, z) in enumerate([(0.22, 0.0), (0.33, 0.0), (0.46, 0.0)]):
        torus(f"ring{i}", R * 1.5, 0.008, (0.45, 0.42, H * 0.8), ring, rot=(math.radians(90), 0, 0))
    # floor props: a stack of boxes, a plant
    box("crate1", (0.5, 0.4, 0.34), (-1.55, 0.6, 0.17), clay("crate", "#F0B784"), bevel=0.04)
    box("crate2", (0.42, 0.34, 0.28), (-1.5, 0.62, 0.48), clay("crate2", "#F7C99B"), bevel=0.04)
    cyl("pot", 0.16, 0.3, (1.75, 0.7, 0.15), clay("pot", "#D9774A"))
    ball("bush", 0.26, (1.75, 0.7, 0.5), clay("leaf", "#9DBA7E"), squash=1.25)
    # light
    focus = bpy.data.objects.new("focus", None)
    bpy.context.scene.collection.objects.link(focus)
    focus.location = (0.4, 0.3, 1.45)
    area("key", 320, 1.6, (1.0, 0.94, 0.86), (-2.4, -3.0, 3.4), focus)
    area("fill", 120, 4.0, (1.0, 0.92, 0.88), (3.2, -2.6, 2.0), focus)
    area("rim", 160, 1.5, (1.0, 0.86, 0.7), (1.5, 2.6, 3.0), focus)
    camera((0.0, -5.6, 1.55), (0.1, 0.2, 1.3), lens=42, dof_obj=focus, fstop=4.0)



def text3d(name, body, loc, size, mat, extrude=0.03, rot=(math.radians(90), 0, 0), align="CENTER"):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = extrude * 0.4
    o.data.bevel_resolution = 3
    o.data.align_x = align
    o.data.align_y = "CENTER"
    o.data.materials.append(mat)
    return o


def channel(name, pts, mat, width=0.16, depth=0.07, thick=0.025):
    """A U-shaped clay chute following `pts` (a marble run)."""
    prof = bpy.data.curves.new(f"{name}_prof", "CURVE")
    prof.dimensions = "2D"
    sp = prof.splines.new("POLY")
    ring = []
    for i in range(0, 13):
        a = math.pi + math.pi * i / 12
        ring.append((math.cos(a) * width / 2, math.sin(a) * depth))
    for i in range(12, -1, -1):
        a = math.pi + math.pi * i / 12
        ring.append((math.cos(a) * (width / 2 - thick), math.sin(a) * (depth - thick)))
    sp.points.add(len(ring) - 1)
    for p_, (x, y) in zip(sp.points, ring):
        p_.co = (x, y, 0, 1)
    sp.use_cyclic_u = True
    po = bpy.data.objects.new(f"{name}_prof", prof)
    bpy.context.scene.collection.objects.link(po)
    po.hide_render = True
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_mode = "OBJECT"
    cu.bevel_object = po
    cu.use_fill_caps = True
    s_ = cu.splines.new("BEZIER")
    s_.bezier_points.add(len(pts) - 1)
    for bp, co in zip(s_.bezier_points, pts):
        bp.co = co
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o, s_


def bezier_point(spline, t):
    """Position along a bezier spline at parameter t in [0, 1] (by segment)."""
    pts = spline.bezier_points
    n = len(pts) - 1
    f = min(n - 1e-6, max(0.0, t * n))
    i = int(f)
    u = f - i
    p0, p1, p2, p3 = pts[i].co, pts[i].handle_right, pts[i + 1].handle_left, pts[i + 1].co
    return (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u ** 2 * p2 + u ** 3 * p3


def focus_at(loc):
    f = bpy.data.objects.new("focus", None)
    bpy.context.scene.collection.objects.link(f)
    f.location = loc
    return f


def paper_bag(loc, scale=1.0, color="#E8A36A", rot=0.0):
    bag = clay("bag", color)
    b = box("bag", (0.36 * scale, 0.2 * scale, 0.42 * scale), (loc[0], loc[1], loc[2] + 0.21 * scale), bag, bevel=0.025 * scale, rot=(0, 0, rot))
    h = torus("bag_handle", 0.08 * scale, 0.014 * scale, (loc[0], loc[1], loc[2] + 0.43 * scale), clay("handle", "#C9793E"), rot=(math.radians(90), 0, rot))
    return b


PALETTE = {"sage": "#A9BE92", "sand": "#D9BE9A", "blush": "#EDA59B", "butter": "#F4CF6A", "cream": "#FBEBD8", "sky": "#9CC6E4", "lilac": "#C3B2E6"}


def products(spots):
    """Little clay products: (kind, colour, loc, size)."""
    for i, (kind, col, loc, k) in enumerate(spots):
        m = clay(f"p{i}", PALETTE.get(col, col))
        if kind == "capsule":
            capsule(f"p{i}", 0.1 * k, 0.24 * k, loc, m, rot=(0, math.radians(90), math.radians(20)))
        elif kind == "sphere":
            ball(f"p{i}", 0.12 * k, loc, m)
        elif kind == "torus":
            torus(f"p{i}", 0.1 * k, 0.045 * k, loc, m, rot=(math.radians(75), 0, math.radians(15)))
        elif kind == "cone":
            cone(f"p{i}", 0.09 * k, 0.24 * k, loc, m)
        elif kind == "cube":
            box(f"p{i}", (0.18 * k, 0.18 * k, 0.18 * k), loc, m, bevel=0.04 * k, rot=(0, 0, math.radians(20)))
        elif kind == "tall":
            cyl(f"p{i}", 0.07 * k, 0.3 * k, loc, m)


def scene_machine():
    """K2: a clay sales machine; shoppers (marbles) roll in, the agent runs it, every one ends in the bag."""
    rsc._clear_scene()
    world("#f8dfc6", 0.55)
    cyclorama(clay("wall", "#F7D6B4", bump=0.05, scale=12), wall_y=4.5)
    hills = clay("hill", "#F2BF8E", bump=0.04, scale=10)
    for x, y, r, sq in [(-3.4, 3.2, 1.9, 0.5), (3.6, 3.4, 2.2, 0.45), (0.2, 4.0, 2.6, 0.38)]:
        ball(f"hill{x}", r, (x, y, 0), hills, squash=sq)
    # funnel the shoppers come in through
    fun = clay("funnel", "#F28C38")
    bpy.ops.mesh.primitive_cone_add(radius1=0.12, radius2=0.55, depth=0.6, location=(-1.3, 0.6, 2.75), vertices=64, end_fill_type="NOTHING")
    f = bpy.context.active_object
    f.modifiers.new("solid", "SOLIDIFY").thickness = 0.04
    finish(f, fun, subdiv=1)
    torus("funnel_rim", 0.55, 0.04, (-1.3, 0.6, 3.05), clay("rim", "#FFB777"))
    cyl("funnel_neck", 0.13, 0.18, (-1.3, 0.6, 2.38), fun)
    # the run: from the funnel, a long S down to the bag
    run_pts = [(-1.3, 0.6, 2.3), (-1.6, 0.4, 1.9), (-0.9, 0.2, 1.55), (0.1, 0.3, 1.35), (0.7, 0.2, 1.05), (1.2, -0.05, 0.75)]
    track = clay("track", "#FFF1E2")
    _, spl = channel("run", run_pts, track, width=0.24, depth=0.1, thick=0.035)
    stand = clay("stand", "#EBB98C")
    for x, y, h in [(-1.55, 0.45, 1.85), (0.1, 0.3, 1.3), (0.7, 0.2, 1.0)]:
        cyl(f"post{x}", 0.04, h, (x, y, h / 2), stand)
    # shoppers: glossy marbles at different points along the run
    cols = ["#F28C38", "#A9BE92", "#F4CF6A", "#EDA59B", "#9CC6E4", "#F28C38"]
    for i, t in enumerate([0.08, 0.27, 0.45, 0.62, 0.8]):
        pt = bezier_point(spl, t)
        m = clay(f"marble{i}", cols[i], rough=0.32, sss=0.2)
        ball(f"marble{i}", 0.11, (pt.x, pt.y, pt.z + 0.08), m)
    for i, (x, y, z) in enumerate([(-1.3, 0.62, 3.55), (-1.22, 0.55, 3.3)]):
        ball(f"incoming{i}", 0.085, (x, y, z), clay(f"inc{i}", cols[i + 2], rough=0.32, sss=0.2))
    # the bag
    paper_bag((1.35, -0.2, 0.0), scale=1.6, rot=math.radians(-10))
    ball("in_bag", 0.085, (1.33, -0.2, 0.7), clay("inbag", "#F28C38", rough=0.32))
    # the agent, waving everyone in
    avatar("will", (1.95, 0.6, 0), rot_z=math.radians(-18), height=2.2, animation="waving", progress=0.45)
    products([("cone", "sand", (-2.6, -0.4, 0.12), 1.2), ("capsule", "sage", (-2.2, -0.7, 0.12), 1.1), ("sphere", "blush", (2.9, -0.6, 0.14), 1.1)])
    foc = focus_at((0.3, 0.3, 1.3))
    area("key", 420, 1.6, (1.0, 0.93, 0.84), (-3.0, -3.4, 4.6), foc)
    area("fill", 140, 5.0, (1.0, 0.92, 0.88), (3.6, -3.0, 2.4), foc)
    area("rim", 200, 1.6, (1.0, 0.85, 0.7), (1.0, 3.0, 4.0), foc)
    camera((0.1, -7.6, 2.1), (0.25, 0.4, 1.45), lens=40, dof_obj=foc, fstop=8)


BRANDS = [
    # model, shirt, logo, tint, extra mesh colours, hat
    ("victor", "#2563EB", "nubo", "#DCE6FB", None, None),
    ("teo", "#F7F5F2", "fizzwick", "#F6ECE2", None, "#1F1F1F"),
    ("mia", "#38BDF8", "papaya-white", "#DDF1FB", None, None),
    ("adrian", "#1C1C1E", "zora", "#E9E2DE", None, None),
    ("luca", "#FFC93C", "kumo", "#FBEFC6", None, None),
]


def scene_plinths():
    """K3: every store, its own agent: five branded agents on clay plinths of different heights."""
    rsc._clear_scene()
    world("#f5e6d6", 0.6)
    cyclorama(clay("wall", "#F6E3CF", bump=0.04, scale=12))
    xs = [-2.6, -1.3, 0.0, 1.3, 2.6]
    hs = [0.35, 0.7, 1.0, 0.55, 0.3]
    for (model, shirt, logo, tint, extra, hat), x, h in zip(BRANDS, xs, hs):
        cyl(f"plinth_{model}", 0.5, h, (x, 0.3 + abs(x) * 0.12, h / 2), clay(f"pl_{model}", tint, bump=0.06))
        avatar(model, (x, 0.3 + abs(x) * 0.12, h), rot_z=math.radians(-x * 6), height=1.55, shirt=shirt,
               stamp=ROOT / f"scripts/assets/store-logos/{logo}.png", stamp_scale=1.15, hat=hat,
               animation="idle_neutral", progress=0.5)
    products([("sphere", "blush", (-2.0, -0.9, 0.14), 1.1), ("capsule", "sage", (2.1, -0.9, 0.12), 1.0), ("cone", "butter", (-0.6, -1.2, 0.12), 1.0), ("torus", "sky", (0.9, -1.15, 0.06), 1.0)])
    foc = focus_at((0, 0.3, 1.6))
    area("key", 380, 1.8, (1.0, 0.95, 0.88), (-2.8, -3.6, 4.4), foc)
    area("fill", 160, 6.0, (0.98, 0.94, 0.92), (3.4, -3.2, 2.2), foc)
    area("rim", 220, 2.0, (1.0, 0.88, 0.76), (0.0, 3.2, 4.2), foc)
    camera((0.0, -7.8, 1.9), (0.0, 0.3, 1.45), lens=42, dof_obj=foc, fstop=11)


def scene_widget():
    """K4: the widget as a big clay object: the agent stands in its card, the composer pill and call button in clay."""
    rsc._clear_scene()
    world("#f7dcc3", 0.55)
    cyclorama(clay("wall", "#F5CFA8", bump=0.05, scale=12))
    white = clay("card", "#FFF8F0", bump=0.05)
    box("card", (2.0, 0.34, 2.5), (0.6, 0.85, 1.3), white, bevel=0.14)
    box("stage", (1.76, 0.12, 1.72), (0.6, 0.66, 1.55), clay("stage", "#FDE7D1", bump=0.04), bevel=0.1)
    avatar("amber", (0.6, 0.38, 0.02), height=2.35, animation="waving", progress=0.45)
    # the composer pill, the call button, the volume toggle
    box("composer", (1.78, 0.5, 0.66), (0.6, -0.22, 0.33), clay("pill", "#FFFFFF"), bevel=0.2)
    box("card_base", (2.0, 1.1, 0.5), (0.6, 0.25, 0.25), white, bevel=0.12)
    ball("call", 0.16, (1.25, -0.46, 0.52), clay("callbtn", "#F28C38"), squash=1.0)
    for i, hgt in enumerate([0.06, 0.12, 0.08, 0.13, 0.07]):
        box(f"bar{i}", (0.022, 0.03, hgt * 1.2), (1.17 + i * 0.04, -0.62, 0.52), clay(f"wave{i}", "#FFFFFF"), bevel=0.009)
    ball("volume", 0.1, (1.43, 0.62, 2.42), clay("vol", "#FCD9B6"))
    ring = glow("ring", "#F9A353", 1.4)
    for i, R in enumerate([0.55, 0.72, 0.9]):
        torus(f"ring{i}", R, 0.008, (0.6, 0.45, 1.75), ring, rot=(math.radians(90), 0, 0))
    paper_bag((-1.05, -0.4, 0.0), scale=1.4, rot=math.radians(12))
    products([("capsule", "sage", (-1.75, -0.2, 0.12), 1.3), ("sphere", "blush", (-1.55, -0.95, 0.15), 1.2), ("cone", "butter", (2.25, -0.5, 0.14), 1.4), ("torus", "sky", (2.0, -1.05, 0.06), 1.2), ("cube", "sand", (-2.2, -0.8, 0.1), 1.2)])
    foc = focus_at((0.5, 0.2, 1.4))
    area("key", 420, 1.6, (1.0, 0.93, 0.85), (-2.6, -3.4, 4.2), foc)
    area("fill", 150, 5.0, (1.0, 0.93, 0.9), (3.4, -2.8, 2.2), foc)
    area("rim", 200, 1.6, (1.0, 0.86, 0.72), (1.4, 3.0, 3.6), foc)
    camera((-0.1, -6.6, 1.7), (0.35, 0.3, 1.35), lens=40, dof_obj=foc, fstop=6)


def scene_night():
    """K5: the store at night: everything closed, the agent still there in the lit window, selling."""
    rsc._clear_scene()
    world("#28304f", 0.35)
    cyclorama(clay("ground", "#3B3F63", bump=0.05, scale=12))
    wall = clay("shopwall", "#F3E2CC", bump=0.05)
    box("shop_back", (3.2, 0.3, 2.6), (0, 1.0, 1.3), wall, bevel=0.08)
    box("shop_l", (0.5, 1.4, 2.6), (-1.35, 0.4, 1.3), wall, bevel=0.08)
    box("shop_r", (0.5, 1.4, 2.6), (1.35, 0.4, 1.3), wall, bevel=0.08)
    box("shop_top", (3.4, 1.6, 0.36), (0, 0.4, 2.7), clay("roof", "#E8D2B6"), bevel=0.1)
    box("sill", (2.3, 1.2, 0.5), (0, 0.4, 0.25), wall, bevel=0.06)
    # awning stripes
    for i in range(8):
        col = "#F28C38" if i % 2 == 0 else "#FFF1E2"
        box(f"awn{i}", (0.42, 0.5, 0.12), (-1.48 + i * 0.42, -0.35, 2.35), clay(f"awn{i}", col), bevel=0.04, rot=(math.radians(-18), 0, 0))
    # warm light inside
    inside = bpy.data.lights.new("inside", "AREA")
    inside.energy = 260
    inside.size = 2.0
    inside.color = (1.0, 0.78, 0.5)
    li = bpy.data.objects.new("inside", inside)
    bpy.context.scene.collection.objects.link(li)
    li.location = (0, 0.3, 2.3)
    li.rotation_euler = (0, 0, 0)
    avatar("yusuke", (0.0, 0.55, 0.5), height=1.75, animation="waving", progress=0.45)
    products([("capsule", "sage", (-0.8, -0.05, 0.62), 1.0), ("sphere", "blush", (0.75, -0.05, 0.64), 1.0), ("torus", "butter", (-0.45, -0.1, 0.55), 0.9)])
    # sign
    text3d("sign", "OPEN 24/7", (0, -0.12, 2.98), 0.26, glow("signglow", "#FFB45C", 4.0))
    # moon and a couple of clay stars
    ball("moon", 0.35, (-3.2, 3.6, 4.3), glow("moonglow", "#FFF2D6", 2.5))
    for i, (x, z) in enumerate([(2.6, 4.6), (3.6, 3.9), (-1.9, 4.9), (1.1, 5.2)]):
        ball(f"star{i}", 0.06, (x, 3.8, z), glow(f"st{i}", "#FFE7B0", 3.0))
    foc = focus_at((0, 0.5, 1.3))
    area("moonlight", 220, 4.0, (0.62, 0.7, 1.0), (-3.0, -3.0, 4.0), foc)
    area("fill", 40, 5.0, (0.7, 0.72, 1.0), (3.0, -3.0, 2.0), foc)
    camera((0.0, -7.6, 1.5), (0.0, 0.4, 1.7), lens=38, dof_obj=foc, fstop=8)


SCENES = {"shop": scene_shop, "machine": scene_machine, "plinths": scene_plinths, "widget": scene_widget, "night": scene_night}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", default="shop", choices=list(SCENES))
    ap.add_argument("--out", required=True)
    ap.add_argument("--w", type=int, default=1280)
    ap.add_argument("--h", type=int, default=720)
    ap.add_argument("--samples", type=int, default=96)
    ap.add_argument("--shift", type=float, default=0.0, help="horizontal lens shift: negative moves the scene right, leaving room for copy")
    a = ap.parse_args(argv)
    SCENES[a.scene]()
    bpy.context.scene.camera.data.shift_x = a.shift
    out = Path(a.out)
    if not out.is_absolute():
        out = ROOT / out
    out.parent.mkdir(parents=True, exist_ok=True)
    render(out, a.w, a.h, a.samples)


if __name__ == "__main__":
    main()
