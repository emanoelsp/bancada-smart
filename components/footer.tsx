import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Seção do Projeto */}
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Projeto de Pesquisa e Desenvolvimento</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            Sistema de e-commerce integrado à Bancada Smart 4.0 desenvolvido pelo grupo de pesquisa Conecta 4.0, unindo
            tecnologia de ponta, automação industrial e inovação acadêmica para revolucionar a produção de componentes
            customizados.
          </p>
        </div>

        {/* Parceiros */}
        <div className="text-center">
          <h4 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Realização</h4>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Conecta 4.0 */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-36 relative flex items-center justify-center bg-background rounded-lg p-3 border hover:border-accent transition-colors">
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">Conecta 4.0</div>
                  <div className="text-xs text-muted-foreground">Grupo de Pesquisa</div>
                </div>
              </div>
            </div>

            {/* UniSENAI SC */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-36 relative flex items-center justify-center bg-white rounded-lg p-3 border hover:border-accent transition-colors">
                <Image
                  src="/images/unisenai.png"
                  alt="UniSENAI"
                  width={140}
                  height={60}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Senior Sistemas */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-36 relative flex items-center justify-center bg-white rounded-lg p-3 border hover:border-accent transition-colors">
                <Image
                  src="/images/senioro.png"
                  alt="Senior"
                  width={140}
                  height={60}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Grupo Conecta 4.0. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
