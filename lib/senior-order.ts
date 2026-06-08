// Utilitários para estruturar pedidos no formato Senior X
import type { CartItem } from "@/lib/types"
import { BLOCK_TYPES, BOX_COLORS, SIDE_COLORS } from "@/lib/constants"

// Dados mockados do contexto Smart 4.0
export const SMART40_COMPANY_DATA = {
  codEmpresa: 1,
  nomeEmpresa: "Smart 4.0 Automação Industrial",
  codFilial: 1,
  nomeFilial: "Fábrica Principal - Smart 4.0",
  cnpj: "12.345.678/0001-90",
  inscricaoEstadual: "123.456.789.012",
  endereco: {
    logradouro: "Rua da Automação Industrial",
    numero: "4000",
    complemento: "Galpão Smart",
    bairro: "Distrito Industrial",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    pais: "Brasil",
  },
  contato: {
    telefone: "(11) 3000-4000",
    email: "contato@smart40.com.br",
    site: "https://exxer.com/serie/smart-4-0",
  },
}

export const SMART40_DEFAULT_CUSTOMER = {
  codPessoa: 99999,
  nomPessoa: "Cliente Smart 4.0",
  tipPessoa: "F", // F = Física, J = Jurídica
  cpfCnpj: "000.000.000-00",
  email: "cliente@smart40.com.br",
  telefone: "(11) 9999-9999",
}

interface SeniorOrderItem {
  sequencia: number
  codProduto: string
  nomProduto: string
  quantidade: number
  vlrUnitario: number
  vlrTotal: number
  unidade: string
  observacao: string
  // Dados específicos da Smart 4.0
  dadosProducao: {
    tipoProduto: "BLOCO_SIMPLES" | "BLOCO_DUPLO" | "BLOCO_TRIPLO"
    configuracoes: Array<{
      caixaIndex: number
      corBase: string
      corLateral1: string
      corLateral2: string
      corLateral3: string
    }>
  }
}

interface SeniorOrderPayload {
  // Cabeçalho do pedido
  tipPedido: string
  codEmpresa: number
  nomeEmpresa: string
  codFilial: number
  nomeFilial: string
  datPedido: string
  horPedido: string

  // Cliente
  codPessoa: number
  nomCliente: string
  tipPessoa: string
  cpfCnpj: string
  email: string
  telefone: string

  // Totais
  vlrTotal: number
  vlrProdutos: number
  qtdItens: number

  // Itens
  itens: SeniorOrderItem[]

  // Observações gerais
  observacoes: string

  // Metadados específicos Smart 4.0
  metadados: {
    sistema: string
    versao: string
    destinoBancada: string
    tipoProducao: string
    urlBancada: string
  }
}

export function buildSeniorOrder(
  items: CartItem[],
  customerData: {
    name: string
    email: string
    phone: string
    company: string
    notes: string
  },
): SeniorOrderPayload {
  const now = new Date()
  const datPedido = now.toISOString().split("T")[0] // YYYY-MM-DD
  const horPedido = now.toTimeString().split(" ")[0] // HH:MM:SS

  let vlrTotal = 0
  let qtdItens = 0

  const seniorItems: SeniorOrderItem[] = items.map((item, index) => {
    const blockTypeData = BLOCK_TYPES.find((bt) => bt.value === item.product.blockType)
    const vlrUnitario = blockTypeData?.price || 0
    const vlrItemTotal = vlrUnitario * item.quantity

    vlrTotal += vlrItemTotal
    qtdItens += item.quantity

    // Criar código do produto baseado no tipo de bloco
    const codProduto = `SMART40-${item.product.blockType.toUpperCase()}-${String(index + 1).padStart(3, "0")}`

    // Construir descrição detalhada
    const boxDescriptions = item.product.boxes
      .map((box, boxIndex) => {
        const boxColorName = BOX_COLORS.find((c) => c.value === box.boxColor)?.label
        const side1Name = SIDE_COLORS.find((c) => c.value === box.side1Color)?.label
        const side2Name = SIDE_COLORS.find((c) => c.value === box.side2Color)?.label
        const side3Name = SIDE_COLORS.find((c) => c.value === box.side3Color)?.label

        return `Caixa ${boxIndex + 1}: ${boxColorName} [L1:${side1Name} L2:${side2Name} L3:${side3Name}]`
      })
      .join(" | ")

    return {
      sequencia: index + 1,
      codProduto,
      nomProduto: blockTypeData?.label || "Bloco Customizado",
      quantidade: item.quantity,
      vlrUnitario,
      vlrTotal: vlrItemTotal,
      unidade: "UN",
      observacao: boxDescriptions,
      dadosProducao: {
        tipoProduto: item.product.blockType.toUpperCase() as any,
        configuracoes: item.product.boxes.map((box, boxIndex) => ({
          caixaIndex: boxIndex + 1,
          corBase: box.boxColor,
          corLateral1: box.side1Color,
          corLateral2: box.side2Color,
          corLateral3: box.side3Color,
        })),
      },
    }
  })

  // Usar dados do cliente se fornecidos, senão usar mock Smart 4.0
  const cliente = {
    codPessoa: SMART40_DEFAULT_CUSTOMER.codPessoa,
    nomCliente: customerData.name || SMART40_DEFAULT_CUSTOMER.nomPessoa,
    tipPessoa: SMART40_DEFAULT_CUSTOMER.tipPessoa,
    cpfCnpj: SMART40_DEFAULT_CUSTOMER.cpfCnpj,
    email: customerData.email || SMART40_DEFAULT_CUSTOMER.email,
    telefone: customerData.phone || SMART40_DEFAULT_CUSTOMER.telefone,
  }

  return {
    // Cabeçalho com dados mockados Smart 4.0
    tipPedido: "VEN",
    codEmpresa: SMART40_COMPANY_DATA.codEmpresa,
    nomeEmpresa: SMART40_COMPANY_DATA.nomeEmpresa,
    codFilial: SMART40_COMPANY_DATA.codFilial,
    nomeFilial: SMART40_COMPANY_DATA.nomeFilial,
    datPedido,
    horPedido,

    // Cliente
    ...cliente,

    // Totais
    vlrTotal,
    vlrProdutos: vlrTotal,
    qtdItens,

    // Itens
    itens: seniorItems,

    // Observações
    observacoes: customerData.notes
      ? `${customerData.notes} | Empresa: ${customerData.company || "N/A"}`
      : `Empresa: ${customerData.company || "N/A"}`,

    // Metadados Smart 4.0
    metadados: {
      sistema: "E-commerce Smart 4.0",
      versao: "1.0",
      destinoBancada: "SMART_4_0",
      tipoProducao: "AUTOMATIZADA",
      urlBancada: "https://exxer.com/serie/smart-4-0",
    },
  }
}
