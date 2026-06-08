// Senior X Platform API integration
// Endpoint: POST /erpx_com_ven/pedido/apis/order (async — returns 201, number via webhook)

import type { CartItem } from "@/lib/types"
import { BLOCK_TYPES, BOX_COLORS, SIDE_COLORS } from "@/lib/constants"

export interface SeniorCredentials {
  baseUrl: string       // "https://api.senior.com.br"
  clientId: string      // client_id header (UUID da aplicação no portal)
  tenant: string        // nome do tenant no Senior X
  authMethod: "userpass" | "appkey"
  username?: string
  password?: string
  appKey?: string       // mesmo valor que clientId (key no loginWithKey)
  appSecret?: string    // Client Secret do portal
}

// Payload no formato do novo endpoint erpx_com_ven/pedido/apis/order
export interface PedidoVendaItem {
  product: { code: string }
  price: number
  quantity: number
  observation?: string
}

export interface PedidoVenda {
  externalId: string
  company: { code: number }
  branch: { code: number }
  customer: { code: number }
  items: PedidoVendaItem[]
  observation?: string
  close: boolean
}

export interface CustomerData {
  name: string
  email: string
  phone: string
  company: string
  notes: string
}

export interface EnviarPedidoResult {
  externalId: string
  accepted: boolean
}

/**
 * Autentica e retorna Bearer token.
 * loginWithKey: key = appKey (Client ID), secret = appSecret (Client Secret), tenantName = tenant
 */
export async function authenticate(credentials: SeniorCredentials): Promise<string> {
  const base = credentials.baseUrl.replace(/\/$/, "")

  if (credentials.authMethod === "appkey") {
    if (!credentials.appKey || !credentials.appSecret) {
      throw new Error("App Key e App Secret são obrigatórios para autenticação com chave de aplicação")
    }

    const url = `${base}/platform/authentication/anonymous/loginWithKey`
    const body = {
      accessKey: credentials.appKey,   // campo correto conforme docs: accessKey
      secret: credentials.appSecret,
      tenantName: credentials.tenant,
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        client_id: credentials.clientId,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      throw new Error(
        `Auth falhou [${response.status}] POST ${url}\nBody enviado: ${JSON.stringify(body)}\nResposta: ${text || response.statusText}`,
      )
    }

    return extractToken(await response.json())
  } else {
    if (!credentials.username || !credentials.password) {
      throw new Error("Usuário e senha são obrigatórios para autenticação por usuário/senha")
    }

    const username = credentials.username.includes("@")
      ? credentials.username
      : `${credentials.username}@${credentials.tenant}`

    const url = `${base}/platform/authentication/anonymous/login`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        client_id: credentials.clientId,
      },
      body: JSON.stringify({ username, password: credentials.password }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      throw new Error(
        `Auth falhou [${response.status}] POST ${url}\nResposta: ${text || response.statusText}`,
      )
    }

    return extractToken(await response.json())
  }
}

// Senior X pode retornar token em vários formatos
function extractToken(data: Record<string, unknown>): string {
  if (typeof data.access_token === "string" && data.access_token) return data.access_token
  if (typeof data.jsonToken === "string") {
    try {
      const inner = JSON.parse(data.jsonToken) as Record<string, unknown>
      if (typeof inner.access_token === "string" && inner.access_token) return inner.access_token
    } catch {
      // fall through
    }
  }
  if (typeof data.token === "string" && data.token) return data.token
  throw new Error(`Token não encontrado na resposta de auth. Resposta: ${JSON.stringify(data).slice(0, 300)}`)
}

/**
 * Constrói o payload no novo formato da API erpx_com_ven/pedido/apis/order.
 */
export function buildPedidoVenda(
  items: CartItem[],
  customerData: CustomerData,
  companyCode = 1,
  branchCode = 1,
  customerCode = 1,
): PedidoVenda {
  const externalId = `SMART40-${Date.now()}`

  const pedidoItems: PedidoVendaItem[] = items.map((item) => {
    const blockTypeData = BLOCK_TYPES.find((bt) => bt.value === item.product.blockType)
    const price = blockTypeData?.price || 0
    const productCode = `SMART40-${item.product.blockType.toUpperCase()}`

    const boxDescriptions = item.product.boxes
      .map((box, i) => {
        const boxColorName = BOX_COLORS.find((c) => c.value === box.boxColor)?.label || box.boxColor
        const s1 = SIDE_COLORS.find((c) => c.value === box.side1Color)?.label || box.side1Color
        const s2 = SIDE_COLORS.find((c) => c.value === box.side2Color)?.label || box.side2Color
        const s3 = SIDE_COLORS.find((c) => c.value === box.side3Color)?.label || box.side3Color
        return `Cx${i + 1}:${boxColorName}[L1:${s1} L2:${s2} L3:${s3}]`
      })
      .join(" | ")

    return {
      product: { code: productCode },
      price,
      quantity: item.quantity,
      observation: boxDescriptions.slice(0, 999),
    }
  })

  const observation = [
    customerData.notes || null,
    `Solicitante: ${customerData.name}`,
    customerData.email ? `Email: ${customerData.email}` : null,
    customerData.phone ? `Tel: ${customerData.phone}` : null,
    customerData.company ? `Empresa: ${customerData.company}` : null,
  ]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 999)

  return {
    externalId,
    company: { code: companyCode },
    branch: { code: branchCode },
    customer: { code: customerCode },
    items: pedidoItems,
    observation,
    close: true,
  }
}

/**
 * Envia pedido para POST /erpx_com_ven/pedido/apis/order.
 * Retorna 201 = aceito (processamento assíncrono — número do pedido vem por webhook).
 */
export async function enviarPedidoVenda(
  credentials: SeniorCredentials,
  pedido: PedidoVenda,
): Promise<EnviarPedidoResult> {
  const token = await authenticate(credentials)
  const base = credentials.baseUrl.replace(/\/$/, "")
  const url = `${base}/erpx_com_ven/pedido/apis/order`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      client_id: credentials.clientId,
    },
    body: JSON.stringify(pedido),
  })

  if (response.status === 201) {
    return { externalId: pedido.externalId, accepted: true }
  }

  const text = await response.text().catch(() => "")
  throw new Error(
    `Envio pedido falhou [${response.status}] POST ${url}\nPayload: ${JSON.stringify(pedido).slice(0, 500)}\nResposta: ${text || response.statusText}`,
  )
}
