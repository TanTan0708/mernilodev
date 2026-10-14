import { useMemo } from 'react'
import * as THREE from 'three'
import Model from './Model'
import { EARTH_RADIUS } from '../layout'

// Directions of the little green "land" patches on the placeholder Earth
const landPatches = [
  [0, 1, 0.15],
  [1, 0.6, 0.2],
  [-0.8, 0.5, 0.7],
  [0.3, -0.2, -1],
  [-0.5, 0.7, -0.6],
  [0.7, -0.6, 0.5],
  [-1, -0.3, 0],
]

export default function Earth() {
  const patches = useMemo(
    () =>
      landPatches.map((direction) => {
        const dir = new THREE.Vector3(...direction).normalize()
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
        const position = dir.clone().multiplyScalar(EARTH_RADIUS - 0.02)
        return { position, quaternion }
      }),
    []
  )

  return (
    <Model names={['earth']} size={EARTH_RADIUS * 2}>
      {/* placeholder Earth: blue ball + green patches */}
      <mesh>
        <icosahedronGeometry args={[EARTH_RADIUS, 3]} />
        <meshStandardMaterial color="#3d8bd9" flatShading />
      </mesh>
      {patches.map((patch, i) => (
        <mesh key={i} position={patch.position} quaternion={patch.quaternion}>
          <cylinderGeometry args={[1.5, 1.7, 0.2, 7]} />
          <meshStandardMaterial color="#5fbf5a" flatShading />
        </mesh>
      ))}
    </Model>
  )
}
