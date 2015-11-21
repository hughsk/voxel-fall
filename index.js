import perspective from 'gl-mat4/perspective'
import Camera from 'canvas-orbit-camera'
import mesher from './mesher'
import Chunk from './chunk'
import raf from 'raf'

const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = Camera(canvas)
const gl = canvas.getContext('webgl')

const data = mesher([-16, -16, -16], [16, 16, 16])
const chunk = new Chunk(gl, data)
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

  perspective(proj, Math.PI / 4, width / height, 0.1, 100)
  camera.view(view)
  camera.tick()

  chunk.bind()
  chunk.draw(proj, view)
}

window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)
