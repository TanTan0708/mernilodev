import * as THREE from 'three'

// Sizes and positions of things in the world.
// (You can tweak these numbers and see what happens!)

export const EARTH_RADIUS = 5
export const STAND_RADIUS = EARTH_RADIUS + 0.1 // how far from Earth's center the astronaut stands

export const ISLAND_COUNT = 16
export const ISLAND_SIZE = 8 // width of an island model
export const LAND_HEIGHT = 0.8 // how high the "ground" of an island is above its center
export const SHIP_LIFT = 0.8 // how high the ship floats above the ground

// Put the 16 islands in two rings around the Earth: 8 close, 8 far.
export const islandPositions = Array.from({ length: ISLAND_COUNT }, (_, i) => {
  const inOuterRing = i >= 8
  const radius = inOuterRing ? 36 : 22
  // the outer ring is rotated a little so islands don't line up
  const angle = ((i % 8) / 8) * Math.PI * 2 + (inOuterRing ? Math.PI / 8 : 0)
  const height = Math.sin(i * 2) * 5
  return new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius)
})

// The exact spot on each island where the ship lands.
export const landingPoints = islandPositions.map((p) => p.clone().add(new THREE.Vector3(0, LAND_HEIGHT, 0)))
