import translate from 'gl-mat4/translate'
import identity from 'gl-mat4/identity'
import wireframe from 'gl-wireframe'
import Geometry from 'gl-geometry'
import normals from 'face-normals'
import unindex from 'unindex-mesh'
import Shader from 'gl-shader'
import eye from 'eye-vector'
import CANNON from 'cannon'
import glVec3 from 'gl-vec3'

const glslify = require('glslify')
var shader

export default class Chunk {
  constructor (gl, world, data) {
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

    // Physics
    this.world = world
    this.physics = data.bodies
    this.physics.forEach(b => world.addBody(b))
  }

  bind (proj, view) {
    if (this.disposed) return
    this.geometry.bind(this.shader)
    this.shader.uniforms.proj = proj
    this.shader.uniforms.view = view
    this.shader.uniforms.eye = eye(view, this.eye)
    this.shader.uniforms.light = [0, 0, 0]
  }

  draw (proj, view) {
    if (this.disposed) return
    this.shader.uniforms.model = this.model
    this.geometry.draw()
  }

  dispose () {
    this.disposed = true
    this.geometry.dispose()
    this.physics.forEach(b => {
      this.world.removeBody(b)
    })
    this.world = null
    this.geometry = null
    this.shader = null
    this.physics = null
  }
}
