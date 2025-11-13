import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BLOCK_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Box, Package, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-balance">Configure suas caixas personalizadas</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground text-pretty">
            Sistema integrado com a Bancada Smart 4.0 da Exxer para produção automatizada de caixas customizadas
          </p>
        </section>

        {/* Products Grid */}
        <section>
          <h2 className="mb-8 text-3xl font-bold">Escolha seu tipo de bloco</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {BLOCK_TYPES.map((blockType) => (
              <Card key={blockType.value} className="flex flex-col">
                <CardHeader>
                  <div className="mb-4 flex h-32 items-center justify-center bg-muted rounded-lg">
                    <Box className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <CardTitle>{blockType.label}</CardTitle>
                  <CardDescription>{blockType.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantidade de caixas:</span>
                      <span className="font-semibold">{blockType.boxes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Preço:</span>
                      <span className="text-2xl font-bold text-accent">R$ {blockType.price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href={`/configure/${blockType.value}`} className="w-full">
                    <Button className="w-full" size="lg">
                      Configurar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Box className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Customização Total</h3>
            <p className="text-sm text-muted-foreground">
              Escolha a cor da caixa e personalize cada uma das 3 laterais
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Package className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Produção Automatizada</h3>
            <p className="text-sm text-muted-foreground">
              Integrado com a Bancada Smart 4.0 da Exxer para fabricação rápida
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <ShoppingCart className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Pedidos Simplificados</h3>
            <p className="text-sm text-muted-foreground">Sistema integrado com ERP Senior X para gestão completa</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
