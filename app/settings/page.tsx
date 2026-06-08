import { Header } from "@/components/header"
import { SettingsForm } from "@/components/settings-form"

interface SettingsPageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { redirect } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configurações da API Senior X</h1>
          <p className="text-muted-foreground">Gerencie as credenciais de integração com o ERP</p>
        </div>
        <SettingsForm redirectTo={redirect || "/checkout"} />
      </main>
    </div>
  )
}
