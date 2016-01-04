import Noise from 'simplex-noise'
import random from './random'

const noise = new Noise(random)

export default function terrain (x, y, z) {
  x *= 0.04
  y *= 0.04
  z *= 0.04

  return (
    // noise.noise3D(x, y, z) +
    noise.noise3D(x * 0.5, y * 0.5, z * 0.5) +
    noise.noise3D(x * 4.1, y * 4.1, z * 4.1) * 0.15
  ) - 0.3 - Math.max(0, y * 3)
}
