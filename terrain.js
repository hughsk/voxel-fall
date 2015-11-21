import Noise from 'simplex-noise'

const noise = new Noise()

export default function terrain (x, y, z) {
  x *= 0.04
  y *= 0.04
  z *= 0.04

  return noise.noise3D(x, y, z) - 0.3 - y * 10 - 2
}
