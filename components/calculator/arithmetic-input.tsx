"use client";
import { useEffect, useRef, useState } from "react";
import { calculate } from "@/lib/arithmetic";

const displayValue = (value: number) => (value ? String(value) : "");

export function ArithmeticInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label?: string }) {
  const [text, setText] = useState(displayValue(value));
  const editing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    // External actions (copy buttons and suggestions) must update the displayed cell.
    // Do not interrupt an expression that the user is actively entering.
    if (!editing.current || !dirty.current) setText(displayValue(value));
  }, [value]);

  const finish = () => {
    editing.current = false;
    dirty.current = false;
    const n = calculate(text);
    if (n !== null) {
      onChange(n);
      setText(displayValue(n));
    } else setText(displayValue(value));
  };

  return <input aria-label={label} inputMode="decimal" className="field editable w-full min-w-16 text-center font-bold" value={text} placeholder="0" onFocus={() => { editing.current = true; }} onChange={event => { dirty.current = true; setText(event.target.value); }} onBlur={finish} onKeyDown={event => { if (event.key === "Enter") { finish(); (event.currentTarget.closest("td")?.nextElementSibling?.querySelector("input") as HTMLInputElement)?.focus(); } }} />;
}
