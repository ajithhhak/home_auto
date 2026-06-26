"use client";

import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../lib/firebase";
import RelayButton from "../components/RelayButton";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { Mic, MicOff, Activity, Wifi } from "lucide-react";

export default function Home() {
  const [relays, setRelays] = useState({
    relay1: 0,
    relay2: 0,
    relay3: 0,
    relay4: 0,
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Check if Firebase is configured properly
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setFeedback("Firebase API Key is missing in .env.local");
      return;
    }

    const relaysRef = ref(db, "/");
    const unsubscribe = onValue(
      relaysRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRelays({
            relay1: data.relay1 || 0,
            relay2: data.relay2 || 0,
            relay3: data.relay3 || 0,
            relay4: data.relay4 || 0,
          });
          setIsConnected(true);
        }
      },
      (error) => {
        console.error("Firebase fetch error:", error);
        setIsConnected(false);
        setFeedback("Failed to connect to Firebase.");
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleRelay = (relayKey: string, currentState: number) => {
    const newState = currentState === 1 ? 0 : 1;
    set(ref(db, `/${relayKey}`), newState)
      .then(() => setFeedback(`Turned ${relayKey} ${newState === 1 ? 'ON' : 'OFF'}`))
      .catch((error) => {
        console.error("Firebase set error:", error);
        setFeedback(`Failed to update ${relayKey}`);
      });
  };

  const handleVoiceCommand = (command: string) => {
    setFeedback(`Voice command: "${command}"`);
    
    // Command mappings
    if (command.includes("turn on relay one")) {
      set(ref(db, "/relay1"), 1);
    } else if (command.includes("turn off relay one")) {
      set(ref(db, "/relay1"), 0);
    } else if (command.includes("turn on relay two")) {
      set(ref(db, "/relay2"), 1);
    } else if (command.includes("turn off relay two")) {
      set(ref(db, "/relay2"), 0);
    } else if (command.includes("turn on relay three")) {
      set(ref(db, "/relay3"), 1);
    } else if (command.includes("turn off relay three")) {
      set(ref(db, "/relay3"), 0);
    } else if (command.includes("turn on relay four")) {
      set(ref(db, "/relay4"), 1);
    } else if (command.includes("turn off relay four")) {
      set(ref(db, "/relay4"), 0);
    } else if (command.includes("turn on all")) {
      set(ref(db, "/relay1"), 1);
      set(ref(db, "/relay2"), 1);
      set(ref(db, "/relay3"), 1);
      set(ref(db, "/relay4"), 1);
    } else if (command.includes("turn off all")) {
      set(ref(db, "/relay1"), 0);
      set(ref(db, "/relay2"), 0);
      set(ref(db, "/relay3"), 0);
      set(ref(db, "/relay4"), 0);
    }
  };

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition(handleVoiceCommand);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Smart Home
            </h1>
            <p className="text-neutral-400 mt-2">Control your appliances remotely</p>
          </div>

          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">{isConnected ? "Firebase Online" : "Disconnected"}</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neutral-300">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">ESP NodeMCU</span>
            </div>
          </div>
        </header>

        {/* Voice Command Section */}
        {isSupported && (
          <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-xl font-semibold">Voice Control</h2>
                <p className="text-neutral-400 text-sm max-w-sm">Try saying "Turn on relay one" or "Turn off all" to control your devices hands-free.</p>
              </div>

              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all duration-300 transform active:scale-95 ${
                  isListening 
                    ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                    : "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 animate-pulse" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Listening
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Relays Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <RelayButton
            label="Relay 1"
            isOn={relays.relay1 === 1}
            onToggle={() => toggleRelay("relay1", relays.relay1)}
          />
          <RelayButton
            label="Relay 2"
            isOn={relays.relay2 === 1}
            onToggle={() => toggleRelay("relay2", relays.relay2)}
          />
          <RelayButton
            label="Relay 3"
            isOn={relays.relay3 === 1}
            onToggle={() => toggleRelay("relay3", relays.relay3)}
          />
          <RelayButton
            label="Relay 4"
            isOn={relays.relay4 === 1}
            onToggle={() => toggleRelay("relay4", relays.relay4)}
          />
        </section>

        {/* Feedback / Logs */}
        {feedback && (
          <div className="flex items-center justify-center p-4">
            <span className="px-6 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm animate-in fade-in slide-in-from-bottom-2">
              {feedback}
            </span>
          </div>
        )}

      </div>
    </main>
  );
}
