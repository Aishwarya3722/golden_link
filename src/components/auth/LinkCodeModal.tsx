"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateLinkCode } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface LinkCodeModalProps {
  seniorId: string;
  onClose: () => void;
}

// Lets a senior generate a one-time 6-digit code to hand to a family
// member, who enters it on their own Family dashboard to link the two
// accounts — exactly the flow shown in Fig. 4 of the report.
export function LinkCodeModal({ seniorId, onClose }: LinkCodeModalProps) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const newCode = generateLinkCode();

    supabase
      .from("family_links")
      .insert({ senior_id: seniorId, link_code: newCode })
      .then(() => setCode(newCode));
  }, [seniorId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-ink-900 p-8 text-center text-white">
        <p className="mb-4 text-lg">Give this code to family</p>
        <p className="mb-6 text-5xl font-extrabold tracking-widest text-golden-400">
          {code ?? "……"}
        </p>
        <Button variant="neutral" className="bg-white/10" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
