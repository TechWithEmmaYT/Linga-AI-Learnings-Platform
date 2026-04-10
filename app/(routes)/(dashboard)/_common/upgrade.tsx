"use client";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/custom/card";
import { Button } from "@/components/ui/custom/button";

export const Upgrade = () => {
  return (
    <Card className="space-y-2">
      <div className="flex gap-y-2">
        <div className="space-y-2">
          <Image src="/images/super-logo.svg" alt="Pro" height={20} width={78} />
          <h3 className="text-lg font-bold">Upgrade to Super</h3>
          <p className="text-muted-foreground">
            Get personalized practice, and unlimited voice AI!
          </p>
        </div>
        <div className="relative w-[200px] h-[110px]">
          <Image src="/images/super-img-2.svg" alt="Pro" fill />
        </div>
      </div>

      <Button variant="default" className="w-full" size="lg" asChild>
        <Link href="/upgrade">Upgrade to Super</Link>
      </Button>
    </Card>
  );
};
