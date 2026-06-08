# Integração com API Senior X Platform

Este documento explica detalhadamente como funciona a integração do sistema de e-commerce Smart 4.0 com a API Senior X Platform para envio e processamento de pedidos.

## Sumário

1. [Visão Geral](#visão-geral)
2. [Fluxo de Autenticação](#fluxo-de-autenticação)
3. [Estrutura do Pedido](#estrutura-do-pedido)
4. [Dados Mockados Smart 4.0](#dados-mockados-smart-40)
5. [Processo de Envio](#processo-de-envio)
6. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Exemplos de Requisições](#exemplos-de-requisições)

---

## Visão Geral

O sistema integra-se com a **API Senior X Platform** para automatizar o registro de pedidos no ERP Senior X. O fluxo completo inclui:

1. **Configuração do Produto**: Usuário customiza caixas no e-commerce
2. **Carrinho de Compras**: Produtos são adicionados ao carrinho
3. **Checkout**: Usuário preenche dados e confirma pedido
4. **Autenticação Automática**: Sistema obtém token de acesso da API Senior X
5. **Envio do Pedido**: Dados estruturados são enviados para a API
6. **Confirmação**: Pedido é registrado no ERP e encaminhado para produção na Bancada Smart 4.0

---

## Fluxo de Autenticação

### Métodos Suportados

A integração suporta **dois métodos de autenticação**:

#### 1. Autenticação com Aplicação (Recomendado)

Usa **chave de aplicação** e **segredo** para obter token de acesso.

**Endpoint**: `POST /platform/authentication/anonymous/loginWithKey`

**Implementação**: Ver `lib/senior-api.ts` → função `getSeniorTokenWithKey()`

\`\`\`typescript
// Variáveis de ambiente necessárias:
SENIOR_CLIENT_ID=seu_client_id
SENIOR_APP_KEY=sua_chave_de_aplicacao
SENIOR_APP_SECRET=seu_segredo_de_aplicacao
SENIOR_TENANT=smart40

// Corpo da requisição:
{
  "key": "APP_KEY_AQUI",
  "secret": "APP_SECRET_AQUI",
  "tenant": "smart40"
}

// Resposta:
{
  "jsonToken": "{\"access_token\":\"TOKEN_JWT\",\"token_type\":\"Bearer\",\"expires_in\":3600}",
  "refreshToken": "REFRESH_TOKEN"
}
\`\`\`

#### 2. Autenticação com Usuário e Senha (Alternativa)

Usa **usuário** e **senha** para login tradicional.

**Endpoint**: `POST /platform/authentication/login`

**Implementação**: Ver `lib/senior-api.ts` → função `getSeniorToken()`

\`\`\`typescript
// Variáveis de ambiente necessárias:
SENIOR_CLIENT_ID=seu_client_id
SENIOR_USERNAME=seu_usuario
SENIOR_PASSWORD=sua_senha

// Corpo da requisição:
{
  "username": "smart40_api",
  "password": "senha_segura"
}
\`\`\`

### Cache de Token

O sistema implementa **cache inteligente** de tokens para evitar requisições desnecessárias:

- Token armazenado em memória durante sua validade
- Margem de segurança de **5 minutos** antes da expiração
- Renovação automática quando necessário

\`\`\`typescript
// Variáveis globais em lib/senior-api.ts
let cachedToken: string | null = null
let tokenExpiry: number | null = null

// Verificação antes de cada requisição
if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
  return cachedToken // Usa token em cache
}
// Caso contrário, solicita novo token
\`\`\`

### Estratégia de Fallback

O sistema tenta primeiro autenticação por aplicação e, em caso de falha, usa usuário/senha:

\`\`\`typescript
try {
  token = await getSeniorTokenWithKey() // Tenta com chave
} catch (error) {
  const { getSeniorToken } = await import("@/lib/senior-api")
  token = await getSeniorToken() // Fallback para usuário/senha
}
\`\`\`

---

## Estrutura do Pedido

### Formato JSON Enviado para API Senior X

A função `buildSeniorOrder()` em `lib/senior-order.ts` cria a estrutura completa do pedido:

\`\`\`typescript
interface SeniorOrderPayload {
  // Cabeçalho - Dados da Empresa
  tipPedido: "VEN"           // Tipo: Venda
  codEmpresa: 1              // Código mockado Smart 4.0
  nomeEmpresa: "Smart 4.0 Automação Industrial"
  codFilial: 1
  nomeFilial: "Fábrica Principal - Smart 4.0"
  datPedido: "2025-01-15"    // YYYY-MM-DD
  horPedido: "14:30:45"      // HH:MM:SS

  // Cliente
  codPessoa: 99999           // Código mockado
  nomCliente: "Nome do Cliente"
  tipPessoa: "F"             // F = Física, J = Jurídica
  cpfCnpj: "000.000.000-00"
  email: "cliente@email.com"
  telefone: "(11) 9999-9999"

  // Totais
  vlrTotal: 450.00
  vlrProdutos: 450.00
  qtdItens: 3

  // Itens do Pedido
  itens: [
    {
      sequencia: 1
      codProduto: "SMART40-SIMPLE-001"
      nomProduto: "Bloco Simples"
      quantidade: 1
      vlrUnitario: 150.00
      vlrTotal: 150.00
      unidade: "UN"
      observacao: "Caixa 1: Preta [L1:Amarelo L2:Azul L3:Verde]"
      dadosProducao: {
        tipoProduto: "BLOCO_SIMPLES"
        configuracoes: [
          {
            caixaIndex: 1
            corBase: "black"
            corLateral1: "yellow"
            corLateral2: "blue"
            corLateral3: "green"
          }
        ]
      }
    }
  ]

  // Observações
  observacoes: "Observações do cliente | Empresa: ACME Corp"

  // Metadados para Bancada Smart 4.0
  metadados: {
    sistema: "E-commerce Smart 4.0"
    versao: "1.0"
    destinoBancada: "SMART_4_0"
    tipoProducao: "AUTOMATIZADA"
    urlBancada: "https://exxer.com/serie/smart-4-0"
  }
}
\`\`\`

### Detalhamento dos Campos

#### Dados de Produção por Item

Cada item do pedido contém configurações detalhadas para a Bancada Smart 4.0:

\`\`\`typescript
dadosProducao: {
  tipoProduto: "BLOCO_SIMPLES" | "BLOCO_DUPLO" | "BLOCO_TRIPLO"
  configuracoes: [
    {
      caixaIndex: 1,              // Índice da caixa no bloco
      corBase: "black" | "blue" | "red",  // Cor da estrutura
      corLateral1: "yellow" | "blue" | "green" | "red",  // Frente
      corLateral2: "yellow" | "blue" | "green" | "red",  // Direita
      corLateral3: "yellow" | "blue" | "green" | "red"   // Topo
    }
  ]
}
\`\`\`

#### Tipos de Bloco

| Tipo | Código | Caixas | Preço Base |
|------|--------|--------|------------|
| Bloco Simples | `BLOCO_SIMPLES` | 1 | R$ 150,00 |
| Bloco Duplo | `BLOCO_DUPLO` | 2 | R$ 250,00 |
| Bloco Triplo | `BLOCO_TRIPLO` | 3 | R$ 350,00 |

---

## Dados Mockados Smart 4.0

Como esta é a **versão 1.0** (sem cadastro de clientes/produtos), o sistema utiliza dados mockados do contexto Smart 4.0.

### Empresa Smart 4.0

Definido em `lib/senior-order.ts` → `SMART40_COMPANY_DATA`:

\`\`\`typescript
{
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
    pais: "Brasil"
  },
  contato: {
    telefone: "(11) 3000-4000",
    email: "contato@smart40.com.br",
    site: "https://exxer.com/serie/smart-4-0"
  }
}
\`\`\`

### Cliente Padrão

\`\`\`typescript
{
  codPessoa: 99999,
  nomPessoa: "Cliente Smart 4.0",
  tipPessoa: "F",
  cpfCnpj: "000.000.000-00",
  email: "cliente@smart40.com.br",
  telefone: "(11) 9999-9999"
}
\`\`\`

**Importante**: Os dados do cliente fornecidos no formulário de checkout (nome, email, telefone) **sobrescrevem** os dados mockados, mas mantêm os códigos e tipos padrão.

---

## Processo de Envio

### Sequência Completa

\`\`\`mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as E-commerce
    participant API as app/api/orders/create
    participant Auth as lib/senior-api
    participant Builder as lib/senior-order
    participant Senior as API Senior X

    User->>Frontend: Preenche checkout
    Frontend->>API: POST /api/orders/create
    API->>Auth: getSeniorToken()
    Auth->>Senior: POST /authentication/loginWithKey
    Senior-->>Auth: Token JWT
    Auth-->>API: Token
    API->>Builder: buildSeniorOrder()
    Builder-->>API: Pedido estruturado
    API->>Senior: POST /platform/erp/api/pedidos
    Senior-->>API: Confirmação
    API-->>Frontend: orderId + seniorOrderId
    Frontend->>User: Página de sucesso
\`\`\`

### Implementação em `app/api/orders/create/route.ts`

\`\`\`typescript
export async function POST(request: NextRequest) {
  // 1. Receber dados do checkout
  const { customerData, items } = await request.json()

  // 2. Gerar ID único do pedido
  const orderId = `SMART40-${Date.now()}-${randomString}`

  // 3. Estruturar pedido no formato Senior X
  const seniorOrder = buildSeniorOrder(items, customerData)

  // 4. Autenticar (com cache inteligente)
  const token = await getSeniorTokenWithKey()

  // 5. Enviar para API Senior X
  const response = await fetch(`${baseUrl}/platform/erp/api/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "client_id": clientId
    },
    body: JSON.stringify(seniorOrder)
  })

  // 6. Retornar confirmação
  return NextResponse.json({
    success: true,
    orderId: orderId,
    seniorOrderId: response.id,
    message: "Pedido enviado para Bancada Smart 4.0"
  })
}
\`\`\`

---

## Configuração de Variáveis de Ambiente

### Arquivo `.env.local`

Crie o arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

\`\`\`bash
# API Senior X Platform
SENIOR_API_BASE_URL=https://api.senior.com.br
SENIOR_CLIENT_ID=seu_client_id_aqui

# Método 1: Autenticação com Aplicação (Recomendado)
SENIOR_APP_KEY=sua_chave_de_aplicacao
SENIOR_APP_SECRET=seu_segredo_de_aplicacao
SENIOR_TENANT=smart40

# Método 2: Autenticação com Usuário (Alternativa)
SENIOR_USERNAME=smart40_api
SENIOR_PASSWORD=sua_senha_segura
\`\`\`

### Como Obter as Credenciais

1. **Acesse o Portal Senior X**: https://api.xplatform.com.br
2. **Crie uma Aplicação**:
   - Vá em "Minhas Aplicações"
   - Clique em "Nova Aplicação"
   - Anote o `client_id`, `app_key` e `app_secret`
3. **Configure Permissões**:
   - Habilite acesso à API de Pedidos de Venda
   - Configure o tenant (ambiente)

### Validação

Para verificar se as credenciais estão corretas:

\`\`\`bash
# Execute um teste de autenticação
curl -X POST https://api.senior.com.br/platform/authentication/anonymous/loginWithKey \
  -H "Content-Type: application/json" \
  -H "client_id: SEU_CLIENT_ID" \
  -d '{
    "key": "SUA_APP_KEY",
    "secret": "SEU_APP_SECRET",
    "tenant": "smart40"
  }'
\`\`\`

---

## Tratamento de Erros

### Logs Detalhados

O sistema utiliza `console.log("[v0] ...")` para rastreamento:

\`\`\`typescript
console.log("[v0] Criando pedido para:", customerData.name)
console.log("[v0] Total de itens:", items.length)
console.log("[v0] Pedido estruturado:", JSON.stringify(seniorOrder, null, 2))
console.log("[v0] Autenticando na API Senior X...")
console.log("[v0] Token obtido com sucesso")
console.log("[v0] Enviando pedido para Senior X:", apiEndpoint)
console.log("[v0] Resposta da Senior X:", seniorData)
\`\`\`

### Tratamento de Falhas

\`\`\`typescript
try {
  // Tentativa de envio
} catch (error) {
  console.error("[v0] Erro ao criar pedido:", error)
  return NextResponse.json({
    success: false,
    error: "Erro ao processar pedido",
    details: error.message
  }, { status: 500 })
}
\`\`\`

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `401 Unauthorized` | Credenciais inválidas | Verificar variáveis de ambiente |
| `403 Forbidden` | Sem permissão na API | Configurar permissões no portal Senior |
| `404 Not Found` | Endpoint incorreto | Verificar URL base da API |
| `500 Internal Server Error` | Erro no servidor Senior | Verificar logs e estrutura do pedido |
| `Token expirado` | Cache desatualizado | Sistema renova automaticamente |

---

## Exemplos de Requisições

### Exemplo Completo de Pedido

\`\`\`json
{
  "tipPedido": "VEN",
  "codEmpresa": 1,
  "nomeEmpresa": "Smart 4.0 Automação Industrial",
  "codFilial": 1,
  "nomeFilial": "Fábrica Principal - Smart 4.0",
  "datPedido": "2025-01-15",
  "horPedido": "14:30:45",
  "codPessoa": 99999,
  "nomCliente": "João Silva",
  "tipPessoa": "F",
  "cpfCnpj": "000.000.000-00",
  "email": "joao@empresa.com",
  "telefone": "(47) 99999-9999",
  "vlrTotal": 750.00,
  "vlrProdutos": 750.00,
  "qtdItens": 5,
  "itens": [
    {
      "sequencia": 1,
      "codProduto": "SMART40-SIMPLE-001",
      "nomProduto": "Bloco Simples",
      "quantidade": 1,
      "vlrUnitario": 150.00,
      "vlrTotal": 150.00,
      "unidade": "UN",
      "observacao": "Caixa 1: Preta [L1:Amarelo L2:Azul L3:Verde]",
      "dadosProducao": {
        "tipoProduto": "BLOCO_SIMPLES",
        "configuracoes": [
          {
            "caixaIndex": 1,
            "corBase": "black",
            "corLateral1": "yellow",
            "corLateral2": "blue",
            "corLateral3": "green"
          }
        ]
      }
    },
    {
      "sequencia": 2,
      "codProduto": "SMART40-DOUBLE-002",
      "nomProduto": "Bloco Duplo",
      "quantidade": 2,
      "vlrUnitario": 250.00,
      "vlrTotal": 500.00,
      "unidade": "UN",
      "observacao": "Caixa 1: Azul [L1:Verde L2:Vermelha L3:Amarelo] | Caixa 2: Vermelha [L1:Azul L2:Amarelo L3:Verde]",
      "dadosProducao": {
        "tipoProduto": "BLOCO_DUPLO",
        "configuracoes": [
          {
            "caixaIndex": 1,
            "corBase": "blue",
            "corLateral1": "green",
            "corLateral2": "red",
            "corLateral3": "yellow"
          },
          {
            "caixaIndex": 2,
            "corBase": "red",
            "corLateral1": "blue",
            "corLateral2": "yellow",
            "corLateral3": "green"
          }
        ]
      }
    }
  ],
  "observacoes": "Urgente - Prazo de 3 dias | Empresa: ACME Corporation",
  "metadados": {
    "sistema": "E-commerce Smart 4.0",
    "versao": "1.0",
    "destinoBancada": "SMART_4_0",
    "tipoProducao": "AUTOMATIZADA",
    "urlBancada": "https://exxer.com/serie/smart-4-0"
  }
}
\`\`\`

### Resposta de Sucesso

\`\`\`json
{
  "success": true,
  "orderId": "SMART40-1705332645789-ABC123",
  "seniorOrderId": "PED-2025-001234",
  "message": "Pedido criado com sucesso e enviado para produção na Bancada Smart 4.0",
  "seniorResponse": {
    "id": "PED-2025-001234",
    "status": "PENDENTE",
    "dataRegistro": "2025-01-15T14:30:45Z"
  }
}
\`\`\`

---

## Próximas Versões

### Versão 2.0 (Planejado)

- Comunicação direta com API da Bancada Smart 4.0
- Envio automático de especificações de produção
- Status em tempo real da fabricação

### Versão 3.0 (Planejado)

- Painel administrativo completo
- Estatísticas de pedidos em tempo real
- Acompanhamento de produção pelo cliente
- Integração com sistema de notificações

---

## Suporte e Documentação

- **Documentação Senior X**: https://api.xplatform.com.br/api-portal/pt-br/tutoriais
- **Portal de APIs**: https://api.xplatform.com.br
- **Bancada Smart 4.0**: https://exxer.com/serie/smart-4-0
- **Projeto Conecta 4.0**: UniSENAI SC

---

**Desenvolvido pelo Grupo de Pesquisa Conecta 4.0 - UniSENAI SC**  
Em parceria com Senior Sistemas e Exxer (Bancada Smart 4.0)
