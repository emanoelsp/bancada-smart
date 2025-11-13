"use client"

import type { BoxConfiguration } from "@/lib/types"
import { BOX_COLORS, SIDE_COLORS } from "@/lib/constants"

interface BoxPreview3DProps {
  configuration: BoxConfiguration
  size?: "sm" | "md" | "lg"
  interactive?: boolean
}

export function BoxPreview3D({ configuration, size = "md", interactive = false }: BoxPreview3DProps) {
  const boxColor = BOX_COLORS.find((c) => c.value === configuration.boxColor)?.hex || "#9ca3af"
  const side1Color = SIDE_COLORS.find((c) => c.value === configuration.side1Color)?.hex || "#eab308"
  const side2Color = SIDE_COLORS.find((c) => c.value === configuration.side2Color)?.hex || "#3b82f6"
  const side3Color = SIDE_COLORS.find((c) => c.value === configuration.side3Color)?.hex || "#22c55e"

  const isSide1Mounted = configuration.side1Color !== "yellow"
  const isSide2Mounted = configuration.side2Color !== "blue"
  const isSide3Mounted = configuration.side3Color !== "green"

  const dimensions = {
    sm: { size: 80, depth: 60 },
    md: { size: 160, depth: 120 },
    lg: { size: 240, depth: 180 },
  }

  const { size: boxSize, depth: boxDepth } = dimensions[size]

  return (
    <div
      className="flex items-center justify-center"
      style={{
        perspective: "1200px",
        perspectiveOrigin: "center center",
        height: boxSize * 1.5,
        width: boxSize * 1.5,
      }}
    >
      <div
        className="relative transition-transform duration-500"
        style={{
          width: boxSize,
          height: boxSize,
          transformStyle: "preserve-3d",
          transform: `rotateX(-15deg) rotateY(30deg)`,
          animation: interactive ? "spin3d 20s infinite linear" : "none",
        }}
      >
        {/* BASE - Sempre visível na cor da caixa */}
        <div
          className="absolute"
          style={{
            width: boxSize,
            height: boxDepth,
            backgroundColor: boxColor,
            transform: `rotateX(90deg) translateZ(${boxSize}px)`,
            border: "2px solid rgba(0,0,0,0.3)",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="absolute inset-4"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* TRASEIRA - Sempre visível na cor da caixa */}
        <div
          className="absolute"
          style={{
            width: boxSize,
            height: boxSize,
            backgroundColor: boxColor,
            transform: `translateZ(0px)`,
            border: "2px solid rgba(0,0,0,0.3)",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="absolute inset-4"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* LATERAL ESQUERDA - Sempre visível na cor da caixa */}
        <div
          className="absolute"
          style={{
            width: boxDepth,
            height: boxSize,
            backgroundColor: boxColor,
            transform: `rotateY(-90deg) translateZ(0px)`,
            border: "2px solid rgba(0,0,0,0.3)",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="absolute inset-4"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* LATERAL DIREITA (Side 1) - Montada conforme escolha do cliente */}
        {isSide1Mounted && (
          <div
            className="absolute transition-all duration-700 ease-out"
            style={{
              width: boxDepth,
              height: boxSize,
              backgroundColor: side1Color,
              transform: `rotateY(90deg) translateZ(${boxSize}px)`,
              border: "2px solid rgba(0,0,0,0.3)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.3)",
              opacity: 1,
            }}
          >
            <div
              className="absolute inset-4"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        {/* FRENTE (Side 2) - Montada conforme escolha do cliente */}
        {isSide2Mounted && (
          <div
            className="absolute transition-all duration-700 ease-out"
            style={{
              width: boxSize,
              height: boxSize,
              backgroundColor: side2Color,
              transform: `translateZ(${boxDepth}px)`,
              border: "2px solid rgba(0,0,0,0.3)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.3)",
              opacity: 1,
            }}
          >
            <div
              className="absolute inset-4"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        {/* TOPO (Side 3) - Montada conforme escolha do cliente */}
        {isSide3Mounted && (
          <div
            className="absolute transition-all duration-700 ease-out"
            style={{
              width: boxSize,
              height: boxDepth,
              backgroundColor: side3Color,
              transform: `rotateX(90deg) translateZ(0px)`,
              border: "2px solid rgba(0,0,0,0.3)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.4), 0 -5px 20px rgba(0,0,0,0.2)",
              opacity: 1,
            }}
          >
            <div
              className="absolute inset-4"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "4px",
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin3d {
          from {
            transform: rotateX(-15deg) rotateY(30deg);
          }
          to {
            transform: rotateX(-15deg) rotateY(390deg);
          }
        }
      `}</style>
    </div>
  )
}
