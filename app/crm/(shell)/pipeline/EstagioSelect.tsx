"use client";

import { useRef } from "react";
import { ESTAGIOS } from "@/lib/crm/estagios";

export function EstagioSelect({
  action,
  estagioAtual,
}: {
  action: (formData: FormData) => void;
  estagioAtual: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <select
        name="estagio"
        defaultValue={estagioAtual}
        onChange={() => formRef.current?.requestSubmit()}
        className="w-full rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs text-black/70 outline-none transition focus:border-black/40"
      >
        {ESTAGIOS.map((e) => (
          <option key={e.valor} value={e.valor}>
            {e.label}
          </option>
        ))}
      </select>
    </form>
  );
}
