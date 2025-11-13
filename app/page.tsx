"use client"
import React, { useEffect, useRef, useState } from "react";

export default function WebSpeechTranscriber() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recogRef = useRef<any>(null);

  const textosPreGravados = [
    { id: "01", texto: "Olá tudo bem" },
    { id: "02", texto: "Boa tarde pessoal" },
    { id: "03", texto: "ei viado" },
    { id: "04", texto: "tua mãe é minha" },
    { id: "05", texto: "Qual é seu nome" },
    { id: "06", texto: "Obrigado pela atenção" },
    { id: "07", texto: "Bom dia" },
    { id: "08", texto: "Tenha uma boa noite" },
    { id: "09", texto: "Isso está funcionando" },
    { id: "10", texto: "Quem usa gemini é viadinho" },
  ];

  useEffect(() => {
    const win: any = window;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return; 
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recogRef.current = recognition;

    recognition.onresult = (ev: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = ev.resultIndex; i < ev.results.length; ++i) {
        const r = ev.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }

      if (finalText) {
        finalText = finalText.trim();
        setTranscript((t) => (t ? t + " " + finalText : finalText));

        const normalizar = (txt: string) =>
          txt
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace(/[.,!?]/g, "") // remove pontuação
            .trim();

        const textoFinalNormalizado = normalizar(finalText);

        textosPreGravados.forEach((item) => {
          if (textoFinalNormalizado.includes(normalizar(item.texto))) {
            console.log("✅ Texto reconhecido! ID:", item.id, " | Texto:", item.texto);
          }
        });

      }

      setInterim(interimText);
    };

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e: any) => setError(e.error || String(e));

    return () => recognition.stop && recognition.stop();
  }, []);

  const startListening = () => {
    try {
      recogRef.current.start();
      setListening(true);
    } catch { }
  };

  const stopListening = () => {
    try {
      recogRef.current.stop();
    } catch { }
    setListening(false);
  };

  const clearAll = () => {
    setTranscript("");
    setInterim("");
    setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border rounded-2xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Transcrição em tempo real (PT-BR)</h1>

        {!supported && (
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-3">
            Use Chrome/Edge para suporte à Web Speech API.
          </div>
        )}

        <button
          onClick={() => (listening ? stopListening() : startListening())}
          className={`px-4 py-2 rounded-2xl font-medium mb-4 w-full ${listening ? "bg-red-500 text-white" : "bg-green-600 text-white"
            }`}
        >
          {listening ? "Parar" : "Iniciar"}
        </button>

        <textarea
          readOnly
          value={transcript}
          rows={8}
          className="w-full border rounded p-3 bg-gray-50 mb-2"
          placeholder="Transcrição final aparecerá aqui..."
        />

        <div className="w-full border rounded p-3 min-h-12 bg-white text-slate-700 mb-3">
          {interim || <span className="text-slate-400">Falando...</span>}
        </div>

        {error && <div className="text-red-600 text-sm mb-2">Erro: {error}</div>}

        <button onClick={clearAll} className="px-3 py-2 border rounded text-sm w-full">
          Limpar
        </button>
      </div>
    </main>
  );
}
