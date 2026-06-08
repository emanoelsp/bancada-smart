import { Header } from "@/components/header"
import { BlockConfigurator } from "@/components/block-configurator"
import { BLOCK_TYPES } from "@/lib/constants"
import { notFound } from "next/navigation"
import type { BlockType } from "@/lib/types"

interface ConfigurePageProps {
  params: Promise<{
    blockType: string
  }>
}

export default async function ConfigurePage({ params }: ConfigurePageProps) {
  const { blockType } = await params

  const blockTypeData = BLOCK_TYPES.find((bt) => bt.value === blockType)

  if (!blockTypeData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <BlockConfigurator blockType={blockType as BlockType} />
      </main>
    </div>
  )
}
