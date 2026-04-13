"use client"
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSound from "use-sound"
import { TOTAL_EXERCISES, XP_EARN_PER_CORRECT } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Bot, Mic, MicOff, PhoneOff, User, Volume2, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/custom/button';
import { Card } from '@/components/ui/custom/card';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Vapi from '@vapi-ai/web';
import LevelComplete from './level-complete';

type CallStatus = "idle" | "connecting" | "active" | "ended"
type Message = {
  role: "assistant" | "user";
  text: string;
}

const VoiceSession = ({
  userId,
  language,
  lang,
  sessionId,
  level
}: {
  userId: string;
  language: string;
  lang: string;
  sessionId: string;
  level: {
    id?: string
    title?: string
    level_number?: number
    purpose?: string
  }
}) => {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null)
  const vapiRef = useRef<Vapi | null>(null);

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volume, setVolume] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [completed, setCompleted] = useState(false)

  const [playCorrect] = useSound('/correct-sound.wav');
  const playCorrectRef = useRef(playCorrect);

  useEffect(() => {
    playCorrectRef.current = playCorrect;
  }, [playCorrect]);


  useEffect(() => {
    const handlePopState = () => {
      setIsExitDialogOpen(true)
      window.history.pushState(null, "", window.location.pathname)
    }
    window.history.pushState(null, "", window.location.pathname)
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])


  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
    setVapi(vapiInstance)
    const handleCallStart = () => {
      setStatus("active")
    }

    const handleCallStartEnd = () => {
      setStatus("ended");
      setIsSpeaking(false)
    }

    const handlSpeechStart = () => {
      setIsSpeaking(true)
    }

    const handlSpeechEnd = () => {
      setIsSpeaking(false)
    }

    const handleVolume = (v: number) => {
      setVolume(v)
    }

    const handleMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === "final") {
        setMessages(prev => [...prev, {
          role: message.role,
          text: message.transcript
        }]);
      }

      if (message.type === "tool-calls") {
        console.log("Tool calls", message)
        message.toolCallList?.forEach((toolCall: any) => {
          // const callId = toolCall.id
          const name = toolCall.function?.name;
          const args = typeof toolCall.function?.arguments === "string"
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function?.arguments ?? {}

          if (name === "markCorrect") {
            setFlash("correct");
            setScore(prev => prev + 1);
            playCorrectRef.current();
            setTimeout(() => setFlash(null), 1500);
          }

          if (name === "completeLevel") {
            setScore(prev => args.finalScore ?? prev);
            setCompleted(true);
            vapiInstance.stop();
          }

        })
      }

      if (message.type === "tool--calls-result") {
        console.log("Tool calls result:", message)
      }

    }

    const handleError = (error: any) => {
      console.error('Vapi error:', error);
      const errorString = JSON.stringify(error || "")
      if (errorString.includes('ejected') || errorString.includes('ended')) {
        setStatus("idle")
        setIsSpeaking(false)
      }

    }

    // Event listeners
    vapiInstance.on('call-start', handleCallStart);
    vapiInstance.on('call-end', handleCallStartEnd);
    vapiInstance.on('speech-start', handlSpeechStart);
    vapiInstance.on('speech-end', handlSpeechEnd);
    vapiInstance.on("volume-level", handleVolume);
    vapiInstance.on("message", handleMessage)
    vapiInstance.on("error", handleError)
    return () => {
      vapi?.stop()
    };
  }, []);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // useEffect(() => {
  //   const toastId = toast.info("Starting session...")
  //   const timeout = setTimeout(() => {
  //     startSession();
  //     toast.success("Session started", {
  //       id: toastId
  //     })
  //   }, 1000);
  //   return () => clearTimeout(timeout);
  // }, [])


  const LANGUAGE_VOICES: Record<string, string> = {
    spanish: "es-ES-ElviraNeural",
    hindi: "hi-IN-SwaraNeural",
    chinese: "zh-CN-XiaoxiaoNeural",
    german: "de-DE-KatjaNeural",
    french: "fr-FR-DeniseNeural",
    portuguese: "pt-PT-RaquelNeural",
    italian: "it-IT-ElsaNeural",
    japanese: "ja-JP-NanamiNeural",
    korean: "ko-KR-SunHiNeural",
    arabic: "ar-XA-ZariyahNeural",
    english: "en-US-AriaNeural",
    russian: "ru-RU-SvetlanaNeural",
    dutch: "nl-NL-FennaNeural",
    greek: "el-GR-AthinaNeural",
    swedish: "sv-SE-SofieNeural",
    polish: "pl-PL-ZofiaNeural",
    turkish: "tr-TR-EmelNeural",
    vietnamese: "vi-VN-HoaiMyNeural",
    irish: "ga-IE-OrlaNeural",
    //latin: "it-IT-ElsaNeural",
  }


  const languageKey = language?.toLowerCase() ?? "english"
  const voiceId = LANGUAGE_VOICES[languageKey] ?? "en-US-AriaNeural"

  const startSession = async () => {
    if (!vapi) return;
    try {
      setStatus("connecting");
      setMessages([]);
      await vapi.start(
        process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        {
          voice: {
            provider: "azure",
            voiceId: voiceId,
          },
          transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "multi"
          },
          variableValues: {
            language,
            level_number: level.level_number,
            title: level.title,
            purpose: level.purpose,
            total_exercises: TOTAL_EXERCISES
          },
          metadata: {
            userId: String(userId),
            sessionId: String(sessionId),
            levelId: String(level.id)
          },
        }
      )
    } catch (error) {
      console.error("Failed to start session:", error)
      setStatus("idle")
      toast.error("Failed to start voice session")
    }
  }

  const endSession = () => {
    if (vapi && status === "active") {
      vapi.stop();
      setStatus("ended")
    }
  }

  const handleConfirmExit = () => {
    endSession();
    router.push("/learn")
  }

  const toggleMute = () => {
    if (!vapi) return;
    const nextMuted = !isMuted;
    vapi.setMuted(nextMuted);
    setIsMuted(nextMuted);
    toast.info(nextMuted ? "Microphone muted" : "Microphone unmuted")
  }

  const speakingLabel = isSpeaking ? "AI is speaking..."
    : status === "active" ? "Listening..."
      : status === "connecting" ? "Connecting..."
        : status === "ended" ? "Session ended"
          : "Ready to start"

  if (completed) {
    return (
      <LevelComplete
        levelNumber={level.level_number}
        language={language}
        score={score}
        totalExercises={TOTAL_EXERCISES}
        onContinue={() => router.push("/learn")}
      />
    )
  }

  return (
    <>
      <div className={cn("w-full h-screen transition-colors duration-300 ease-in-out",
        flash === "correct"
          ? "bg-green-100 dark:bg-green-950/90"
          : "bg-background"
      )}>

        <div className="w-full h-full max-w-7xl mx-auto flex flex-col py-5 gap-4">

          <header className="w-full flex items-center justify-between py-4 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsExitDialogOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
              <div>
                <p className="text-sm font-bold uppercase
              text-muted-foreground
              ">
                  Level {level.level_number} · {language}
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight">{level.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold">
              <span>Correct: {score}/{TOTAL_EXERCISES}</span>
              <Zap className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground font-normal">
                (+{score * XP_EARN_PER_CORRECT} XP)
              </span>
            </div>
          </header>


          <div className="w-full flex flex-1 gap-4 overflow-hidden">

            <div className="flex flex-col items-center mb-30 justify-center gap-8 w-1/2 px-8">

              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full transition-colors",
                  status === "active" && isSpeaking && "bg-primary animate-pulse",
                  status === "active" && !isSpeaking && "bg-green-500",
                  status === "connecting" && "bg-yellow-500 animate-pulse",
                  (status === "idle" || status === "ended") && "bg-muted-foreground",
                )} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {speakingLabel}
                </span>
              </div>

              <Orb
                status={status} isSpeaking={isSpeaking}
                volume={volume}
              />

              <p className="text-sm text-muted-foreground text-center max-w-[220px]">
                {level.purpose}
              </p>

              <div className="flex items-center gap-3">
                {status === "ended" || status === "idle" ? (
                  <>
                    <Button size="lg" onClick={startSession}
                      className="px-8 gap-2"
                    >
                      <Mic className="size-4" />
                      Begin Session
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="icon" onClick={toggleMute}>
                      {isMuted ? <MicOff className="size-4 text-destructive" /> : <MicOff className="size-4" />}
                    </Button>
                    <Button variant="destructive" size="lg" onClick={() => setIsExitDialogOpen(true)}
                      className="px-8 gap-2 "
                    >
                      <PhoneOff className="size-4" />
                      End Session
                    </Button>

                  </>
                )}
              </div>

            </div>


            <Card className="flex flex-col w-1/2 bg-transparent px-0">

              <div className="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Conversation
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4
            space-y-4
            ">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <Bot className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Start the session to begin learning
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => <MessageBubble
                    key={index} message={msg}
                  />)
                )}
                <div ref={bottomRef} />
              </div>

            </Card>
          </div>
        </div>


      </div>
      <AlertDialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <AlertDialogContent size="sm" className="max-w-md! p-6 py-8 pb-0 shadow-2xl border-2">
          <AlertDialogHeader className="items-center text-center">
            <div className="size-24 rounded-full bg-muted flex items-center justify-center mb-2">
              <Image
                src="/images/logo-2.png"
                width={100}
                height={100}
                className="object-contain drop-shadow-2xl relative z-10"
                alt="Loading..."
                priority
              />
            </div>
            <AlertDialogTitle className="text-2xl font-bold mt-2">
              Wait, don’t go! You’ll lose your progress if you quit now
            </AlertDialogTitle>
            <AlertDialogDescription />

          </AlertDialogHeader>
          <div className="w-full flex flex-col gap-2 pb-5 mt-1">
            <Button
              onClick={() => setIsExitDialogOpen(false)}
              size="lg"
              className="w-full flex-1"
            >
              KEEP LEARNING
            </Button>
            <Button
              variant="ghost"
              onClick={handleConfirmExit}
              size="lg"
              className="w-full flex-1! text-destructive!"
            >
              END SESSION
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}



