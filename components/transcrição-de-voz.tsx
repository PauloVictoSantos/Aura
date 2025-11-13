"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Copy, Trash2, Check, Send } from "lucide-react"
import { toast } from "sonner"

export default function VoiceTranscription() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showTimeUpAnimation, setShowTimeUpAnimation] = useState(false)

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "pt-BR"

      recognition.onresult = (event: any) => {
        let interim = ""
        let final = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcriptPiece + " "
          } else {
            interim += transcriptPiece
          }
        }

        if (final) {
          setTranscript((prev) => prev + final)
        }
        setInterimTranscript(interim)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === "not-allowed") {
          toast("Permissão negada",{
            description: "Por favor, permita o acesso ao microfone.",
          })
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        if (isListening) {
          recognition.start()
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening, toast])

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isTimerActive) {
      // Timer acabou
      handleTimeUp()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeLeft, isTimerActive])

  const handleTimeUp = () => {
    setIsTimerActive(false)
    setShowTimeUpAnimation(true)

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimTranscript("")
    }

    toast( "Tempo esgotado!",{
      description: "Os 5 segundos terminaram. Clique em 'Enviar' para processar.",
    })

    // Remove a animação após 2 segundos
    setTimeout(() => {
      setShowTimeUpAnimation(false)
    }, 2000)
  }

  const toggleListening = () => {
    if (!isSupported) {
      toast( "Não suportado",{
        description: "Seu navegador não suporta reconhecimento de voz.",
      })
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setInterimTranscript("")
      setIsTimerActive(false)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      setTimeLeft(5)
      setIsTimerActive(true)
      setShowTimeUpAnimation(false)
      toast("Gravação iniciada",{
        description: "Você tem 5 segundos para falar...",
      })
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    setInterimTranscript("")
    setTimeLeft(5)
    setIsTimerActive(false)
    setShowTimeUpAnimation(false)
    toast("Transcrição limpa",{
      description: "O texto foi removido.",
    })
  }

  const handleSubmit = () => {
    if (!transcript && !interimTranscript) {
      toast( "Nenhum texto",{
        description: "Não há transcrição para enviar.",      })
      return
    }

    // Aqui você pode adicionar a lógica para enviar o texto
    toast("Enviado com sucesso!",{
      description: "Sua transcrição foi processada.",
    })

    console.log("[v0] Transcrição enviada:", transcript + interimTranscript)
  }

  const copyToClipboard = async () => {
    if (!transcript) return

    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      toast("Copiado!",{
        description: "Texto copiado para a área de transferência.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast("Erro ao copiar",{
        description: "Não foi possível copiar o texto.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">Transcrição de Voz</h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Fale naturalmente e veja suas palavras aparecerem em tempo real
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-6 md:p-8 lg:p-10 space-y-6 shadow-lg border-2 transition-all duration-300">
          {/* Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              disabled={!isSupported}
              className={`
                relative group
                w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
                rounded-full
                transition-all duration-300 ease-out
                ${isListening ? "bg-accent shadow-2xl scale-110" : "bg-muted hover:bg-accent/20 hover:scale-105"}
                ${showTimeUpAnimation ? "animate-bounce bg-destructive" : ""}
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-4 focus:ring-accent/30
              `}
              aria-label={isListening ? "Parar gravação" : "Iniciar gravação"}
            >
              {/* Pulse animation when listening */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-30" />
                  <span className="absolute inset-0 rounded-full bg-accent animate-pulse opacity-20" />
                </>
              )}

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center h-full">
                {isListening ? (
                  <Mic className="w-10 h-10 md:w-12 md:h-12 text-accent-foreground animate-pulse" />
                ) : (
                  <MicOff className="w-10 h-10 md:w-12 md:h-12 text-foreground/70 group-hover:text-accent transition-colors" />
                )}
              </div>
            </button>
          </div>

          {isTimerActive && (
            <div className="space-y-3">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${timeLeft <= 2 ? "text-destructive animate-pulse" : "text-accent"}`}
                >
                  {timeLeft}s
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft <= 2 ? "bg-destructive" : "bg-accent"
                  }`}
                  style={{ width: `${(timeLeft / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {showTimeUpAnimation && !isTimerActive && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-destructive/20 text-destructive font-bold text-lg animate-pulse">
                ⏰ Tempo Esgotado!
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="text-center">
            <div
              className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-300
              ${isListening ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}
            `}
            >
              <span
                className={`w-2 h-2 rounded-full ${isListening ? "bg-accent animate-pulse" : "bg-muted-foreground"}`}
              />
              {isListening ? "Ouvindo..." : "Pronto para ouvir"}
            </div>
          </div>

          {/* Transcript Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transcrição</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!transcript}
                  className="transition-all duration-200 bg-transparent"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTranscript}
                  disabled={!transcript && !interimTranscript}
                  className="transition-all duration-200 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>

            <div
              className={`
              min-h-[300px] md:min-h-[400px] p-6 rounded-lg
              bg-muted/30 border-2
              transition-all duration-300
              ${isListening ? "border-accent/50 shadow-inner" : "border-border"}
            `}
            >
              <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap text-foreground">
                {transcript}
                {interimTranscript && <span className="text-muted-foreground italic">{interimTranscript}</span>}
                {!transcript && !interimTranscript && (
                  <span className="text-muted-foreground">Clique no microfone e comece a falar...</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!transcript && !interimTranscript}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5 mr-2" />
              Enviar Transcrição
            </Button>
          </div>

          {/* Info */}
          {!isSupported && (
            <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg">
              <p className="text-sm">
                Seu navegador não suporta reconhecimento de voz. Tente usar Chrome, Edge ou Safari.
              </p>
            </div>
          )}
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Dica: Você tem 5 segundos para falar. O timer será exibido durante a gravação.</p>
        </div>
      </div>

    </div>
  )
}
