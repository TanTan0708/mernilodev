import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Model from './Model'

// name     -> the model file name to look for (sun.glb, mercury.glb, ...)
// position -> where it floats in the background [x, y, z]
// size     -> how big it is
const planets = [
  { name: 'sun', position: [-120, 40, -220], size: 70, color: '#ffb02e', isSun: true },
  { name: 'mercury', position: [45, 12, -90], size: 3, color: '#a8a29e' },
  { name: 'venus', position: [-55, -18, -85], size: 6, color: '#e8b87a' },
  { name: 'mars', position: [75, -15, -70], size: 5, color: '#d9603b' },
  { name: 'jupiter', position: [120, 35, -140], size: 28, color: '#d8a47f' },
  { name: 'saturn', position: [-105, -35, -130], size: 22, color: '#e6d3a3', hasRing: true },
  { name: 'uranus', position: [-30, 55, -115], size: 12, color: '#8fe3e8' },
  { name: 'neptune', position: [60, -55, -160], size: 11, color: '#4b6ef5' },
]

function Planet({ name, position, size, color, isSun, hasRing }) {
  const spinRef = useRef()

  // spin slowly
  useFrame((state, delta) => {
    spinRef.current.rotation.y += delta * 0.1
  })

  return (
    <group position={position}>
      <group ref={spinRef}>
        <Model names={[name]} size={size}>
          {/* placeholder: a simple ball (and a ring for Saturn) */}
          <mesh>
            <sphereGeometry args={[size / 2, 24, 24]} />
            {isSun ? (
              <meshBasicMaterial color={color} />
            ) : (
              <meshStandardMaterial color={color} flatShading />
            )}
          </mesh>
          {hasRing && (
            <mesh rotation={[Math.PI / 2.4, 0, 0]}>
              <ringGeometry args={[size * 0.65, size * 0.95, 40]} />
              <meshBasicMaterial color="#cdbb8f" side={2} />
            </mesh>
          )}
        </Model>
      </group>
    </group>
  )
}

export default function Planets() {
  return (
    <>
      {planets.map((planet) => (
        <Planet key={planet.name} {...planet} />
      ))}
    </>
  )
}
