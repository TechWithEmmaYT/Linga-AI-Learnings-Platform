"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { upsertUserProgress } from "@/app/action/course";
import { Card } from "@/components/ui/custom/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface CardItemProps {
  id: string;
  title: string;
  imageSrc: string;
  learners?: number;
  disabled?: boolean;
  isActive?: boolean;
}

export function CardItem({
  id,
  title,
  imageSrc,
  learners,
  disabled,
  isActive,
}: CardItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => upsertUserProgress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentCourse"] });
      router.push("/learn");
    },
    onError: () => toast.error("Something went wrong."),
  });

  const onClick = () => {
    if (disabled || isPending) return;
    mutate();
  };

  return (
    <Card
      onClick={onClick}
      {...(isActive ? { variant: "primary" } : { variant: "elevated" })}
      className="relative cursor-pointer transition-all w-full flex flex-col items-center justify-center p-4 hover:opacity-80"
    >
      <div className="min-h-6 w-full flex items-center justify-end">
        {isActive && (
          <div className="rounded-md bg-primary p-1 flex items-center justify-center text-white">
            <Check className="h-4 w-4 stroke-4" />
          </div>
        )}
      </div>

      <Image
        src={imageSrc}
        alt={title}
        height={70}
        width={93}
        className="rounded-lg drop-shadow-md border object-cover"
      />

      <p className="text-muted-foreground font-bold mt-3 text-center">
        {title}
      </p>

      {isPending && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
          <Spinner className="h-6 w-6" />
        </div>
      )}
    </Card>
  );
}
