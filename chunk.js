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
  }

  bind () {
    this.geometry.bind(this.shader)
  }

  draw (proj, view) {
    this.shader.uniforms.proj = proj
    this.shader.uniforms.view = view
    this.gl.lineWidth(10)
    this.geometry.draw()
  }
}
