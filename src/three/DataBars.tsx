import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DataBarsProps {
  grid?: number
  reduced?: boolean
}

/**
 * An animated 3D "data city" — an instanced grid of bars whose heights ripple
 * in a smooth wave. One InstancedMesh, animated in useFrame (no per-bar React).
 */
export function DataBars({ grid = 9, reduced = false }: DataBarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)

  const count = grid * grid
  const spacing = 1.05
  const half = ((grid - 1) * spacing) / 2

  const bases = useMemo(() => {
    const arr: number[] = []
    const c = (grid - 1) / 2
    for (let x = 0; x < grid; x++) {
      for (let z = 0; z < grid; z++) {
        const d = Math.hypot(x - c, z - c)
        arr.push(1.1 + Math.cos(d * 0.7) * 0.5)
      }
    }
    return arr
  }, [grid])

  const colorA = useMemo(() => new THREE.Color('#3A332C'), [])
  const colorB = useMemo(() => new THREE.Color('#B4592F'), [])

  // Per-bar colour: gradient blue → cyan by height.
  useEffect(() => {
    const mesh = meshRef.current
    for (let i = 0; i < count; i++) {
      const c = colorA.clone().lerp(colorB, Math.min(1, bases[i] / 2.2))
      mesh.setColorAt(i, c)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [count, bases, colorA, colorB])

  useFrame((state) => {
    if (reduced && settled.current) return
    const mesh = meshRef.current
    const t = reduced ? 0 : state.clock.elapsedTime
    let i = 0
    for (let x = 0; x < grid; x++) {
      for (let z = 0; z < grid; z++) {
        const wave =
          Math.sin(x * 0.55 + t) * 0.35 + Math.cos(z * 0.55 + t * 0.9) * 0.35
        const h = Math.max(0.25, bases[i] + wave + 0.3)
        dummy.position.set(x * spacing - half, h / 2, z * spacing - half)
        dummy.scale.set(0.72, h, 0.72)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        i++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (reduced) settled.current = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.38} metalness={0.08} />
    </instancedMesh>
  )
}
