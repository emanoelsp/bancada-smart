"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import type { BoxConfiguration } from "@/lib/types"
import { BOX_COLORS, SIDE_COLORS } from "@/lib/constants"

interface BoxPreview3DProps {
  configuration: BoxConfiguration
  size?: "sm" | "md" | "lg"
}

function BlockMesh({ configuration }: { configuration: BoxConfiguration }) {
  const boxColor = configuration.boxColor
    ? BOX_COLORS.find((c) => c.value === configuration.boxColor)?.hex || "#c0c0c0"
    : "#c0c0c0"

  const side1Color = configuration.side1Color
    ? SIDE_COLORS.find((c) => c.value === configuration.side1Color)?.hex
    : null
  const side2Color = configuration.side2Color
    ? SIDE_COLORS.find((c) => c.value === configuration.side2Color)?.hex
    : null
  const side3Color = configuration.side3Color
    ? SIDE_COLORS.find((c) => c.value === configuration.side3Color)?.hex
    : null

  return (
    <group>
      {/* Estrutura base da caixa */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.8, 2]} />
        <meshPhongMaterial color={boxColor} shininess={100} />
      </mesh>

      {/* Tampa - cor do bloco */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 0.15, 2]} />
        <meshPhongMaterial color={boxColor} shininess={100} />
      </mesh>

      {/* Parede frontal (Lateral 1 - Frente) */}
      <mesh position={[0, 0.15, -1.05]}>
        <boxGeometry args={[2, 0.6, 0.2]} />
        <meshPhongMaterial
          color={side1Color || boxColor}
          shininess={80}
          opacity={side1Color ? 1 : 0.3}
          transparent={!side1Color}
        />
      </mesh>

      {/* Parede traseira - cor do bloco */}
      <mesh position={[0, 0.15, 1.05]}>
        <boxGeometry args={[2, 0.6, 0.2]} />
        <meshPhongMaterial color={boxColor} shininess={80} />
      </mesh>

      {/* Parede lateral esquerda (Lateral 3 - Esquerda) */}
      <mesh position={[-1.05, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.6, 2]} />
        <meshPhongMaterial
          color={side3Color || boxColor}
          shininess={80}
          opacity={side3Color ? 1 : 0.3}
          transparent={!side3Color}
        />
      </mesh>

      {/* Parede lateral direita (Lateral 2 - Direita) */}
      <mesh position={[1.05, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.6, 2]} />
        <meshPhongMaterial
          color={side2Color || boxColor}
          shininess={80}
          opacity={side2Color ? 1 : 0.3}
          transparent={!side2Color}
        />
      </mesh>
    </group>
  )
}

export function BoxPreview3D({ configuration, size = "md" }: BoxPreview3DProps) {
  const dimensions = {
    sm: { width: 200, height: 160 },
    md: { width: 350, height: 280 },
    lg: { width: 500, height: 400 },
  }

  const { width, height } = dimensions[size]

  return (
    <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border/20 bg-white">
      <Canvas style={{ width, height }} camera={{ position: [3, 2.5, 3], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[3, 2.5, 3]} fov={50} />
        <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={4} />

        <ambientLight intensity={0.9} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, 5, -5]} intensity={0.8} />

        <BlockMesh configuration={configuration} />
      </Canvas>
    </div>
  )
}
