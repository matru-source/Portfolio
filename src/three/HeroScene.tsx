import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { DataBars } from './DataBars'
import { ThreeBoundary } from './ThreeBoundary'
import { usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'

function HeroFallback() {
  return (
    <div className="h-full w-full rounded-2xl bg-gradient-to-br from-primary-50 to-white" />
  )
}

/** Interactive 3D hero — a rippling data-bar field you can drag to orbit. */
export function HeroScene({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className={cn('h-full w-full', className)}>
      <ThreeBoundary fallback={<HeroFallback />}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [8, 6.5, 9], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          style={{ touchAction: 'pan-y' }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[6, 10, 6]} intensity={1.25} />
          <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#E2B48C" />

          <group position={[0, -0.6, 0]}>
            <DataBars grid={9} reduced={reduced} />
            <ContactShadows
              position={[0, -0.01, 0]}
              opacity={0.28}
              scale={24}
              blur={2.6}
              far={9}
              color="#3A2A1E"
            />
          </group>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!reduced}
            autoRotateSpeed={0.55}
            enableDamping
            minPolarAngle={Math.PI / 4.2}
            maxPolarAngle={Math.PI / 2.15}
          />
        </Canvas>
      </ThreeBoundary>
    </div>
  )
}
