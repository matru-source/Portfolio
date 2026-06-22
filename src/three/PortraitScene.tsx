import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { ThreeBoundary } from './ThreeBoundary'
import { usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'

const TWO_PI = Math.PI * 2

function PortraitCard({ photo, reduced }: { photo: string; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  // Load the photo as a texture (gracefully no-ops if missing).
  useEffect(() => {
    if (!photo) {
      setTex(null)
      return
    }
    let active = true
    new THREE.TextureLoader().load(
      photo,
      (t) => {
        if (!active) return
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        setTex(t)
      },
      undefined,
      () => active && setTex(null),
    )
    return () => {
      active = false
    }
  }, [photo])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime

    if (hovered && !reduced) {
      // Spin while hovered.
      g.rotation.y += delta * 1.9
      g.rotation.x += (0 - g.rotation.x) * 0.1
    } else {
      // Ease back to the nearest front-facing orientation + a slight mouse tilt
      // (nearest full-turn multiple avoids a long unwind after spinning).
      const base = Math.round(g.rotation.y / TWO_PI) * TWO_PI
      const targetY = base + (reduced ? 0 : state.pointer.x * 0.4)
      const targetX = reduced ? 0 : -state.pointer.y * 0.22
      g.rotation.y += (targetY - g.rotation.y) * 0.08
      g.rotation.x += (targetX - g.rotation.x) * 0.08
    }
    g.position.y = reduced ? 0 : Math.sin(t * 0.8) * 0.07
  })

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card body (frame) */}
      <RoundedBox args={[2.7, 3.0, 0.16]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color="#FAF7F1" roughness={0.7} metalness={0} />
      </RoundedBox>

      {/* Photo on the front */}
      <mesh position={[0, 0.18, 0.085]}>
        <planeGeometry args={[2.32, 2.32]} />
        <meshStandardMaterial
          map={tex}
          color={tex ? '#ffffff' : '#E6E0D4'}
          roughness={0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Terracotta nameplate strip */}
      <mesh position={[0, -1.18, 0.085]}>
        <planeGeometry args={[2.32, 0.42]} />
        <meshStandardMaterial color="#B4592F" roughness={0.6} />
      </mesh>

      {/* Warm card back (revealed on spin) */}
      <mesh position={[0, 0, -0.085]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.4, 2.7]} />
        <meshStandardMaterial color="#B4592F" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Fallback() {
  return <div className="h-full w-full rounded-2xl bg-gradient-to-br from-primary-50 to-canvas" />
}

/** Interactive 3D portrait card — floats, tilts to the mouse, spins on hover. */
export function PortraitScene({ photo, className }: { photo: string; className?: string }) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className={cn('h-full w-full', className)}>
      <ThreeBoundary fallback={<Fallback />}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 36 }}
          gl={{ antialias: true, alpha: true }}
          style={{ touchAction: 'pan-y' }}
        >
          <ambientLight intensity={0.95} />
          <directionalLight position={[4, 6, 6]} intensity={1.2} />
          <directionalLight position={[-5, 2, 3]} intensity={0.4} color="#E2B48C" />
          <Suspense fallback={null}>
            <PortraitCard photo={photo} reduced={reduced} />
          </Suspense>
          <ContactShadows
            position={[0, -1.7, 0]}
            opacity={0.26}
            scale={6}
            blur={2.6}
            far={4}
            color="#3A2A1E"
          />
        </Canvas>
      </ThreeBoundary>
    </div>
  )
}
