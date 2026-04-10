import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Crown, Medal } from "lucide-react"

export const RankIcon = ({ rank, points }: { rank: number; points: number }) => {
  if (points > 0) {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500" />
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-400 fill-slate-400" />
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600 fill-amber-600" />
  }
  return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{rank}</span>
}


export const AvatarUser = ({ name, isCurrentUser }: { name: string, isCurrentUser?: boolean }) => {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
    "bg-green-100 text-green-600",
    "bg-blue-100 text-blue-600",
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <Avatar>
      {isCurrentUser && <AvatarImage src={"/images/profile.svg"} />}
      <AvatarFallback className={cn("h-8 w-8 text-xs", color)}>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
