"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"
import { Button } from "@/components/ui/custom/button"
import Link from "next/link"
import { X } from "lucide-react"

export const SuperModal = (
  { isOpen, onOpenChange }: {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void
  }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[360px] p-0  border-none!
             data-[state=open]:animate-in data-[state=closed]:animate-out
                    data-[state=open]:zoom-in-75 data-[state=closed]:zoom-out-0
                    duration-200 ease-out   ">
        <AlertDialogTitle />
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 pt-12 relative overflow-visible">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-20"
          >
            <X className="size-5 text-neutral-400" />
          </button>

          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[240px] h-[140px] z-10">
            <Image src="/images/super-img-2.svg" alt="Pro" fill className="object-contain" />
          </div>

          <div className="space-y-6 text-center mt-4">
            <div className="flex justify-center">
              <Image src="/images/super-logo.svg" alt="Pro" height={36} width={130} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Upgrade to Super</h3>
              <p className="text-muted-foreground font-bold text-lg leading-tight px-2">
                Unlock all levels, personalized practice, and unlimited points!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button variant="default" size="lg" className="w-full" asChild>
                <Link href="/upgrade">Upgrade to Super</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full"
                onClick={() => onOpenChange(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
