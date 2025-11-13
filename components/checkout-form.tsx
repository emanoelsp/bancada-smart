"use client"

import type React from "react"

import { useState } from "react"
import { useCartStore } from "@/lib/cart-store"
import { BLOCK_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CredentialsForm } from "./credentials-form"

export function CheckoutForm() {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  })

  const total = getTotalPrice()

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tempCredentials = sessionStorage.getItem("seniorTempCredentials")

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerData: formData,
          items: items,
          ...(tempCredentials && { tempCredentials: JSON.parse(tempCredentials) }),
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar pedido")
      }

      const data = await response.json()

      clearCart()

      toast({
        title: "Pedido enviado com sucesso!",
        description: `Número do pedido: ${data.orderId}`,
      })

      const queryParams = new URLSearchParams({
        seniorOrderId: data.seniorOrderId || "",
        customerName: encodeURIComponent(formData.name),
        itemCount: items.length.toString(),
        total: total.toString(),
        statusCode: data.statusCode?.toString() || "200",
        timestamp: data.timestamp || "",
      })

      const seniorResponseEncoded = btoa(JSON.stringify(data.seniorResponse || {}))
      queryParams.append("apiResponse", seniorResponseEncoded)

      router.push(`/order-success/${data.orderId}?${queryParams.toString()}`)
    } catch (error) {
      console.error("[v0] Erro ao enviar pedido:", error)
      toast({
        title: "Erro ao enviar pedido",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

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

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Customer Form */}
          <div className="space-y-6 lg:col-span-2">
            <CredentialsForm />

            <Card>
              <CardHeader>
                <CardTitle>Dados do Solicitante</CardTitle>
                <CardDescription>Preencha os dados para identificação do pedido</CardDescription>
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
                      placeholder="João Silva"
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
                  <Label htmlFor="notes">Observações</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Informações adicionais sobre o pedido..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integração Bancada Smart 4.0</CardTitle>
                <CardDescription>Informações sobre o processamento do pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Envio para ERP Senior X</p>
                    <p className="text-sm text-muted-foreground">Pedido será registrado no sistema Senior X via API</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Encaminhamento para Bancada</p>
                    <p className="text-sm text-muted-foreground">
                      Sistema envia especificações para a Bancada Smart 4.0 da Exxer
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Produção Automatizada</p>
                    <p className="text-sm text-muted-foreground">
                      Bancada inicia produção das caixas com as cores configuradas
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
                    <span className="text-muted-foreground">Produção</span>
                    <span className="font-medium text-green-600">Incluído</span>
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
                  Ao confirmar, o pedido será enviado para o sistema Senior X e processado pela Bancada Smart 4.0
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
