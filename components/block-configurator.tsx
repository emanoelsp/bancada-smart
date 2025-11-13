"use client"

import { useState } from "react"
import type { BlockType, BoxConfiguration, Product } from "@/lib/types"
import { BLOCK_TYPES, BOX_COLORS, SIDE_COLORS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BoxPreview3D } from "@/components/box-preview-3d"
import { useCartStore } from "@/lib/cart-store"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BlockConfiguratorProps {
  blockType: BlockType
}

export function BlockConfigurator({ blockType }: BlockConfiguratorProps) {
  const initialBoxConfig: BoxConfiguration = {
    boxColor: undefined,
    side1Color: undefined,
    side2Color: undefined,
    side3Color: undefined,
  }

  const [boxes, setBoxes] = useState<BoxConfiguration[]>(
    Array(BLOCK_TYPES.find((bt) => bt.value === blockType)?.boxes || 0)
      .fill(null)
      .map(() => ({ ...initialBoxConfig })),
  )

  const [activeBoxIndex, setActiveBoxIndex] = useState(0)

  const router = useRouter()
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)

  const blockTypeData = BLOCK_TYPES.find((bt) => bt.value === blockType)

  if (!blockTypeData) return null

  const updateBoxConfig = (index: number, updates: Partial<BoxConfiguration>) => {
    setBoxes((prev) => prev.map((box, i) => (i === index ? { ...box, ...updates } : box)))
  }

  const handleAddToCart = () => {
    const product: Product = {
      id: crypto.randomUUID(),
      blockType,
      boxes,
      quantity: 1,
    }

    addItem(product)

    toast({
      title: "Produto adicionado!",
      description: `${blockTypeData.label} foi adicionado ao carrinho.`,
    })

    router.push("/cart")
  }

  const activeBox = boxes[activeBoxIndex]

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Preview Section */}
      <div className="space-y-6">
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{blockTypeData.label}</CardTitle>
            <CardDescription>{blockTypeData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-8">
              <div className="w-full text-center space-y-2 bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium">Configure sua caixa personalizada</p>
                <p className="text-xs text-muted-foreground">
                  Escolha a cor da caixa base. As laterais serão montadas conforme você seleciona as cores.
                </p>
              </div>

              {/* Preview 3D de todas as caixas */}
              <div className="flex flex-wrap justify-center gap-8">
                {boxes.map((box, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg p-4 transition-all ${
                      activeBoxIndex === index ? "bg-accent/10 ring-2 ring-accent" : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveBoxIndex(index)}
                  >
                    <div className="mb-2 text-center text-sm font-medium">Caixa {index + 1}</div>
                    <BoxPreview3D configuration={box} size="md" />
                  </div>
                ))}
              </div>

              <div className="w-full space-y-2 rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{blockTypeData.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade de caixas:</span>
                  <span className="font-medium">{blockTypeData.boxes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preço:</span>
                  <span className="text-2xl font-bold text-accent">R$ {blockTypeData.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configure a Caixa {activeBoxIndex + 1}</CardTitle>
            <CardDescription>Selecione a cor da caixa e das laterais customizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cor da Caixa */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Cor da Caixa</Label>
              <RadioGroup
                value={activeBox.boxColor}
                onValueChange={(value) => updateBoxConfig(activeBoxIndex, { boxColor: value as any })}
              >
                <div className="grid gap-3">
                  {BOX_COLORS.map((color) => (
                    <div key={color.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={color.value} id={`box-${color.value}`} />
                      <Label
                        htmlFor={`box-${color.value}`}
                        className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted"
                      >
                        <div
                          className="h-8 w-8 rounded border-2 border-foreground/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-medium">{color.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Cores das Laterais */}
            <Tabs defaultValue="side1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="side1">Lateral 1</TabsTrigger>
                <TabsTrigger value="side2">Lateral 2</TabsTrigger>
                <TabsTrigger value="side3">Lateral 3</TabsTrigger>
              </TabsList>

              <TabsContent value="side1" className="space-y-3 pt-4">
                <Label className="text-base font-semibold">Cor da Lateral 1 (Frente)</Label>
                <RadioGroup
                  value={activeBox.side1Color}
                  onValueChange={(value) => updateBoxConfig(activeBoxIndex, { side1Color: value as any })}
                >
                  <div className="grid gap-3">
                    {SIDE_COLORS.map((color) => (
                      <div key={color.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={color.value} id={`side1-${color.value}`} />
                        <Label
                          htmlFor={`side1-${color.value}`}
                          className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted"
                        >
                          <div
                            className="h-8 w-8 rounded border-2 border-foreground/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-medium">{color.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </TabsContent>

              <TabsContent value="side2" className="space-y-3 pt-4">
                <Label className="text-base font-semibold">Cor da Lateral 2 (Direita)</Label>
                <RadioGroup
                  value={activeBox.side2Color}
                  onValueChange={(value) => updateBoxConfig(activeBoxIndex, { side2Color: value as any })}
                >
                  <div className="grid gap-3">
                    {SIDE_COLORS.map((color) => (
                      <div key={color.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={color.value} id={`side2-${color.value}`} />
                        <Label
                          htmlFor={`side2-${color.value}`}
                          className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted"
                        >
                          <div
                            className="h-8 w-8 rounded border-2 border-foreground/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-medium">{color.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </TabsContent>

              <TabsContent value="side3" className="space-y-3 pt-4">
                <Label className="text-base font-semibold">Cor da Lateral 3 (Esquerda)</Label>
                <RadioGroup
                  value={activeBox.side3Color}
                  onValueChange={(value) => updateBoxConfig(activeBoxIndex, { side3Color: value as any })}
                >
                  <div className="grid gap-3">
                    {SIDE_COLORS.map((color) => (
                      <div key={color.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={color.value} id={`side3-${color.value}`} />
                        <Label
                          htmlFor={`side3-${color.value}`}
                          className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted"
                        >
                          <div
                            className="h-8 w-8 rounded border-2 border-foreground/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-medium">{color.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleAddToCart} size="lg" className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  )
}
