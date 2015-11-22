import Noise from 'simplex-noise'

const noise = new Noise()

export default function terrain (x, y, z) {
  x *= 0.04
  y *= 0.04
  z *= 0.04

  return (
    // noise.noise3D(x, y, z) +
    noise.noise3D(x * 0.5, y * 0.5, z * 0.5)
  ) - 0.3 - Math.max(0, y * 3)
}
