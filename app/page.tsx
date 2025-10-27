"use client"
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import useSpeakToText from "./hook/useSpeekToText";

export default function Home() {
  const [textInput, setTextInput] = useState('')

  const {transcript, isListening, startListening, stopListening } = useSpeakToText({continuous:true})

  const startStopListening = () => {
    isListening ? stopListening() : startListening()
  }

  const stopVoiceInput = () => {
    setTextInput(prevVal => prevVal + (transcript.length ? (prevVal.length ? ' ': '') + transcript : ''))
    stopListening()
  }

  return (
    <div className="">
      <Button variant="outline"
      onClick={() => {startStopListening()}}
      >
        <Mic />  {isListening ? 'Stop Listening' : 'Fale'}
      </Button>
      <Textarea placeholder="Seu texto"
        value={isListening ? textInput + (transcript.length ? (textInput.length ? ' ' : '') + transcript : '') : textInput}  
        onChange={(e) => { setTextInput(e.target.value) }}
        disabled={isListening}
      />
    </div>
  );
}
