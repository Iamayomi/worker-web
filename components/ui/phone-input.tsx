"use client";

import { useState } from "react";

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
  const defaultCountry = () =>
    Object.entries(COUNTRY_DIAL_CODES).find(([, c]) => c === DEFAULT_DIAL_CODE)?.[0] ??
    Object.keys(COUNTRY_DIAL_CODES)[0];

  const [selectedCountry, setSelectedCountry] = useState<string>(() =>
    country && COUNTRY_DIAL_CODES[country] ? country : defaultCountry()
  );

  const [syncedCountry, setSyncedCountry] = useState(country);
  if (country !== syncedCountry) {
    setSyncedCountry(country);
    if (country && COUNTRY_DIAL_CODES[country]) setSelectedCountry(country);
  }

  const dialCode = COUNTRY_DIAL_CODES[selectedCountry] ?? DEFAULT_DIAL_CODE;

  const nationalNumber = value.startsWith(dialCode)
    ? value.slice(dialCode.length)
    : value;

  const handleDialCodeChange = (name: string) => {
    setSelectedCountry(name);
    const code = COUNTRY_DIAL_CODES[name] ?? DEFAULT_DIAL_CODE;
    onChange(`${code}${nationalNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${dialCode}${e.target.value}`);
  };

  return (
    <div className="flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-transparent px-2.5 transition-colors focus-within:border-foreground dark:bg-input/30">
      <Select value={selectedCountry} onValueChange={handleDialCodeChange}>
        <SelectTrigger
          size="sm"
          className="h-auto shrink-0 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 data-[size=sm]:h-auto"
          aria-label="Country code"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {Object.entries(COUNTRY_DIAL_CODES).map(([name, code]) => (
            <SelectItem key={name} value={name}>
              {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
        value={nationalNumber}
        onChange={handleNumberChange}
        onBlur={onBlur}
      />
    </div>
  );
}
