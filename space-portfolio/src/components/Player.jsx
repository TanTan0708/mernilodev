import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Model from './Model'
import { game } from '../game'
import { EARTH_RADIUS, STAND_RADIUS, SHIP_LIFT, landingPoints, ISLAND_COUNT } from '../layout'

// ----- numbers you can play with -----
const WALK_SPEED = 3 // astronaut speed on Earth
const TURN_SPEED = 2 // astronaut turning speed
const FLY_SPEED = 16 // spaceship speed
const FLY_TURN_SPEED = 1.8 // spaceship turning speed
const ASTRONAUT_SIZE = 1.5
const SHIP_SIZE = 3.5
// If your astronaut/ship model faces the wrong way, change these to Math.PI (half turn)
const ASTRONAUT_ROTATION = Math.PI //this used to be 0 btw
const SHIP_ROTATION = Math.PI //this used to be 0 btw
// ---------------------------------------

const UP = new THREE.Vector3(0, 1, 0)
const RIGHT = new THREE.Vector3(1, 0, 0)

// Where the ship is parked on Earth
const SHIP_HOME_QUAT = new THREE.Quaternion()
  .setFromAxisAngle(RIGHT, -0.5) // slide it 0.5 radians around the Earth
  .multiply(new THREE.Quaternion().setFromAxisAngle(UP, Math.PI / 2)) // turn it sideways
const SHIP_HOME_POS = UP.clone().applyQuaternion(SHIP_HOME_QUAT).multiplyScalar(EARTH_RADIUS + SHIP_LIFT)

function findNearestIsland(position) {
  let nearest = 0
  let nearestDistance = Infinity
  for (let i = 0; i < ISLAND_COUNT; i++) {
    const distance = position.distanceTo(landingPoints[i])
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = i
    }
  }
  return { index: nearest, distance: nearestDistance }
}

