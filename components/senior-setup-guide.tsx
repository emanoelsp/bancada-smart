"use client"

import { useState } from "react"
import { SettingsForm } from "@/components/settings-form"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Key,
  Settings,
  UserPlus,
  Layers,
  AlertTriangle,
} from "lucide-react"

interface SeniorSetupGuideProps {
  onConfigured: () => void
}

interface Step {
  id: number
  icon: React.ReactNode
  title: string
  description: string
  details: Array<{
    text: string
    link?: { href: string; label: string }
    warning?: boolean
  }>
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: <UserPlus className="h-5 w-5" />,
    title: "Criar conta no Portal do Desenvolvedor",
    description: "Acesse o Portal do Desenvolvedor Senior X e crie sua conta gratuita.",
    details: [
      {
        text: "Acesse o Portal do Desenvolvedor Senior X:",
        link: {
          href: "http://api.xplatform.com.br/api-portal/pt-br/user/register",
          label: "Criar conta no portal",
        },
      },
      { text: "Preencha nome, e-mail e senha" },
      { text: "Confirme seu e-mail para ativar a conta" },
    ],
  },
  {
    id: 2,
    icon: <Layers className="h-5 w-5" />,
    title: "Criar uma Aplicacao",
    description: "Registre uma nova aplicacao no portal para obter seu CLIENT_ID.",
    details: [
      {
        text: "Apos o login, acesse Meus Apps:",
        link: {
          href: "http://api.xplatform.com.br/api-portal/pt-br/myapps/new",
          label: "Nova Aplicacao",
        },
      },
      { text: "Clique em \"Nova Aplicacao\"" },
      { text: "Preencha: Nome da aplicacao (ex: \"Bancada Smart 4.0\") e descricao" },
      { text: "Selecione as APIs: ERP - Mercado - Pedido" },
      { text: "Salve e copie o CLIENT_ID exibido na tela" },
    ],
  },
  {
    id: 3,
    icon: <Key className="h-5 w-5" />,
    title: "Gerar Chave de Aplicacao no ERP Senior",
    description: "No sistema Senior X, gere as credenciais de autenticacao para sua aplicacao.",
    details: [
      { text: "No sistema Senior X, acesse: Tecnologia > Administracao > Gestao de Aplicacoes" },
      { text: "Localize a aplicacao criada (\"Bancada Smart 4.0\")" },
      { text: "Clique em \"Gerar Chave\"" },
      { text: "Copie o APP KEY e APP SECRET gerados" },
      {
        text: "O App Secret so e exibido uma vez — salve imediatamente!",
        warning: true,
      },
    ],
  },
  {
    id: 4,
    icon: <Settings className="h-5 w-5" />,
    title: "Configurar nesta aplicacao",
    description: "Com todas as credenciais em maos, preencha o formulario abaixo.",
    details: [
      { text: "Com CLIENT_ID, APP KEY e APP SECRET em maos" },
      { text: "Preencha o formulario abaixo com suas credenciais" },
      { text: "Clique em \"Testar Conexao\" para validar" },
      { text: "Salve as configuracoes para comecar a enviar pedidos" },
    ],
  },
]

function StepCard({ step, isActive, onToggle }: { step: Step; isActive: boolean; onToggle: () => void }) {
  const isLastStep = step.id === 4

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isActive
          ? "border-accent/50 bg-accent/5 shadow-sm"
          : "border-border bg-card hover:border-accent/30 hover:bg-accent/5"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-center gap-4 p-4 text-left"
        onClick={onToggle}
        aria-expanded={isActive}
      >
        {/* Step badge */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold text-sm transition-colors ${
            isActive
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {step.icon}
        </div>

        {/* Step info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                isActive ? "text-accent" : "text-muted-foreground"
              }`}
            >
              Passo {step.id}
            </span>
          </div>
          <h3 className="font-semibold text-foreground mt-0.5">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{step.description}</p>
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0 text-muted-foreground">
          {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isActive && (
        <div className="px-4 pb-4">
          <div className="ml-14 space-y-3">
            {step.details.map((detail, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    detail.warning ? "text-amber-500" : "text-green-500"
                  }`}
                />
                <div className="space-y-1">
                  <p
                    className={`text-sm ${
                      detail.warning
                        ? "font-medium text-amber-700 dark:text-amber-400"
                        : "text-foreground/80"
                    }`}
                  >
                    {detail.warning && <AlertTriangle className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                    {detail.text}
                  </p>
                  {detail.link && (
                    <a
                      href={detail.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors border border-accent/20"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {detail.link.label}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {isLastStep && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-4">
                  Preencha o formulario abaixo para configurar suas credenciais:
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function SeniorSetupGuide({ onConfigured }: SeniorSetupGuideProps) {
  const [activeStep, setActiveStep] = useState<number>(1)

  const toggleStep = (stepId: number) => {
    setActiveStep((prev) => (prev === stepId ? 0 : stepId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          <Settings className="h-4 w-4" />
          <span>Configuracao necessaria</span>
        </div>
        <h2 className="text-2xl font-bold">Configurar integracao Senior X</h2>
        <p className="text-muted-foreground">
          Siga os passos abaixo para obter suas credenciais de acesso a API Senior X Platform e configurar a
          integracao com o ERP.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso da configuracao</span>
          <span>4 passos</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                step.id <= activeStep ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Steps accordion */}
      <div className="space-y-3">
        {STEPS.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            isActive={activeStep === step.id}
            onToggle={() => toggleStep(step.id)}
          />
        ))}
      </div>

      {/* Inline settings form */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Passo 4: Inserir credenciais</p>
              <p className="text-xs text-muted-foreground">Preencha abaixo com seus dados do portal Senior X</p>
            </div>
          </div>
          <SettingsForm onSaved={onConfigured} />
        </CardContent>
      </Card>
    </div>
  )
}
