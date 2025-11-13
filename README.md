# Sistema E-commerce Bancada Smart 4.0

Sistema de e-commerce para venda de caixas customizáveis com integração ao ERP Senior X e produção automatizada na Bancada Smart 4.0 da Exxer.

## Versão 1.0 - MVP

### Funcionalidades Implementadas

- **Catálogo de Produtos**: Seleção de blocos (simples, duplo, triplo)
- **Configurador 3D**: Customização de cores das caixas e laterais
  - Cores de caixas: Preta, Azul, Vermelha
  - Cores de laterais: Amarela, Azul, Verde, Vermelha
- **Carrinho de Compras**: Gerenciamento de produtos com persistência
- **Checkout**: Formulário de dados e finalização de pedido
- **Integração API Senior X**: Envio estruturado de pedidos
- **Autenticação Automática**: Token gerenciado automaticamente a cada pedido
- **Cache Inteligente**: Reutilização de tokens para otimização
- **Dados Mockados Smart 4.0**: Contexto empresarial pré-configurado

## Integração com Senior X Platform

### Autenticação Automática

O sistema implementa autenticação automática que é executada transparentemente a cada envio de pedido, com cache inteligente para evitar requisições desnecessárias.

#### Método 1: Autenticação com Aplicação (Recomendado)
- Usa chave e segredo de aplicação
- Não expira com política de senha
- Configurado via `SENIOR_APP_KEY` e `SENIOR_APP_SECRET`
- Cache de token com renovação automática

#### Método 2: Autenticação com Usuário e Senha (Fallback)
- Usa credenciais de usuário ativo
- Configurado via `SENIOR_USERNAME` e `SENIOR_PASSWORD`
- Ativado automaticamente se método 1 falhar

### Como Criar uma Aplicação na Senior X

1. Acesse: **Tecnologia > Administração > Gerenciamento de Aplicações**
2. Clique em **"Nova aplicação"**
3. Informe:
   - Nome: `Smart 4.0 E-commerce`
   - Descrição: `Integração e-commerce com bancada automática`
4. Após salvar, copie as credenciais geradas:
   - `client_id` → Variável `SENIOR_CLIENT_ID`
   - `key` → Variável `SENIOR_APP_KEY`
   - `secret` → Variável `SENIOR_APP_SECRET`
5. Configure permissões através de **Gerenciamento de Papéis**

### Dados Mockados Smart 4.0

Todos os campos de empresa e cliente que não são fornecidos pelo usuário usam dados mockados do contexto Smart 4.0:

**Empresa:**
- Código: 1
- Nome: Smart 4.0 Automação Industrial
- Filial: 1 - Fábrica Principal
- CNPJ: 12.345.678/0001-90
- Endereço: Rua da Automação Industrial, 4000 - São Paulo/SP
- Email: contato@smart40.com.br
- Site: https://exxer.com/serie/smart-4-0

**Cliente Padrão:**
- Código: 99999
- Nome: Cliente Smart 4.0
- CPF: 000.000.000-00
- Email: cliente@smart40.com.br

### Estrutura de Dados

#### Configuração de Caixa
\`\`\`typescript
{
  boxColor: 'black' | 'blue' | 'red',
  side1Color: 'yellow' | 'blue' | 'green' | 'red', // Frente
  side2Color: 'yellow' | 'blue' | 'green' | 'red', // Direita
  side3Color: 'yellow' | 'blue' | 'green' | 'red', // Topo
}
\`\`\`

#### Pedido para Senior X
\`\`\`json
{
  "tipPedido": "VEN",
  "codEmpresa": 1,
  "nomeEmpresa": "Smart 4.0 Automação Industrial",
  "codFilial": 1,
  "nomeFilial": "Fábrica Principal - Smart 4.0",
  "datPedido": "2024-01-01",
  "horPedido": "10:00:00",
  "codPessoa": 99999,
  "nomCliente": "Nome do Cliente",
  "email": "cliente@exemplo.com",
  "telefone": "(11) 9999-9999",
  "vlrTotal": 300.00,
  "qtdItens": 2,
  "itens": [
    {
      "sequencia": 1,
      "codProduto": "SMART40-SIMPLE-001",
      "nomProduto": "Bloco Simples",
      "quantidade": 2,
      "vlrUnitario": 150.00,
      "vlrTotal": 300.00,
      "unidade": "UN",
      "observacao": "Caixa 1: Preta [L1:Amarela L2:Azul L3:Verde]",
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
    }
  ],
  "metadados": {
    "sistema": "E-commerce Smart 4.0",
    "versao": "1.0",
    "destinoBancada": "SMART_4_0",
    "tipoProducao": "AUTOMATIZADA",
    "urlBancada": "https://exxer.com/serie/smart-4-0"
  }
}
\`\`\`

### Fluxo de Autenticação

\`\`\`
Cliente finaliza pedido
         ↓
Sistema verifica cache de token
         ↓
    Token válido?
    ↙           ↘
  Sim            Não
   ↓              ↓
   |    Autentica com aplicação
   |              ↓
   |         Sucesso?
   |         ↙      ↘
   |       Sim      Não
   |        ↓        ↓
   |        |   Fallback: user/pass
   |        ↓        ↓
   └─→ Token armazenado em cache
              ↓
    Envia pedido para API Senior X
              ↓
    Resposta encaminhada ao cliente
\`\`\`

### Próximas Versões

#### Versão 2.0
- Integração completa Bancada Smart 4.0
- Comunicação bidirecional com a bancada
- Status de produção em tempo real
- Fila de produção automatizada

#### Versão 3.0
- Sistema administrativo completo
- Cadastro de clientes e autenticação
- Cadastro e gestão de produtos
- Dashboard de estatísticas
- Acompanhamento de pedidos pelo cliente
- Relatórios e analytics em tempo real

### Configuração

1. Clone o repositório
2. Copie `.env.example` para `.env.local`
3. Configure as credenciais da API Senior X:

\`\`\`env
# API Senior X Platform
SENIOR_API_BASE_URL=https://api.senior.com.br
SENIOR_CLIENT_ID=seu_client_id_aqui

# Método 1: Aplicação (recomendado)
SENIOR_APP_KEY=sua_chave_de_aplicacao
SENIOR_APP_SECRET=seu_segredo_de_aplicacao
SENIOR_TENANT=smart40

# Método 2: Usuário e senha (fallback)
SENIOR_USERNAME=smart40_api
SENIOR_PASSWORD=sua_senha_aqui
\`\`\`

4. Instale as dependências e execute:

\`\`\`bash
npm install
npm run dev
\`\`\`

### Desenvolvimento

\`\`\`bash
npm install
npm run dev
\`\`\`

Acesse: http://localhost:3000

### Produção

O sistema está preparado para deploy na Vercel com integração automática.

### Tecnologias

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Zustand (state management)
- API Senior X Platform (integração ERP)
- Bancada Smart 4.0 Exxer (produção automatizada)

### Referências

- [API Senior X Platform - Consumindo API](https://api.xplatform.com.br/api-portal/pt-br/tutoriais/consumindo-uma-api)
- [Bancada Smart 4.0 - Exxer](https://exxer.com/serie/smart-4-0)
- [Documentação Senior X ERP](https://documentacao.senior.com.br/seniorxplatform/)

### Contato

Para dúvidas sobre integração ou customizações, consulte a documentação da API Senior X e da Bancada Smart 4.0.
