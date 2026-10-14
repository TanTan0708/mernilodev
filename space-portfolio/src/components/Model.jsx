import { Component, Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getModelUrl } from '../models'

// How to use:
//   <Model names={['earth']} size={10}>
//     ...placeholder shapes here...
//   </Model>
//
// If src/models/earth.glb exists -> shows it (auto-resized so its biggest side = size).
// If it does not exist           -> shows the placeholder shapes you put inside.

function LoadedModel({ url, size, rotationY }) {
  const { scene } = useGLTF(url)

  const { object, scale } = useMemo(() => {
    const copy = clone(scene) // copy so we can use the same model many times
    const box = new THREE.Box3().setFromObject(copy)
    const dimensions = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    copy.position.sub(center) // move the model so its middle is at (0,0,0)
    const scale = size / Math.max(dimensions.x, dimensions.y, dimensions.z)
    return { object: copy, scale }
  }, [scene, size])

  return (
    <group rotation={[0, rotationY, 0]}>
      <group scale={scale}>
        <primitive object={object} />
      </group>
    </group>
  )
}

// If a model file is broken, show the placeholder instead of crashing the whole page.
class SafeBox extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.warn('Could not load a 3D model, using the placeholder instead:', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function Model({ names, size = 1, rotationY = 0, children }) {
  const url = getModelUrl(names)

  if (!url) return <>{children}</>

  return (
    <SafeBox fallback={children}>
      <Suspense fallback={children}>
        <LoadedModel url={url} size={size} rotationY={rotationY} />
      </Suspense>
    </SafeBox>
  )
}
