import Noise from 'simplex-noise'

const noise = new Noise()

export default function terrain (x, y, z) {
  x *= 0.01
  y *= 0.01
  z *= 0.01

  return noise.noise3D(x, y, z) - 0.5
}
