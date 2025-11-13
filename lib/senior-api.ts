// Biblioteca para integração com Senior X Platform API
// Automatiza autenticação e geração de tokens

interface SeniorAuthResponse {
  jsonToken: string
  refreshToken: string
  expiresIn: number
}

interface SeniorTokenData {
  access_token: string
  token_type: string
  expires_in: number
}

let cachedToken: string | null = null
let tokenExpiry: number | null = null

/**
 * Autentica na API Senior X e retorna o token de acesso
 * Usa cache para evitar requisições desnecessárias
 */
export async function getSeniorToken(): Promise<string> {
  // Verificar se o token em cache ainda é válido
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log("[v0] Usando token em cache")
    return cachedToken
  }

  try {
    const baseUrl = process.env.SENIOR_API_BASE_URL || "https://api.senior.com.br"
    const clientId = process.env.SENIOR_CLIENT_ID
    const username = process.env.SENIOR_USERNAME
    const password = process.env.SENIOR_PASSWORD

    if (!clientId) {
      throw new Error("SENIOR_CLIENT_ID não configurado nas variáveis de ambiente")
    }

    console.log("[v0] Autenticando na API Senior X...")

    const response = await fetch(`${baseUrl}/platform/authentication/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        client_id: clientId,
      },
      body: JSON.stringify({
        username: username || "smart40_api",
        password: password || "smart40_password",
      }),
    })

    if (!response.ok) {
      throw new Error(`Falha na autenticação: ${response.status} ${response.statusText}`)
    }

    const authData: SeniorAuthResponse = await response.json()
    const tokenData: SeniorTokenData = JSON.parse(authData.jsonToken)

    // Armazenar token em cache com margem de 5 minutos antes da expiração
    cachedToken = tokenData.access_token
    tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000

    console.log("[v0] Token obtido com sucesso, válido por", tokenData.expires_in, "segundos")

    return tokenData.access_token
  } catch (error) {
    console.error("[v0] Erro ao obter token Senior X:", error)
    throw error
  }
}

/**
 * Autentica usando aplicação (chave e segredo)
 * Alternativa ao login com usuário e senha
 */
export async function getSeniorTokenWithKey(): Promise<string> {
  // Verificar se o token em cache ainda é válido
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log("[v0] Usando token em cache")
    return cachedToken
  }

  try {
    const baseUrl = process.env.SENIOR_API_BASE_URL || "https://api.senior.com.br"
    const clientId = process.env.SENIOR_CLIENT_ID
    const appKey = process.env.SENIOR_APP_KEY
    const appSecret = process.env.SENIOR_APP_SECRET
    const tenant = process.env.SENIOR_TENANT || "smart40"

    if (!clientId || !appKey || !appSecret) {
      throw new Error("Credenciais de aplicação não configuradas")
    }

    console.log("[v0] Autenticando com aplicação na API Senior X...")

    const response = await fetch(`${baseUrl}/platform/authentication/anonymous/loginWithKey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        client_id: clientId,
      },
      body: JSON.stringify({
        key: appKey,
        secret: appSecret,
        tenant: tenant,
      }),
    })

    if (!response.ok) {
      throw new Error(`Falha na autenticação com chave: ${response.status} ${response.statusText}`)
    }

    const authData: SeniorAuthResponse = await response.json()
    const tokenData: SeniorTokenData = JSON.parse(authData.jsonToken)

    // Armazenar token em cache
    cachedToken = tokenData.access_token
    tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000

    console.log("[v0] Token de aplicação obtido com sucesso")

    return tokenData.access_token
  } catch (error) {
    console.error("[v0] Erro ao obter token com chave:", error)
    throw error
  }
}

/**
 * Limpa o cache do token (útil para testes ou logout)
 */
export function clearTokenCache(): void {
  cachedToken = null
  tokenExpiry = null
  console.log("[v0] Cache de token limpo")
}
