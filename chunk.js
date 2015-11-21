import Geometry from 'gl-geometry'
import unindex from 'unindex-mesh'
import Shader from 'gl-shader'

const glslify = require('glslify')

export default class Chunk {
  constructor (gl, data) {
    this.gl = gl
    this.geometry = Geometry(gl)
      .attr('position', data.mesh)

    this.shader = Shader(gl
      , glslify('./chunk.vert')
      , glslify('./chunk.frag')
    )
  }

  bind () {
    this.geometry.bind(this.shader)
  }

  draw (proj, view) {
    this.shader.uniforms.proj = proj
    this.shader.uniforms.view = view
    this.geometry.draw()
  }
}
