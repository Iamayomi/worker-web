"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_DIAL_CODES } from "@/lib/constants/options";

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  country?: string;
  id?: string;
  placeholder?: string;
  autoComplete?: string;
}

const DEFAULT_DIAL_CODE = "+234";

export function PhoneInput({
  value = "",
  onChange,
  onBlur,
  country,
  id,
  placeholder = "801 234 5678",
  autoComplete = "tel",
}: PhoneInputProps) {
  const [dialCode, setDialCode] = useState(
    (country && COUNTRY_DIAL_CODES[country]) || DEFAULT_DIAL_CODE
  );

  useEffect(() => {
    const code = country && COUNTRY_DIAL_CODES[country];
    if (code) setDialCode(code);
  }, [country]);

  const nationalNumber = value.startsWith(dialCode)
    ? value.slice(dialCode.length)
    : value;

  const handleDialCodeChange = (code: string) => {
    setDialCode(code);
    onChange(`${code}${nationalNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${dialCode}${e.target.value}`);
  };

  return (
    <div className="flex gap-2">
      <Select value={dialCode} onValueChange={handleDialCodeChange}>
        <SelectTrigger size="sm" className="w-28 shrink-0" aria-label="Country code">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {Object.entries(COUNTRY_DIAL_CODES).map(([name, code]) => (
            <SelectItem key={name} value={code}>
              {name} ({code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={nationalNumber}
        onChange={handleNumberChange}
        onBlur={onBlur}
      />
    </div>
  );
}
