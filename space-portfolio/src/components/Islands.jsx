import { Html } from '@react-three/drei'
import Model from './Model'
import { islandPositions, ISLAND_SIZE } from '../layout'
import { projects } from '../data/portfolioData'

const colors = ['#7ed6a5', '#f6c177', '#9ccfd8', '#eb9fb8', '#c4a7e7', '#a3d977', '#f3a683', '#74b9ff']

function Island({ index, position }) {
  const color = colors[index % colors.length]

  return (
    <group position={position}>
      {/* Looks for island1.glb, island2.glb... first. If not found, uses island.glb. */}
      <Model names={[`island${index + 1}`, 'island']} size={ISLAND_SIZE}>
        {/* placeholder island: a flat top + a rocky cone underneath */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[3.5, 3, 1, 10]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[0, -2.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[3, 4, 8]} />
          <meshStandardMaterial color="#8d7b6a" flatShading />
        </mesh>
      </Model>

      {/* floating name tag above the island */}
      <Html position={[0, 5, 0]} center distanceFactor={26} zIndexRange={[5, 0]}>
        <div className="island-label">
          <span className="island-number">{index + 1}</span>
          {projects[index]?.title}
        </div>
      </Html>
    </group>
  )
}

export default function Islands() {
  return (
    <>
      {islandPositions.map((position, i) => (
        <Island key={i} index={i} position={position} />
      ))}
    </>
  )
}
