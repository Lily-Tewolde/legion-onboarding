"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";

// "What if I cancel?" opens Legion's full policy under the cancellation line
export function WhatIfCancel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="text" aria-expanded={open} aria-controls="cancel-policy" onClick={() => setOpen(!open)}>
        {copy.checkout.whatIfCancel}
      </Button>
      {open && (
        <div id="cancel-policy" className="flex flex-col gap-1">
          <p>{copy.checkout.cancelPolicy}</p>
          <div>
            <Tag>{copy.common.fromLegion}</Tag>
          </div>
        </div>
      )}
    </div>
  );
}
