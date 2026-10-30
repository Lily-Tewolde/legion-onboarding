"use client";

import { useRef } from "react";
import { Button } from "@/components/Button";
import { Sheet, type SheetHandle } from "@/components/Sheet";
import { copy } from "@/copy";

// "What if I cancel?" opens Legion's full policy in a sheet on phones and a
// dialog on desktop
export function WhatIfCancel() {
  const sheet = useRef<SheetHandle>(null);
  return (
    <>
      <Button variant="text" className="-ml-2" onClick={() => sheet.current?.open()}>
        {copy.checkout.whatIfCancel}
      </Button>
      <Sheet ref={sheet} title={copy.checkout.whatIfCancel} titleId="cancel-policy-title">
        <p className="text-body-lg">{copy.checkout.cancelPolicy}</p>
        <Button className="w-full" onClick={() => sheet.current?.close()}>
          {copy.common.close}
        </Button>
      </Sheet>
    </>
  );
}
