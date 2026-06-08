"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCartStore } from "@/lib/cart-store"
import { BLOCK_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, AlertTriangle, Settings, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useCredentialsStore } from "@/lib/credentials-store"
import { SeniorSetupGuide } from "@/components/senior-setup-guide"

export function CheckoutForm() {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const { toast } = useToast()
  const { credentials, isConfigured } = useCredentialsStore()

  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [seniorError, setSeniorError] = useState<string | null>(null)
  const [seniorDebug, setSeniorDebug] = useState<Record<string, unknown> | null>(null)
  const [debugOpen, setDebugOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  })

  const total = getTotalPrice()

  useEffect(() => {
    if (items.length === 0) router.push("/cart")
  }, [items.length, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleConfigured = () => {
    setConfigured(true)
    toast({
      title: "Configuracoes salvas!",
      description: "Credenciais da API Senior X configuradas. Voce ja pode finalizar o pedido.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setSeniorError(null)
    setSeniorDebug(null)

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerData: formData,
          items: items,
          seniorCredentials: credentials,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.details || errData.error || "Erro ao criar pedido")
      }

      const data = await response.json()

      // Always capture debug info
      if (data.seniorDebug) setSeniorDebug(data.seniorDebug)

      if (data.seniorError) {
        // Show error in UI but don't block — order was saved locally
        setSeniorError(data.seniorError)
        setDebugOpen(true)
        setLoading(false)
        return
      }

      clearCart()

      toast({
        title: "Pedido enviado com sucesso!",
        description: `Aceito pelo ERP Senior X (ID: ${data.seniorExternalId || data.orderId})`,
      })

      const queryParams = new URLSearchParams({
        seniorOrderId: data.seniorExternalId || "",
        customerName: encodeURIComponent(formData.name),
        itemCount: items.length.toString(),
        total: total.toString(),
      })

      router.push(`/order-success/${data.orderId}?${queryParams.toString()}`)
    } catch (error) {
      console.error("[checkout] Erro ao enviar pedido:", error)
      const msg = error instanceof Error ? error.message : "Erro desconhecido"
      setSeniorError(msg)
      setDebugOpen(true)
      toast({
        title: "Erro ao enviar pedido",
        description: msg.slice(0, 100),
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const apiReady = configured || isConfigured()

  // Not configured: show setup guide inline
  if (!apiReady) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finalizar Pedido</h1>
            <p className="text-muted-foreground">Complete os dados para enviar seu pedido</p>
          </div>
          <Link href="/cart">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao carrinho
            </Button>
          </Link>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Configuracao necessaria antes de finalizar o pedido</p>
            <p className="text-sm mt-1">
              Para finalizar o pedido, configure a integracao com o ERP Senior X. Siga o guia abaixo para obter
              suas credenciais e configurar o acesso.
            </p>
          </div>
        </div>

        {/* Inline setup guide */}
        <SeniorSetupGuide onConfigured={handleConfigured} />
      </div>
    )
  }

  // Configured: show normal checkout form
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finalizar Pedido</h1>
          <p className="text-muted-foreground">Complete os dados para enviar seu pedido</p>
        </div>
        <Link href="/cart">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao carrinho
          </Button>
        </Link>
      </div>

      {/* Senior API error panel */}
      {seniorError && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950">
          <button
            type="button"
            onClick={() => setDebugOpen((v) => !v)}
            className="flex w-full items-start gap-3 p-4 text-left text-red-800 dark:text-red-200"
          >
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Falha ao enviar para o ERP Senior X</p>
              <p className="text-sm mt-1 font-mono break-all">{seniorError.split("\n")[0]}</p>
            </div>
            {debugOpen ? <ChevronDown className="h-4 w-4 mt-1 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />}
          </button>

          {debugOpen && (
            <div className="border-t border-red-200 dark:border-red-700 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Erro completo:</p>
                <pre className="text-xs bg-red-100 dark:bg-red-900 rounded p-3 overflow-auto max-h-40 whitespace-pre-wrap break-all text-red-900 dark:text-red-100">
                  {seniorError}
                </pre>
              </div>
              {seniorDebug && (
                <div>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Payload enviado:</p>
                  <pre className="text-xs bg-red-100 dark:bg-red-900 rounded p-3 overflow-auto max-h-60 whitespace-pre-wrap break-all text-red-900 dark:text-red-100">
                    {JSON.stringify(seniorDebug, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Customer Form */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Solicitante</CardTitle>
                <CardDescription>Preencha os dados para identificacao do pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Joao Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="joao@empresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(47) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observacoes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Informacoes adicionais sobre o pedido..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integracao Bancada Smart 4.0</CardTitle>
                <CardDescription>Informacoes sobre o processamento do pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Envio para ERP Senior X</p>
                    <p className="text-sm text-muted-foreground">Pedido sera registrado no sistema Senior X via API</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Encaminhamento para Bancada</p>
                    <p className="text-sm text-muted-foreground">
                      Sistema envia especificacoes para a Bancada Smart 4.0 da Exxer
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Producao Automatizada</p>
                    <p className="text-sm text-muted-foreground">
                      Bancada inicia producao das caixas com as cores configuradas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => {
                    const blockTypeData = BLOCK_TYPES.find((bt) => bt.value === item.product.blockType)
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {blockTypeData?.label}
                        </span>
                        <span className="font-medium">
                          R$ {((blockTypeData?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Producao</span>
                    <span className="font-medium text-green-600">Incluido</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-accent">R$ {total.toFixed(2)}</span>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Ao confirmar, o pedido sera enviado para o sistema Senior X e processado pela Bancada Smart 4.0
                </p>

                <div className="flex justify-center pt-1">
                  <Link href="/settings" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="h-3 w-3" />
                    Configuracoes da API
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
