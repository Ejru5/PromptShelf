"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast("Saved to My shelf")}>Default toast</Button>
      <Button
        variant="secondary"
        onClick={() => toast("copied! go make something ↗", { variant: "note" })}
      >
        Note toast
      </Button>
    </div>
  );
}
