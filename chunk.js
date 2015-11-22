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

const norm = identity(new Float32Array(16))

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
    this.physics = data.body
    this.boxes = []

    for (let i = 0; i < data.boxes.length; i++) {
      const box = makeBox(data.boxes[i])
      box.chunk = this
      this.boxes.push(box)
      this.world.addBody(box)
    }

    this.world.addBody(this.physics)

  }

  bind (proj, view, light, badLight) {
    if (this.disposed) return
    this.geometry.bind(this.shader)
    this.shader.uniforms.proj = proj
    this.shader.uniforms.view = view
    this.shader.uniforms.norm = norm
    this.shader.uniforms.eye = eye(view, this.eye)
    this.shader.uniforms.light1 = light
    this.shader.uniforms.light2 = badLight
  }

  removeBox (box) {
    const i = this.boxes.indexOf(box)
    var f = this.boxes.length
    if (i === -1) return
    this.world.removeBody(box)
    this.boxes.splice(i, 1)
    console.log('boxes', f, this.boxes.length)
  }

  draw (proj, view) {
    if (this.disposed) return
    this.shader.uniforms.model = this.model
    this.geometry.draw()
  }

  dispose () {
    this.disposed = true
    this.geometry.dispose()
    this.world.removeBody(this.physics)
    this.boxes.forEach(box => {
      this.world.removeBody(box)
    })
    this.boxes = null
    this.world = null
    this.geometry = null
    this.shader = null
    this.physics = null
  }
}


function makeBox(pos) {
  const box = new CANNON.Body({
    allowSleep: true,
    mass: 10, // kg
    position: new CANNON.Vec3(pos[0], pos[1], pos[2]), // m
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    linearDamping: 0.1,
    velocity: new CANNON.Vec3(2 * Math.random(), Math.random(), 5 * Math.random())
  })
  box.isBox = true
  return box
}


