"use client"

import { useCartStore } from "@/lib/cart-store"
import { BLOCK_TYPES, BOX_COLORS, SIDE_COLORS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BoxPreview3D } from "@/components/box-preview-3d"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

export function CartContent() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ShoppingBag className="mb-4 h-24 w-24 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Seu carrinho está vazio</h2>
        <p className="mb-6 text-muted-foreground">Adicione produtos para começar a montar seu pedido</p>
        <Link href="/">
          <Button size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para produtos
          </Button>
        </Link>
      </div>
    )
  }

  const total = getTotalPrice()

  const handleCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carrinho de Compras</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "produto" : "produtos"} no carrinho
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continuar comprando
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const blockTypeData = BLOCK_TYPES.find((bt) => bt.value === item.product.blockType)

            if (!blockTypeData) return null

            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{blockTypeData.label}</CardTitle>
                      <CardDescription>
                        {blockTypeData.boxes} {blockTypeData.boxes === 1 ? "caixa" : "caixas"} customizada
                        {blockTypeData.boxes > 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {/* Box Previews */}
                    <div className="flex flex-wrap gap-4">
                      {item.product.boxes.map((box, index) => (
                        <div key={index} className="text-center">
                          <div className="mb-2 text-xs font-medium text-muted-foreground">Caixa {index + 1}</div>
                          <BoxPreview3D configuration={box} size="sm" />
                          <div className="mt-2 space-y-1 text-xs">
                            <div>
                              Base:{" "}
                              <span className="font-medium">
                                {BOX_COLORS.find((c) => c.value === box.boxColor)?.label}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              L1: {SIDE_COLORS.find((c) => c.value === box.side1Color)?.label}
                            </div>
                            <div className="text-muted-foreground">
                              L2: {SIDE_COLORS.find((c) => c.value === box.side2Color)?.label}
                            </div>
                            <div className="text-muted-foreground">
                              L3: {SIDE_COLORS.find((c) => c.value === box.side3Color)?.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">R$ {blockTypeData.price.toFixed(2)} cada</div>
                        <div className="text-xl font-bold text-accent">
                          R$ {(blockTypeData.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
                      <span className="font-medium">R$ {((blockTypeData?.price || 0) * item.quantity).toFixed(2)}</span>
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
                  <span className="text-muted-foreground">Entrega</span>
                  <span className="font-medium text-green-600">Grátis</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-accent">R$ {total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button onClick={handleCheckout} size="lg" className="w-full">
                Finalizar Pedido
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="w-full text-destructive hover:text-destructive bg-transparent"
              >
                Limpar Carrinho
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
