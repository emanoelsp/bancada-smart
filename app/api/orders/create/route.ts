import { type NextRequest, NextResponse } from "next/server"
import type { CartItem } from "@/lib/types"
import { getSeniorTokenWithKey } from "@/lib/senior-api"
import { buildSeniorOrder } from "@/lib/senior-order"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, items, tempCredentials } = body as {
      customerData: {
        name: string
        email: string
        phone: string
        company: string
        notes: string
      }
      items: CartItem[]
      tempCredentials?: {
        clientId: string
        appKey: string
        appSecret: string
      }
    }

    console.log("[v0] Criando pedido para:", customerData.name)
    console.log("[v0] Total de itens:", items.length)

    // Gerar ID do pedido
    const orderId = `SMART40-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    const seniorOrder = buildSeniorOrder(items, customerData)

    console.log("[v0] Pedido estruturado:", JSON.stringify(seniorOrder, null, 2))

    let token: string
    try {
      token = await getSeniorTokenWithKey(tempCredentials)
    } catch (error) {
      console.log("[v0] Falha ao autenticar com chave, tentando usuário/senha...")
      // Fallback para autenticação tradicional (se configurado)
      const { getSeniorToken } = await import("@/lib/senior-api")
      token = await getSeniorToken()
    }

    const baseUrl = process.env.SENIOR_API_BASE_URL || "https://api.senior.com.br"
    const clientId = tempCredentials?.clientId || process.env.SENIOR_CLIENT_ID

    if (!clientId) {
      throw new Error("SENIOR_CLIENT_ID não configurado")
    }

    // Endpoint da API de pedidos (ajustar conforme documentação Senior X)
    const apiEndpoint = `${baseUrl}/platform/erp/api/pedidos`

    console.log("[v0] Enviando pedido para Senior X:", apiEndpoint)

    const seniorResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        client_id: clientId,
      },
      body: JSON.stringify(seniorOrder),
    })

    if (!seniorResponse.ok) {
      const errorText = await seniorResponse.text()
      console.error("[v0] Erro da API Senior X:", errorText)
      throw new Error(`Erro ao enviar pedido: ${seniorResponse.status} - ${errorText}`)
    }

    const seniorData = await seniorResponse.json()
    console.log("[v0] Resposta da Senior X:", seniorData)

    console.log("[v0] Pedido criado com sucesso:", orderId)

    return NextResponse.json({
      success: true,
      orderId: orderId,
      seniorOrderId: seniorData.id || seniorData.numPedido,
      message: "Pedido criado com sucesso e enviado para produção na Bancada Smart 4.0",
      seniorOrder: seniorOrder,
      seniorResponse: seniorData,
      statusCode: seniorResponse.status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Erro ao criar pedido:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar pedido",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
