import translate from 'gl-mat4/translate'
import identity from 'gl-mat4/identity'
import wireframe from 'gl-wireframe'
import Geometry from 'gl-geometry'
import normals from 'face-normals'
import unindex from 'unindex-mesh'
import Shader from 'gl-shader'

const glslify = require('glslify')

export default class Chunk {
  constructor (gl, data) {
    const positions = unindex(data.mesh)

    this.gl = gl
    this.geometry = Geometry(gl)
      .attr('position', positions)
      .attr('normal', normals(positions))

    this.shader = Shader(gl
      , glslify('./chunk.vert')
      , glslify('./chunk.frag')
    )

    this.model = identity(new Float32Array(16))
    translate(this.model, this.model, [
      +data.lo[2],
      +data.lo[1],
      +data.lo[0]
    ])
  }

  bind (proj, view) {
    this.geometry.bind(this.shader)
    this.shader.uniforms.proj = proj
    this.shader.uniforms.view = view
  }

  draw (proj, view) {
    this.shader.uniforms.model = this.model
    this.gl.lineWidth(10)
    this.geometry.draw()
  }
}
