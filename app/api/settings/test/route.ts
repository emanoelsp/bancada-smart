import { type NextRequest, NextResponse } from "next/server"
import { authenticate } from "@/lib/senior-api"
import type { SeniorCredentials } from "@/lib/senior-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const credentials = body as SeniorCredentials

    if (!credentials.baseUrl || !credentials.clientId || !credentials.tenant || !credentials.authMethod) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatorios: baseUrl, clientId, tenant e authMethod" },
        { status: 400 },
      )
    }

    if (credentials.authMethod === "userpass" && (!credentials.username || !credentials.password)) {
      return NextResponse.json(
        { success: false, message: "Usuario e senha sao obrigatorios para autenticacao por usuario/senha" },
        { status: 400 },
      )
    }

    if (credentials.authMethod === "appkey" && (!credentials.appKey || !credentials.appSecret)) {
      return NextResponse.json(
        { success: false, message: "App Key e App Secret sao obrigatorios para autenticacao por chave de aplicacao" },
        { status: 400 },
      )
    }

    await authenticate(credentials)

    return NextResponse.json({ success: true, message: "Autenticado com sucesso na API Senior X" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro de conexao desconhecido"
    console.error("[senior-test]", message)
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
