import type { BoxColor, SideColor, BlockType } from "./types"

export const BOX_COLORS: { value: BoxColor; label: string; hex: string }[] = [
  { value: "black", label: "Preta", hex: "#1a1a1a" },
  { value: "blue", label: "Azul", hex: "#1e40af" },
  { value: "red", label: "Vermelha", hex: "#dc2626" },
]

export const SIDE_COLORS: { value: SideColor; label: string; hex: string }[] = [
  { value: "yellow", label: "Amarela", hex: "#eab308" },
  { value: "blue", label: "Azul", hex: "#3b82f6" },
  { value: "green", label: "Verde", hex: "#22c55e" },
  { value: "red", label: "Vermelha", hex: "#ef4444" },
]

export const BLOCK_TYPES: {
  value: BlockType
  label: string
  description: string
  boxes: number
  price: number
}[] = [
  {
    value: "simple",
    label: "Bloco Simples",
    description: "1 caixa com laterais customizadas",
    boxes: 1,
    price: 150.0,
  },
  {
    value: "double",
    label: "Bloco Duplo",
    description: "2 caixas com laterais customizadas",
    boxes: 2,
    price: 280.0,
  },
  {
    value: "triple",
    label: "Bloco Triplo",
    description: "3 caixas com laterais customizadas",
    boxes: 3,
    price: 400.0,
  },
]
