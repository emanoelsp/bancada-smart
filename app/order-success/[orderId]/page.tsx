import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, AlertCircle, Home, ShoppingCart, Package, Clock, Code2, Database } from "lucide-react"
import Link from "next/link"

interface OrderSuccessPageProps {
  params: {
    orderId: string
  }
  searchParams: {
    seniorOrderId?: string
    customerName?: string
    itemCount?: string
    total?: string
    statusCode?: string
    timestamp?: string
    apiResponse?: string
  }
}

export default function OrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
  const { orderId } = params
  const { seniorOrderId, customerName, itemCount, total, statusCode, timestamp, apiResponse } = searchParams

  // Decodificar resposta da API
  let seniorResponseData: any = null
  if (apiResponse) {
    try {
      seniorResponseData = JSON.parse(atob(apiResponse))
    } catch (e) {
      console.error("Erro ao decodificar resposta da API:", e)
    }
  }

  const statusCodeNum = Number.parseInt(statusCode || "200")
  const isSuccess = statusCodeNum >= 200 && statusCodeNum < 300

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Confirmação de Sucesso */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                isSuccess ? "bg-green-500/10" : "bg-yellow-500/10"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              ) : (
                <AlertCircle className="h-10 w-10 text-yellow-500" />
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">{isSuccess ? "Pedido Enviado com Sucesso!" : "Pedido Recebido"}</h1>
            <p className="text-xl text-muted-foreground">
              Seu pedido foi recebido e será processado pela Bancada Smart 4.0
            </p>
          </div>

          {/* Status da Integração Senior X */}
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Status da Integração Senior X
              </CardTitle>
              <CardDescription>Resposta do servidor de integração</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Code */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Código de Status HTTP</div>
                  <div className="font-mono font-bold text-lg">{statusCode || "200"}</div>
                </div>
                <Badge
                  className={`${
                    isSuccess
                      ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
                      : "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20"
                  }`}
                >
                  {isSuccess ? "Sucesso" : "Processando"}
                </Badge>
              </div>

              {/* Timestamp */}
              {timestamp && (
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="text-sm text-muted-foreground mb-1">Hora do Processamento</div>
                  <div className="font-mono text-sm">{new Date(timestamp).toLocaleString("pt-BR")}</div>
                </div>
              )}

              {/* Resposta da API */}
              {seniorResponseData && (
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-4 w-4 text-blue-600" />
                    <div className="text-sm font-semibold text-muted-foreground">Resposta da API</div>
                  </div>
                  <pre className="text-xs overflow-auto max-h-48 bg-slate-900 text-slate-100 p-3 rounded font-mono">
                    {JSON.stringify(seniorResponseData, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhes do Pedido */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Detalhes do Pedido
              </CardTitle>
              <CardDescription>Informações completas sobre seu pedido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ID do Pedido Smart 4.0 */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">ID do Pedido Smart 4.0</div>
                  <div className="font-mono font-bold text-lg">{orderId}</div>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Em Processamento
                </Badge>
              </div>

              {/* ID do Pedido Senior */}
              {seniorOrderId && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">ID do Pedido Senior X</div>
                    <div className="font-mono font-semibold">{seniorOrderId}</div>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Senior X</Badge>
                </div>
              )}

              <Separator />

              {/* Informações do Cliente */}
              {customerName && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Cliente</div>
                  <div className="font-semibold">{decodeURIComponent(customerName)}</div>
                </div>
              )}

              {/* Resumo do Pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Quantidade de Itens</div>
                  <div className="font-semibold text-lg">{itemCount || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Valor Total</div>
                  <div className="font-bold text-2xl text-accent">
                    R$ {total ? Number.parseFloat(total).toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Passos */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold mb-1">Processamento do Pedido</div>
                  <div className="text-sm text-muted-foreground">
                    Seu pedido foi enviado para o sistema ERP Senior X e está sendo validado.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold mb-1">Encaminhamento para Produção</div>
                  <div className="text-sm text-muted-foreground">
                    As configurações serão enviadas automaticamente para a Bancada Smart 4.0 da Exxer.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold mb-1">Fabricação Automatizada</div>
                  <div className="text-sm text-muted-foreground">
                    A bancada iniciará a produção das caixas customizadas conforme suas especificações.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  4
                </div>
                <div>
                  <div className="font-semibold mb-1">Finalização e Notificação</div>
                  <div className="text-sm text-muted-foreground">
                    Você será notificado quando seu pedido estiver pronto para retirada ou envio.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Voltar para Início
              </Button>
            </Link>
            <Link href="/cart" className="flex-1">
              <Button size="lg" className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Fazer Novo Pedido
              </Button>
            </Link>
          </div>

          {/* Informação Adicional */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Integração Smart 4.0 v1.0:</strong> Seu pedido foi processado com sucesso através da integração
              com o ERP Senior X. Você pode acompanhar o progresso da produção através do número do pedido Senior acima.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
