import wireframe from 'gl-wireframe'
import greedy from 'greedy-mesher'
import combine from 'mesh-combine'
import Box from 'primitive-cube'
import terrain from './terrain'
import ndarray from 'ndarray'

const mesher = greedy({
  order: [0, 1, 2],
  extraArgs: 1,
  skip: (value) => value <= 0,
  merge: (a, b) => a > 0 && b > 0,
  append: function (xlo, ylo, zlo, xhi, yhi, zhi, val, output) {
    const mesh = Box(1)
    const xd = xhi - xlo
    const yd = yhi - ylo
    const zd = zhi - zlo

    const pos = mesh.positions

    for (var i = 0; i < pos.length; i++) {
      pos[i][0] = pos[i][0] === -0.5 ? xlo : xhi
      pos[i][1] = pos[i][1] === -0.5 ? ylo : yhi
      pos[i][2] = pos[i][2] === -0.5 ? zlo : zhi
    }


    output.push({ mesh })
  }
})

export default function generate (lo, hi) {
  const dims = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]]
  const size = dims[0] * dims[1] * dims[2]
  const data = new Float32Array(size)

  var i = 0
  for (var z = lo[2]; z < hi[2]; z++) {
    for (var y = lo[1]; y < hi[1]; y++) {
      for (var x = lo[0]; x < hi[0]; x++) {
        data[i++] = terrain(x, y, z)
      }
    }
  }

  var array = ndarray(data, dims)
  var output = []

  mesher(array, output)

  var mesh = combine(output.map(d => d.mesh))

  return {
    mesh: mesh,
    lo: lo,
    hi: hi
  }
}
