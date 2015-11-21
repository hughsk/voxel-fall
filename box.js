import translate from 'gl-mat4/translate'
import identity from 'gl-mat4/identity'
import scale from 'gl-mat4/scale'
import unindex from 'unindex-mesh'
import normals from 'face-normals'
import Geometry from 'gl-geometry'
import Cube from 'primitive-cube'
import Shader from 'gl-shader'
import eye from 'eye-vector'

const glslify = require('glslify')

export default class Box {
  constructor (gl, world) {
    const positions = unindex(Cube(1))

    this.gl = gl
    this.world = world
    this.model = new Float32Array(16)
    this.geometry = Geometry(gl)
      .attr('position', positions)
      .attr('normal', normals(positions))

    this.eye = new Float32Array(3)
    this.shader = Shader(gl
      , glslify('./chunk.vert')
      , glslify('./chunk-red.frag')
    )
  }

  draw (proj, view, lo, hi) {
    identity(this.model)

    translate(this.model, this.model, [
      (lo[0] + hi[0]) / 2,
      (lo[1] + hi[1]) / 2,
      (lo[2] + hi[2]) / 2
    ])

    scale(this.model, this.model, [
      hi[0] - lo[0],
      hi[1] - lo[1],
      hi[2] - lo[2]
    ])

    this.geometry.bind(this.shader)
    this.shader.uniforms.proj = proj
    this.shader.uniforms.view = view
    this.shader.uniforms.model = this.model
    this.shader.uniforms.eye = eye(view, this.eye)
    this.geometry.draw()
  }

  dispose () {
    this.gl = null
    this.world = null
    this.geometry.dispose()
    this.geometry = null
  }
}
