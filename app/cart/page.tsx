import { Header } from "@/components/header"
import { CartContent } from "@/components/cart-content"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <CartContent />
      </main>
    </div>
  )
}
