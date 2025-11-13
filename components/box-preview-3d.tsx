"use client"

import type { BoxConfiguration } from "@/lib/types"
import { BOX_COLORS, SIDE_COLORS } from "@/lib/constants"
import { useEffect, useRef } from "react"

interface BoxPreview3DProps {
  configuration: BoxConfiguration
  size?: "sm" | "md" | "lg"
  interactive?: boolean
}

export function BoxPreview3D({ configuration, size = "md", interactive = false }: BoxPreview3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const boxColor = BOX_COLORS.find((c) => c.value === configuration.boxColor)?.hex || "#ef4444"
  const side1Color = SIDE_COLORS.find((c) => c.value === configuration.side1Color)?.hex || "#3b82f6"
  const side2Color = SIDE_COLORS.find((c) => c.value === configuration.side2Color)?.hex || "#eab308"
  const side3Color = SIDE_COLORS.find((c) => c.value === configuration.side3Color)?.hex || "#1a1a1a"

  const dimensions = {
    sm: { width: 200, height: 160 },
    md: { width: 350, height: 280 },
    lg: { width: 500, height: 400 },
  }

  const { width, height } = dimensions[size]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with light background
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(width / 2, height / 2.2)

    const boxWidth = 100
    const boxHeight = 70
    const boxDepth = 50

    // Ângulo isométrico (30 graus)
    const angle = Math.PI / 6

    ctx.fillStyle = boxColor
    ctx.beginPath()
    ctx.moveTo(-boxWidth / 2, -boxHeight / 2)
    ctx.lineTo(boxWidth / 2, -boxHeight / 2)
    ctx.lineTo(boxWidth / 2, boxHeight / 2)
    ctx.lineTo(-boxWidth / 2, boxHeight / 2)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.3)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = side1Color
    ctx.beginPath()
    const leftX = -boxWidth / 2
    const leftDepth = Math.cos(angle) * boxDepth
    const leftYShift = Math.sin(angle) * boxDepth * 0.8

    ctx.moveTo(leftX, -boxHeight / 2)
    ctx.lineTo(leftX - leftDepth, -boxHeight / 2 - leftYShift)
    ctx.lineTo(leftX - leftDepth, boxHeight / 2 - leftYShift)
    ctx.lineTo(leftX, boxHeight / 2)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.3)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = side2Color
    ctx.beginPath()
    const rightX = boxWidth / 2
    const rightDepth = Math.cos(angle) * boxDepth
    const rightYShift = Math.sin(angle) * boxDepth * 0.8

    ctx.moveTo(rightX, -boxHeight / 2)
    ctx.lineTo(rightX + rightDepth, -boxHeight / 2 - rightYShift)
    ctx.lineTo(rightX + rightDepth, boxHeight / 2 - rightYShift)
    ctx.lineTo(rightX, boxHeight / 2)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.3)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = side3Color
    ctx.beginPath()
    ctx.moveTo(-boxWidth / 2, -boxHeight / 2)
    ctx.lineTo(boxWidth / 2, -boxHeight / 2)
    ctx.lineTo(rightX + rightDepth, -boxHeight / 2 - rightYShift)
    ctx.lineTo(leftX - leftDepth, -boxHeight / 2 - leftYShift)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.4)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.strokeStyle = "rgba(255,255,255,0.15)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-boxWidth / 2 + 2, -boxHeight / 2 + 2)
    ctx.lineTo(boxWidth / 2 - 2, -boxHeight / 2 + 2)
    ctx.lineTo(boxWidth / 2 - 2, boxHeight / 2 - 2)
    ctx.lineTo(-boxWidth / 2 + 2, boxHeight / 2 - 2)
    ctx.closePath()
    ctx.stroke()

    ctx.restore()
  }, [configuration, width, height])

  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-border/20"
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  )
}