export default function Player({ onLand, onTakeOff, onPrompt, islandTitles }) {
  const astronautRef = useRef()
  const bobRef = useRef()
  const shipRef = useRef()

  // Astronaut on Earth: one rotation ("quaternion") says where he is on the ball AND which way he faces.
  const walkQuat = useRef(new THREE.Quaternion())
  // Spaceship in the air
  const flyPos = useRef(new THREE.Vector3())
  const flyYaw = useRef(0)

  const previousMode = useRef('walking')
  const lastPrompt = useRef(null)

  // temporary helpers so we don't create new objects every frame
  const tmp = useRef({
    quat: new THREE.Quaternion(),
    vec: new THREE.Vector3(),
    vec2: new THREE.Vector3(),
    camTarget: new THREE.Vector3(),
    lookTarget: new THREE.Vector3(),
  }).current

  function showPrompt(text) {
    if (lastPrompt.current !== text) {
      lastPrompt.current = text
      onPrompt(text)
    }
  }

  // Put the ship at its parking spot when the page starts
  useEffect(() => {
    shipRef.current.position.copy(SHIP_HOME_POS)
    shipRef.current.quaternion.copy(SHIP_HOME_QUAT)
  }, [])

  // ----- keyboard -----
  useEffect(() => {
    function pressE() {
      const ship = shipRef.current
      const astronaut = astronautRef.current

      if (game.mode === 'walking') {
        // close enough to the ship? get in!
        if (astronaut.position.distanceTo(ship.position) < 4.5) {
          game.mode = 'flying'
          onTakeOff() // closes the About Me popup if it is open
        }
      } else if (game.mode === 'flying') {
        const nearest = findNearestIsland(flyPos.current)
        if (nearest.distance < 10) {
          // land on the island and show its popup
          game.mode = 'landed'
          game.islandIndex = nearest.index
          onLand(nearest.index)
        } else if (flyPos.current.length() < EARTH_RADIUS + 9) {
          // land back on Earth, astronaut goes to the starting spot
          walkQuat.current.identity()
          game.mode = 'walking'
        }
      } else if (game.mode === 'landed') {
        game.mode = 'flying'
        onTakeOff()
      }
    }

    function onKeyDown(event) {
      game.keys[event.code] = true
      if (event.code === 'KeyE' && !event.repeat) pressE()
      // stop the page from scrolling with space / arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault()
      }
    }
    function onKeyUp(event) {
      game.keys[event.code] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onLand, onTakeOff])

  // ----- runs every frame (about 60 times a second) -----
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const keys = game.keys
    const camera = state.camera
    const ship = shipRef.current
    const astronaut = astronautRef.current

    const left = keys.KeyA || keys.ArrowLeft ? 1 : 0
    const right = keys.KeyD || keys.ArrowRight ? 1 : 0
    const forward = keys.KeyW || keys.ArrowUp ? 1 : 0
    const backward = keys.KeyS || keys.ArrowDown ? 1 : 0
    const turn = left - right
    const move = forward - backward

    // Just switched to flying? Start from where the ship is, a bit above the ground.
    if (game.mode !== previousMode.current) {
      if (game.mode === 'flying') {
        tmp.vec.copy(UP).applyQuaternion(ship.quaternion).multiplyScalar(2)
        flyPos.current.copy(ship.position).add(tmp.vec)
        if (previousMode.current === 'walking') flyYaw.current = 0
      }
      previousMode.current = game.mode
    }

    // =========== WALKING ON EARTH ===========
    if (game.mode === 'walking') {
      const q = walkQuat.current

      if (turn) q.multiply(tmp.quat.setFromAxisAngle(UP, turn * TURN_SPEED * delta))
      if (move) q.multiply(tmp.quat.setFromAxisAngle(RIGHT, (-move * WALK_SPEED * delta) / EARTH_RADIUS))
      q.normalize()

      // "up" for the astronaut = straight away from Earth's center
      const up = tmp.vec.copy(UP).applyQuaternion(q)
      astronaut.visible = true
      astronaut.position.copy(up).multiplyScalar(STAND_RADIUS)
      astronaut.quaternion.copy(q)

      // little walking bounce
      const bounce = move ? Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1 : 0
      bobRef.current.position.y = ASTRONAUT_SIZE / 2 + bounce

      // ship goes back to its parking spot (smoothly)
      ship.position.lerp(SHIP_HOME_POS, 0.08)
      ship.quaternion.slerp(SHIP_HOME_QUAT, 0.08)

      // camera sits behind and above the astronaut
      const back = tmp.vec2.set(0, 0, 1).applyQuaternion(q)
      tmp.camTarget.copy(astronaut.position).addScaledVector(up, 3.5).addScaledVector(back, 7)
      camera.position.lerp(tmp.camTarget, 0.08)
      camera.up.lerp(up, 0.08).normalize()
      tmp.lookTarget.copy(astronaut.position).addScaledVector(up, 1)
      camera.lookAt(tmp.lookTarget)

      // prompt
      if (astronaut.position.distanceTo(ship.position) < 4.5) {
        showPrompt('Press E to board the spaceship')
      } else {
        showPrompt(null)
      }
    }

    // =========== FLYING THE SHIP ===========
    if (game.mode === 'flying') {
      astronaut.visible = false
      flyYaw.current += turn * FLY_TURN_SPEED * delta

      // the direction the ship is pointing
      const yaw = flyYaw.current
      const direction = tmp.vec.set(-Math.sin(yaw), 0, -Math.cos(yaw))

      flyPos.current.addScaledVector(direction, move * FLY_SPEED * delta)
      if (keys.Space) flyPos.current.y += 9 * delta
      if (keys.ShiftLeft || keys.ShiftRight) flyPos.current.y -= 9 * delta

      // don't fly into the Earth
      if (flyPos.current.length() < EARTH_RADIUS + 1.5) {
        flyPos.current.setLength(EARTH_RADIUS + 1.5)
      }

      ship.position.copy(flyPos.current)
      ship.quaternion.slerp(tmp.quat.setFromAxisAngle(UP, yaw), 0.1)

      // camera behind the ship
      tmp.camTarget.copy(flyPos.current).addScaledVector(direction, -11)
      tmp.camTarget.y += 4.5
      camera.position.lerp(tmp.camTarget, 0.08)
      camera.up.lerp(UP, 0.1).normalize()
      tmp.lookTarget.copy(flyPos.current).addScaledVector(direction, 4)
      camera.lookAt(tmp.lookTarget)

      // prompt
      const nearest = findNearestIsland(flyPos.current)
      if (nearest.distance < 10) {
        showPrompt(`Press E to land on "${islandTitles[nearest.index]}"`)
      } else if (flyPos.current.length() < EARTH_RADIUS + 9) {
        showPrompt('Press E to land on Earth')
      } else {
        showPrompt(null)
      }
    }

    // =========== PARKED ON AN ISLAND ===========
    if (game.mode === 'landed') {
      const land = landingPoints[game.islandIndex]

      // ship settles onto the island
      tmp.vec.copy(land).add(tmp.vec2.set(0, SHIP_LIFT, 0))
      ship.position.lerp(tmp.vec, 0.08)
      ship.quaternion.slerp(tmp.quat.setFromAxisAngle(UP, flyYaw.current), 0.08)

      // astronaut stands next to the ship, looking toward the camera
      astronaut.visible = true
      astronaut.position.set(land.x + 2.8, land.y + 0.1, land.z + 1.5)
      astronaut.quaternion.setFromAxisAngle(UP, Math.PI)
      bobRef.current.position.y = ASTRONAUT_SIZE / 2

      // camera looks at the island from the front, shifted so the island appears on the left
      tmp.camTarget.set(land.x, land.y + 5, land.z + 14)
      camera.position.lerp(tmp.camTarget, 0.06)
      camera.up.lerp(UP, 0.1).normalize()
      tmp.lookTarget.set(land.x + 5, land.y + 1, land.z)
      camera.lookAt(tmp.lookTarget)

      showPrompt('Press E to take off')
    }
  })

  return (
    <>
      {/* ---------- SPACESHIP ---------- */}
      <group ref={shipRef}>
        <Model names={['spaceship', 'ship']} size={SHIP_SIZE} rotationY={SHIP_ROTATION}>
          {/* placeholder ship: grey body, orange nose, two wings. The nose points forward (-z). */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.8, 2.6, 10]} />
            <meshStandardMaterial color="#d9dde8" flatShading />
          </mesh>
          <mesh position={[0, 0, -1.9]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.6, 1.2, 10]} />
            <meshStandardMaterial color="#ff7a45" flatShading />
          </mesh>
          <mesh position={[0, -0.2, 0.6]}>
            <boxGeometry args={[3.2, 0.12, 0.9]} />
            <meshStandardMaterial color="#5b7cfa" flatShading />
          </mesh>
          <mesh position={[0, 0.3, -0.4]}>
            <sphereGeometry args={[0.4, 10, 10]} />
            <meshStandardMaterial color="#6fd3ff" flatShading />
          </mesh>
        </Model>
      </group>

      {/* ---------- ASTRONAUT ---------- */}
      <group ref={astronautRef}>
        {/* bobRef lifts him up so his feet touch the ground, and bounces while walking */}
        <group ref={bobRef} position={[0, ASTRONAUT_SIZE / 2, 0]}>
          <Model names={['astronaut']} size={ASTRONAUT_SIZE} rotationY={ASTRONAUT_ROTATION}>
            {/* placeholder astronaut: white body, round head, dark visor, backpack. Faces forward (-z). */}
            <mesh position={[0, -0.15, 0]}>
              <capsuleGeometry args={[0.3, 0.5, 4, 10]} />
              <meshStandardMaterial color="#f4f4f8" flatShading />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.32, 12, 12]} />
              <meshStandardMaterial color="#f4f4f8" flatShading />
            </mesh>
            <mesh position={[0, 0.52, -0.2]}>
              <sphereGeometry args={[0.2, 10, 10]} />
              <meshStandardMaterial color="#2b2f4a" flatShading />
            </mesh>
            <mesh position={[0, -0.05, 0.32]}>
              <boxGeometry args={[0.45, 0.6, 0.2]} />
              <meshStandardMaterial color="#9aa3c7" flatShading />
            </mesh>
          </Model>
        </group>
      </group>
    </>
  )
}
