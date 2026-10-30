"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { copy } from "@/copy";
import { whatsGoingOnStore } from "@/lib/whats-going-on/stored";

// "This is for me": back to "What's going on?" with the words kept. The
// someone-else screen won't show again for them; any other double-check still runs
export function ThisIsForMe() {
  const router = useRouter();
  return (
    <Button
      className="w-full"
      onClick={() => {
        whatsGoingOnStore.save({ ...whatsGoingOnStore.get(), forThemselves: true });
        router.push("/join/whats-going-on");
      }}
    >
      {copy.someoneElse.forMe}
    </Button>
  );
}
