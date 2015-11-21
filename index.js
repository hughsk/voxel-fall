import perspective from 'gl-mat4/perspective'
import Camera from 'canvas-orbit-camera'
import mesher from './mesher'
import Chunk from './chunk'
import raf from 'raf'

const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = Camera(canvas)
const gl = canvas.getContext('webgl')

const chunks = {}

for (var x = -2; x <= 1; x++) {
  for (var y = -2; y <= 1; y++) {
    for (var z = -2; z <= 1; z++) {
      chunks[x+','+y+','+z] = new Chunk(gl, mesher(
        [(x+0) * 16, (y+0) * 16, (z+0) * 16],
        [(x+1) * 16, (y+1) * 16, (z+1) * 16]
      ))
    }
  }
}

// const chunks = {
//   '0,0,0': new Chunk(gl, mesher([-16, -16, -16], [16, 16, 16])),
//   '0,0,1': new Chunk(gl, mesher([-16, -16, 16], [16, 16, 48])),
//   '0,1,0': new Chunk(gl, mesher([-16, 16, -16], [16, 48, 16]))
// }

const proj = new Float32Array(16)
const view = new Float32Array(16)

render()
function render () {
  raf(render)

  const { width, height } = canvas

  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)

  perspective(proj, Math.PI / 4, width / height, 0.5, 500)
  camera.view(view)
  camera.tick()

  for (var key in chunks) {
    if (!chunks.hasOwnProperty(key)) continue
    var chunk = chunks[key]

    chunk.bind(proj, view)
    chunk.draw(proj, view)
  }
}

window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)