const Orb = ({
  status,
  volume,
  isSpeaking,
}: {
  status: CallStatus
  volume: number
  isSpeaking: boolean
}) => {
  const pulseSize = 80 + volume * 80

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {/* Volume rings when AI speaking */}
      {isSpeaking && (
        <>
          <div className="absolute rounded-full bg-primary/10 transition-all duration-100"
            style={{ width: pulseSize + 60, height: pulseSize + 60 }} />
          <div className="absolute rounded-full bg-primary/15 transition-all duration-150"
            style={{ width: pulseSize + 30, height: pulseSize + 30 }} />
        </>
      )}
      {/* Connecting pulse */}
      {status === "connecting" && (
        <div className="absolute h-44 w-44 rounded-full bg-primary/10 animate-ping" />
      )}
      <div className={cn(
        "relative z-10 flex items-center justify-center w-32 h-32 rounded-full border-4 transition-all duration-200 overflow-hidden",
        status === "idle" && "border-border bg-muted",
        status === "connecting" && "border-primary/50 bg-primary/10 animate-pulse",
        status === "active" && isSpeaking && "border-primary bg-primary/10 scale-105",
        status === "active" && !isSpeaking && "border-primary/50 bg-primary/5",
        status === "ended" && "border-muted bg-muted/50",
      )}>
        {/* Sound wave bars when speaking */}
        <Image
          src={status === "active"
            ? "/images/logo-teacher.png"
            : "/images/logo-sleep.png"}
          alt="Linga.ai"
          // fill
          width={128}
          height={128}
          className={cn(
            "transition-all duration-300 object-bottom",
            status === "active" ? "grayscale-0" : "grayscale"
          )}
        />
      </div>
    </div>
  )
}


const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3 items-start ", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
        isUser ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={cn(
        `max-w-[80%] rounded-2xl px-4 py-2.5 text-base leading-relaxed border-2 border-b-4`,
        isUser ? "rounded-tr-sm bg-primary border-primary/50 text-primary-foreground"
          : "rounded-tl-sm bg-muted text-foreground",
      )}>
        {message.text}
      </div>
    </div>
  )
}
export default VoiceSession
