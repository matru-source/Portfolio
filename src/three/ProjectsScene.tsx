import { Canvas } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls } from '@react-three/drei'
import { ThreeBoundary } from './ThreeBoundary'
import { usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'

function Shapes({ reduced }: { reduced: boolean }) {
  const f = (n: number) => (reduced ? 0 : n)
  return (
    <group>
      <Float speed={f(1.5)} rotationIntensity={f(0.6)} floatIntensity={f(0.8)}>
        <mesh position={[0, 0.1, 0]}>
          <icosahedronGeometry args={[1.35, 0]} />
          <meshStandardMaterial color="#B4592F" roughness={0.4} metalness={0.05} flatShading />
        </mesh>
      </Float>
      <Float speed={f(2)} rotationIntensity={f(0.8)} floatIntensity={f(1)}>
        <mesh position={[2.5, 0.7, -1]}>
          <torusGeometry args={[0.6, 0.22, 16, 48]} />
          <meshStandardMaterial color="#1A1714" roughness={0.45} />
        </mesh>
      </Float>
      <Float speed={f(1.8)} rotationIntensity={f(0.7)} floatIntensity={f(1)}>
        <mesh position={[-2.4, -0.4, -0.5]}>
          <dodecahedronGeometry args={[0.72, 0]} />
          <meshStandardMaterial color="#D8A57A" roughness={0.5} flatShading />
        </mesh>
      </Float>
    </group>
  )
}

/** Lighter interactive 3D accent for the Projects page header. */
export function ProjectsScene({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className={cn('h-full w-full', className)}>
      <ThreeBoundary fallback={<div className="h-full w-full rounded-2xl bg-primary-50" />}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.5, 7], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ touchAction: 'pan-y' }}
        >
          <ambientLight intensity={0.95} />
          <directionalLight position={[5, 8, 5]} intensity={1.15} />
          <directionalLight position={[-5, -2, -3]} intensity={0.3} color="#E2B48C" />
          <Shapes reduced={reduced} />
          <ContactShadows position={[0, -2, 0]} opacity={0.2} scale={14} blur={2.8} far={5} color="#3A2A1E" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!reduced}
            autoRotateSpeed={0.8}
            enableDamping
          />
        </Canvas>
      </ThreeBoundary>
    </div>
  )
}
