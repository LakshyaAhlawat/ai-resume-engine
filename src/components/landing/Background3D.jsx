"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Stars, Float, Sparkles, Line } from '@react-three/drei'

function WireframeKnot({ subtle }) {
  const mesh = useRef()
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.06
      mesh.current.rotation.y += delta * 0.09
    }
  })
  return (
    <mesh ref={mesh} position={[subtle ? 3.4 : 4.2, subtle ? 2.2 : 2.6, -6]} scale={subtle ? 1.1 : 1.5}>
      <torusKnotGeometry args={[1, 0.28, 120, 16]} />
      <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={subtle ? 0.25 : 0.35} />
    </mesh>
  )
}

const ALL_CIRCUIT_NODES = Array.from({ length: 22 }, () => [
  (Math.random() - 0.5) * 9,
  (Math.random() - 0.5) * 6,
  -5 - Math.random() * 4,
])

function nearestNeighborEdges(nodes) {
  const lines = []
  nodes.forEach((a, i) => {
    let nearest = null
    let nearestDist = Infinity
    nodes.forEach((b, j) => {
      if (i === j) return
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = b
      }
    })
    if (nearest) lines.push([a, nearest])
  })
  return lines
}

function CircuitNetwork({ subtle }) {
  const group = useRef()
  const nodeCount = subtle ? 14 : 22

  const nodes = useMemo(() => ALL_CIRCUIT_NODES.slice(0, nodeCount), [nodeCount])
  const edges = useMemo(() => nearestNeighborEdges(nodes), [nodes])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.y = t * 0.02
    }
  })

  return (
    <group ref={group}>
      {edges.map((edge, i) => (
        <Line key={i} points={edge} color="#818cf8" transparent opacity={subtle ? 0.15 : 0.25} lineWidth={1} />
      ))}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={subtle ? 0.5 : 0.7} />
        </mesh>
      ))}
    </group>
  )
}

function AnimatedShapes({ subtle }) {
  const group = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.x = Math.cos(t / 4) / 2
      group.current.rotation.y = Math.sin(t / 4) / 2
      group.current.position.y = Math.sin(t / 1.5) / 5
    }
  })

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere args={[1, 64, 64]} position={[-2.5, 1, -3]} scale={subtle ? 1.1 : 1.8}>
          <MeshDistortMaterial
            color="#3b82f6"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.8}
            roughness={0.1}
            distort={0.4}
            speed={2}
          />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={2} floatIntensity={3}>
        <Sphere args={[1.2, 64, 64]} position={[3, -1.5, -4]} scale={subtle ? 0.9 : 1.5}>
          <MeshDistortMaterial
            color="#8b5cf6"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.8}
            roughness={0.2}
            distort={0.5}
            speed={2.5}
          />
        </Sphere>
      </Float>

      {!subtle && (
        <Float speed={1} rotationIntensity={1} floatIntensity={1.5}>
          <Sphere args={[0.8, 64, 64]} position={[0, -3, -5]} scale={1.2}>
            <MeshDistortMaterial
              color="#e879f9"
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0.2}
              metalness={0.9}
              roughness={0.1}
              distort={0.3}
              speed={1.5}
            />
          </Sphere>
        </Float>
      )}
    </group>
  )
}

export function Background3D({ variant = "full" }) {
  const subtle = variant === "subtle"
  const [active, setActive] = useState(true)

  useEffect(() => {
    const onVisibilityChange = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={subtle ? { opacity: 0.55 } : undefined}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, subtle ? 1.5 : 2]}
        frameloop={active ? "always" : "never"}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={3} color="#4f46e5" />
        <Stars radius={100} depth={50} count={subtle ? 1500 : 5000} factor={4} saturation={0} fade speed={1} />
        {subtle && <Sparkles count={50} scale={[10, 6, 6]} size={2} speed={0.3} color="#60a5fa" />}
        <AnimatedShapes subtle={subtle} />
        <WireframeKnot subtle={subtle} />
        <CircuitNetwork subtle={subtle} />
      </Canvas>
    </div>
  )
}
