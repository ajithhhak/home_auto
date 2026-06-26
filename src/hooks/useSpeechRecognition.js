"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function useSpeechRecognition(onCommand) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript.trim().toLowerCase();
          setTranscript(transcriptText);
          
          if (onCommand) {
            onCommand(transcriptText);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        console.warn("Speech Recognition API is not supported in this browser.");
      }
    }
  }, [onCommand]);

  const startListening = useCallback(() => {
    setTranscript("");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Already started", err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { isListening, transcript, startListening, stopListening, isSupported: !!recognitionRef.current };
}
