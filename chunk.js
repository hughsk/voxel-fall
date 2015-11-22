import translate from 'gl-mat4/translate'
import identity from 'gl-mat4/identity'
import wireframe from 'gl-wireframe'
import Geometry from 'gl-geometry'
import normals from 'face-normals'
import unindex from 'unindex-mesh'
import Shader from 'gl-shader'
import eye from 'eye-vector'

const glslify = require('glslify')
var shader

export default class Chunk {
  constructor (gl, data) {
    const positions = unindex(data.mesh)

    this.gl = gl
    this.geometry = Geometry(gl)
      .attr('position', positions)
      .attr('normal', normals(positions))

    this.shader = shader = shader || Shader(gl
      , glslify('./chunk.vert')
      , glslify('./chunk-terrain.frag')
    )

    this.eye = new Float32Array(3)
    this.disposed = false
    this.model = identity(new Float32Array(16))
    translate(this.model, this.model, [
      +data.lo[2],
      +data.lo[1],
      +data.lo[0]
    ])
  }

  bind (proj, view) {
    if (this.disposed) return
    this.geometry.bind(this.shader)
    this.shader.uniforms.proj = proj
    this.shader.uniforms.view = view
    this.shader.uniforms.eye = eye(view, this.eye)
  }

  draw (proj, view) {
    if (this.disposed) return
    this.shader.uniforms.model = this.model
    this.geometry.draw()
  }

  dispose () {
    this.disposed = true
    this.geometry.dispose()
    this.geometry = null
    this.shader = null
  }
}
