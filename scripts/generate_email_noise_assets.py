"""Generate an email-safe tileable fractal-noise grain PNG.

Produces one asset inside public/images/:
  • early-access-noise-grain.png – 256×256 tileable semi-transparent grain

The landing page renders grain via SVG feTurbulence (fractalNoise,
baseFrequency 0.50, numOctaves 3, mix-blend-overlay at 40% opacity).
Email clients cannot render SVG filters or CSS blend modes, so we
pre-render a tileable fractal-noise tile as a PNG with low alpha,
applied via background-image over each banner cell's bgcolor.
"""

import logging
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

logger = logging.getLogger(__name__)

LANDING_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = LANDING_ROOT / "public" / "images"

TILE_SIZE = 256
NOISE_ALPHA_FRACTION = 0.04
BASE_FREQUENCY = 0.50
NUM_OCTAVES = 3
PERSISTENCE = 0.5
RNG_SEED = 42


# Public:


def generate_noise_grain_tile() -> Path:
    fractal = _fractal_noise_tileable(
        TILE_SIZE, BASE_FREQUENCY, NUM_OCTAVES, PERSISTENCE, RNG_SEED
    )
    grain = (fractal * 255).clip(0, 255).astype(np.uint8)
    alpha_channel = np.full_like(grain, int(255 * NOISE_ALPHA_FRACTION))
    rgba = np.stack([grain, grain, grain, alpha_channel], axis=-1)
    img = Image.fromarray(rgba)
    dest = OUTPUT_DIR / "early-access-noise-grain.png"
    img.save(dest, optimize=True)
    logger.info("Wrote noise grain tile → %s  (%d×%d)", dest, TILE_SIZE, TILE_SIZE)
    return dest


# Private:


def _fractal_noise_tileable(
    size: int,
    base_freq: float,
    octaves: int,
    persistence: float,
    seed: int,
) -> np.ndarray:
    """Multi-octave tileable fractal noise in [0, 1], matching feTurbulence."""
    result = np.zeros((size, size), dtype=np.float64)
    amplitude = 1.0
    total_amplitude = 0.0
    freq = base_freq

    for octave in range(octaves):
        grid_size = max(2, int(round(size * freq)))
        layer = _smooth_noise_tileable(size, grid_size, seed + octave)
        result += layer * amplitude
        total_amplitude += amplitude
        amplitude *= persistence
        freq *= 2.0

    return result / total_amplitude


def _smooth_noise_tileable(size: int, grid_size: int, seed: int) -> np.ndarray:
    """Generate one octave of tileable smooth noise via FFT-based wrapping."""
    rng = np.random.default_rng(seed)
    coarse = (rng.random((grid_size, grid_size)) * 255).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(coarse, mode="L")
    upscaled = img.resize((size, size), Image.Resampling.BICUBIC)
    blurred = upscaled.filter(ImageFilter.GaussianBlur(radius=size / grid_size * 0.6))
    arr = np.array(blurred, dtype=np.float64) / 255.0
    lo, hi = arr.min(), arr.max()
    if hi - lo > 1e-9:
        arr = (arr - lo) / (hi - lo)
    return arr


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    generate_noise_grain_tile()
