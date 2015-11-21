import Noise from 'simplex-noise'

const noise = new Noise()

export default function terrain (x, y, z) {
  x *= 0.05
  y *= 0.05
  z *= 0.05

  return noise.noise3D(x, y, z) - 0.5
}
