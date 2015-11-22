import perspective from 'gl-mat4/perspective'
import pressed from 'key-pressed'
import clamp from 'clamp'
import ortho from 'gl-mat4/ortho'
import Camera from 'canvas-orbit-camera'
import lookAt from 'gl-mat4/lookAt'
import getEye from 'eye-vector'
import raf from 'raf'
import CANNON from 'cannon'
import Timer from 'delta-timer'

import Sphere from './sphere'
import mesher from './mesher'
import Chunk from './chunk'
import Box from './box'

const canvas = document.body.appendChild(document.createElement('canvas'))
const camera = Camera(canvas)
const gl = canvas.getContext('webgl')
const sphere = new Sphere(gl)
const box = new Box(gl)
camera.distance = 4

let badBallStrength = 0.8

let gameOver = false

// Physics
const world = new CANNON.World()
world.quatNormalizeFast = true;
world.quatNormalizeSkip = 0;
world.broadphase.useBoundingBoxes = true;
world.gravity = new CANNON.Vec3(0, -9.82, 0)
world.broadphase = new CANNON.NaiveBroadphase();
var solver = new CANNON.GSSolver();
solver.iterations = 2;
world.defaultContactMaterial.contactEquationRegularizationTime = 0.55;
solver.tolerance = 0.01;
world.solver = solver

world.quatNormalizeFast = true;
world.quatNormalizeSkip = 0;
world.broadphase.useBoundingBoxes = true;

world.defaultContactMaterial.friction = 0.7
world.defaultContactMaterial.restitution = 0.0
world.defaultContactMaterial.contactEquationStiffness = 1e9;
world.defaultContactMaterial.contactEquationRegularizationTime = 4;

const timer = Timer()
const TIME_STEP = 1.0 / 60.0 // seconds
const MAX_SUB_STEPS = 1
const MAX_VELOCITY = 10

const ball = makeBall([0, 10, 0])
const badBall = makeBall([-10, 20, 0], 20)

window.CANNON = CANNON
window.world = world
window.ball = ball
window.badBall = badBall

// Chunks
const chunks = {}
const CHUNK_SIZE = 16
const CHUNK_RADIUS = 2
const proj = new Float32Array(16)
const view = new Float32Array(16)
const start = Date.now()

var fov = Math.PI / 4

render()

function render () {

  // Physics
  world.step(TIME_STEP, timer(), MAX_SUB_STEPS)

  const { width, height } = canvas

  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0.1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  const fovMin = Math.PI / 5
  const fovMax = Math.PI / 3
  const ratio = clamp(ball.velocity.y * -0.1, -1, 1)
  const fovTar = fovMin + (fovMax - fovMin) * ratio

  fov += (fovTar - fov) * 0.025

  perspective(proj, fov, width / height, 0.5, 500)
  camera.view(view)
  camera.tick()
  camera.center = [ball.position.x,  ball.position.y, ball.position.z]

  lookAt(view, [ball.position.x, ball.position.y + 20, ball.position.z - 0.1], [ball.position.x, ball.position.y, ball.position.z], [0, 1, 0])

  const eye = getEye(view)
  const currChunk0 = Math.round(camera.center[2] / CHUNK_SIZE)
  const currChunk1 = Math.round(camera.center[1] / CHUNK_SIZE)
  const currChunk2 = Math.round(camera.center[0] / CHUNK_SIZE)

  for (var key in chunks) {
    if (!chunks.hasOwnProperty(key)) continue
    chunks[key].safe = false
  }

  for (var x = currChunk0 - CHUNK_RADIUS; x <= currChunk0 + CHUNK_RADIUS; x++) {
    for (var y = currChunk1 - CHUNK_RADIUS; y <= currChunk1 + CHUNK_RADIUS; y++) {
      for (var z = currChunk2 - CHUNK_RADIUS; z <= currChunk2 + CHUNK_RADIUS; z++) {
        var key = x + '|' + y + '|' + z
        if (!chunks[key]) {
          chunks[key] = new Chunk(gl, world, mesher(
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

    chunk.bind(proj, view, camera.center, [badBall.position.x, badBall.position.y, badBall.position.z])
    chunk.draw(proj, view)
    for (var i = 0; i < chunk.boxes.length; i++) {
      const boxEntity = chunk.boxes[i]
      box.draw(proj, view, [boxEntity.position.x, boxEntity.position.y, boxEntity.position.z], [boxEntity.quaternion.x, boxEntity.quaternion.y, boxEntity.quaternion.z, boxEntity.quaternion.w])
    }
  }

  //for (var i = 0, l = world.bodies.length; i < l; i++) {
    //var v = world.bodies[i];
    //if (v === ball) continue
    //v.computeAABB()
    //const {lowerBound, upperBound} = v.aabb
    //const p = v.position
  //}

  sphere.draw(proj, view, [1.8, 0.7, 0.4], [ball.position.x, ball.position.y, ball.position.z], [ball.quaternion.x, ball.quaternion.y, ball.quaternion.z, ball.quaternion.w])
  sphere.draw(proj, view, [0.3, 0.8, 1.8], [badBall.position.x, badBall.position.y, badBall.position.z], [badBall.quaternion.x, badBall.quaternion.y, badBall.quaternion.z, badBall.quaternion.w])
  if (gameOver) return
  const lr = pressed('<right>') - pressed('<left>')
  const ud = pressed('<up>') - pressed('<down>')
  const jump = pressed('<space>')
  const d = badBall.position.vsub(ball.position).unit().mult(badBallStrength)
  badBall.velocity.set(
    Math.max(Math.min(badBall.velocity.x - d.x, MAX_VELOCITY), -MAX_VELOCITY),
    Math.max(Math.min(badBall.velocity.y - d.y, MAX_VELOCITY), -MAX_VELOCITY),
    Math.max(Math.min(badBall.velocity.z - d.z, MAX_VELOCITY), -MAX_VELOCITY)
  )

  ball.applyForce(new CANNON.Vec3(-lr, jump, ud).mult(100), ball.position);

  ball.velocity.set(
    Math.max(Math.min(ball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
    Math.max(Math.min(ball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
    Math.max(Math.min(ball.velocity.z, MAX_VELOCITY), -MAX_VELOCITY)
  )

  raf(render)
}

let boxesCollected = 0
ball.addEventListener("collide",function(e){
  if (e.body.isBox) {
    const b = e.body
    score.innerText = `Score: ${++boxesCollected}`
    setTimeout(() => {
      b.chunk.removeBox(b)
    })
  } else if (e.body === badBall) {
    if (gameOver) return
    setTimeout(() => {
      gameOver = true
      setTimeout(() => {
        location.reload()
      }, 1000)
    }, 50)
  }
})

function makeBall(position, mass = 5) {
  // Create a sphere
  var radius = 1; // m
  var sphereBody = new CANNON.Body({
    mass, // kg
    position: new CANNON.Vec3(...position), // m
    shape: new CANNON.Sphere(radius),
    linearDamping: 0.1,
  })
  sphereBody.angularVelocity.set(Math.random(), Math.random(), Math.random())
  world.addBody(sphereBody)
  return sphereBody
}

window.ball = ball
window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)

const score = document.createElement('div')
score.setAttribute('style', `
  position: absolute;
  left: 50%;
  bottom: 2rem;
  transform: translate(-50%, 0);
  pointer-events: none;
  font-family: 'Input Sans', sans-serif;
  font-weight: 100;
  font-size: 0.95em;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.85);
  text-transform: uppercase;
  color: #53ffa7;
`)
score.innerText = 'Score: 0'
document.body.appendChild(score)
