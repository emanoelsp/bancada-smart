import { type NextRequest, NextResponse } from "next/server"
import type { CartItem } from "@/lib/types"
import { buildPedidoVenda, enviarPedidoVenda } from "@/lib/senior-api"
import type { SeniorCredentials, CustomerData } from "@/lib/senior-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, items, seniorCredentials } = body as {
      customerData: CustomerData
      items: CartItem[]
      seniorCredentials: SeniorCredentials | null
    }

    console.log("[orders] Criando pedido para:", customerData.name)

    const orderId = `SMART40-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Credentials: from client (settings) or server env vars
    const creds: SeniorCredentials = seniorCredentials ?? {
      baseUrl: process.env.SENIOR_API_BASE_URL || "https://api.senior.com.br",
      clientId: process.env.SENIOR_CLIENT_ID || "",
      tenant: process.env.SENIOR_TENANT || "",
      authMethod: "appkey",
      appKey: process.env.SENIOR_APP_KEY || "",
      appSecret: process.env.SENIOR_APP_SECRET || "",
    }

    const companyCode = Number(process.env.SENIOR_COMPANY_CODE) || 1
    const branchCode = Number(process.env.SENIOR_BRANCH_CODE) || 1
    const customerCode = Number(process.env.SENIOR_CUSTOMER_CODE) || 1

    const pedido = buildPedidoVenda(items, customerData, companyCode, branchCode, customerCode)

    // Debug info always returned so UI can display it
    const seniorDebug = {
      authEndpoint: `${creds.baseUrl}/platform/authentication/anonymous/loginWithKey`,
      orderEndpoint: `${creds.baseUrl}/erpx_com_ven/pedido/apis/order`,
      clientId: creds.clientId,
      tenant: creds.tenant,
      authMethod: creds.authMethod,
      payload: pedido,
    }

    let seniorExternalId: string | undefined
    let seniorError: string | undefined

    try {
      const result = await enviarPedidoVenda(creds, pedido)
      seniorExternalId = result.externalId
      console.log("[orders] Pedido aceito pelo Senior X, externalId:", seniorExternalId)
    } catch (err) {
      seniorError = err instanceof Error ? err.message : "Erro desconhecido"
      console.error("[orders] Erro ao enviar para Senior X:", seniorError)
    }

    return NextResponse.json({
      success: true,
      orderId,
      seniorExternalId,
      seniorError,
      seniorDebug,
      message: seniorError
        ? "Pedido registrado localmente. Falha ao enviar para o ERP Senior X."
        : "Pedido aceito pelo ERP Senior X (processamento assíncrono).",
    })
  } catch (error) {
    console.error("[orders] Erro interno:", error)
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
