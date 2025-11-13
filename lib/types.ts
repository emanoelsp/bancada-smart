export type BoxColor = "black" | "blue" | "red"
export type SideColor = "yellow" | "blue" | "green" | "red"
export type BlockType = "simple" | "double" | "triple"

export interface BoxConfiguration {
  boxColor: BoxColor
  side1Color: SideColor
  side2Color: SideColor
  side3Color: SideColor
}

export interface Product {
  id: string
  blockType: BlockType
  boxes: BoxConfiguration[]
  quantity: number
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

export interface SeniorOrderItem {
  codProduto: string
  nomProduto: string
  quantidade: number
  vlrUnitario: number
  observacao: string
}

export interface SeniorOrder {
  tipPedido: string
  codEmpresa: number
  codFilial: number
  datPedido: string
  codPessoa: number
  itens: SeniorOrderItem[]
}
