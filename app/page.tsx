"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import useSpeakToText from "@/hook";

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { transcript, isListening, startListening, stopListening } =
    useSpeakToText({ continuous: true });

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  const handleStop = () => {
    setTextInput(
      (prev) =>
        prev + (transcript.length ? (prev.length ? " " : "") + transcript : "")
    );
    stopListening();
  };

  // --- Enviar texto pro backend ---
  const sendToBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/texto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto: textInput }),
      });

      const data = await response.json();
      console.log("Resposta do backend:", data);
      alert("Texto enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar texto pro backend.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Transcrição de Voz
        </h1>

        <Textarea
          placeholder="Fale algo ou digite aqui..."
          value={
            isListening
              ? textInput +
                (transcript.length
                  ? (textInput.length ? " " : "") + transcript
                  : "")
              : textInput
          }
          onChange={(e) => setTextInput(e.target.value)}
          disabled={isListening}
          className="min-h-[150px] resize-none"
        />

        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className="flex items-center gap-2 px-6"
          >
            <Mic className="h-4 w-4" />
            {isListening ? "Parar" : "Falar"}
          </Button>

          {isListening && (
            <Button
              onClick={handleStop}
              variant="outline"
              className="flex items-center gap-2 px-6"
            >
              Salvar Texto
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
