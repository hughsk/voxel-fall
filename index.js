import perspective from 'gl-mat4/perspective'
import Camera from 'canvas-orbit-camera'
import getEye from 'eye-vector'
import Sphere from './sphere'
import mesher from './mesher'
import Chunk from './chunk'
import raf from 'raf'

const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = Camera(canvas)
const gl = canvas.getContext('webgl')
const sphere = new Sphere(gl)

camera.distance = 4

const chunks = {}
const CHUNK_SIZE = 12

const proj = new Float32Array(16)
const view = new Float32Array(16)

render()
function render () {
  const { width, height } = canvas

  gl.viewport(0, 0, width, height)
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  perspective(proj, Math.PI / 4, width / height, 0.5, 500)
  camera.view(view)
  camera.tick()

  const eye = getEye(view)
  const currChunk0 = Math.round(eye[2] / CHUNK_SIZE)
  const currChunk1 = Math.round(eye[1] / CHUNK_SIZE)
  const currChunk2 = Math.round(eye[0] / CHUNK_SIZE)
  const chunkRadius = 3

  for (var key in chunks) {
    if (!chunks.hasOwnProperty(key)) continue
    chunks[key].safe = false
  }

  for (var x = currChunk0 - chunkRadius; x <= currChunk0 + chunkRadius; x++) {
    for (var y = currChunk1 - chunkRadius; y <= currChunk1 + chunkRadius; y++) {
      for (var z = currChunk2 - chunkRadius; z <= currChunk2 + chunkRadius; z++) {
        var key = x + '|' + y + '|' + z
        if (!chunks[key]) {
          chunks[key] = new Chunk(gl, mesher(
            [x * CHUNK_SIZE, y * CHUNK_SIZE, z * CHUNK_SIZE],
            [x * CHUNK_SIZE + CHUNK_SIZE, y * CHUNK_SIZE + CHUNK_SIZE, z * CHUNK_SIZE + CHUNK_SIZE]
          ))
        }

        chunks[key].safe = true
      }
    }
  }

  for (var key in chunks) {
    if (!chunks.hasOwnProperty(key)) continue
    var chunk = chunks[key]

    if (!chunks[key].safe) {
      chunks[key].dispose()
      delete chunks[key]
      continue
    }

    chunk.bind(proj, view)
    chunk.draw(proj, view)
  }

  sphere.draw(proj, view, [0, 0, 0])

  raf(render)
}

window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)
