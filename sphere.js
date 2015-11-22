import translate from 'gl-mat4/translate'
import identity from 'gl-mat4/identity'
import fromRotationTranslation from 'gl-mat4/fromRotationTranslation'
import unindex from 'unindex-mesh'
import normals from 'face-normals'
import Geometry from 'gl-geometry'
import icosphere from 'icosphere'
import Shader from 'gl-shader'
import eye from 'eye-vector'

const glslify = require('glslify')
const scratch = new Float32Array(16)

export default class Sphere {
  constructor (gl, world) {
    const positions = unindex(icosphere(1))

    this.gl = gl
    this.world = world
    this.model = new Float32Array(16)
    this.geometry = Geometry(gl)
      .attr('position', positions)
      .attr('normal', normals(positions))

    this.eye = new Float32Array(3)
    this.shader = Shader(gl
      , glslify('./chunk.vert')
      , glslify('./chunk.frag')
    )
  }

  draw (proj, view, position, rotation) {
    identity(this.model)
    fromRotationTranslation(this.model, rotation, position)
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
