import type { StylesConfig, GroupBase } from "react-select";

export interface SelectOption {
  value: string | number;
  label: string;
}

export const creatableSelectStyles: StylesConfig<
  SelectOption,
  false,
  GroupBase<SelectOption>
> = {
  control: (base, state) => ({
    ...base,
    borderColor: "hsl(var(--input))",
    backgroundColor: state.isDisabled
      ? "hsl(var(--input) / 0.3)"
      : "transparent",
    minHeight: "2.25rem", // h-9 = 36px
    borderRadius: "0.375rem", // rounded-md
    boxShadow: state.isFocused
      ? "0 0 0 1px #35367E, 0 1px 2px 0 rgb(0 0 0 / 0.05)"
      : "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-xs
    fontSize: "1rem", // text-base
    transition: "color 150ms, box-shadow 150ms",
    outline: "none",
    cursor: state.isDisabled ? "not-allowed" : "default",
    opacity: state.isDisabled ? 0.5 : 1,
    "&:hover": {
      borderColor: "hsl(var(--input))",
      backgroundColor: state.isDisabled
        ? "hsl(var(--input) / 0.3)"
        : "hsl(var(--input) / 0.5)",
    },
  }),
//   menu: (base) => ({
//     ...base,
//     backgroundColor: "hsl(var(--popover))",
//     color: "hsl(var(--popover-foreground))",
//     border: "1px solid hsl(var(--border))",
//     borderRadius: "0.375rem", // rounded-md
//     boxShadow:
//       "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", // shadow-md
//       zIndex: 9999,
//     opacity: 1,
//     overflow: "hidden",
//     }),
  menuList: (base) => ({
    ...base,
    padding: "0.25rem", // p-1
    maxHeight: "var(--radix-select-content-available-height)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor:
      state.isSelected || state.isFocused
        ? "hsl(var(--accent))"
        : "transparent",
    color:
      state.isSelected || state.isFocused
        ? "hsl(var(--accent-foreground))"
        : "hsl(var(--popover-foreground))",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    borderRadius: "0.125rem", // rounded-sm
    padding: "0.375rem 2rem 0.375rem 0.5rem", // py-1.5 pr-8 pl-2
    fontSize: "0.875rem", // text-sm
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    position: "relative",
    opacity: state.isDisabled ? 0.5 : 1,
    pointerEvents: state.isDisabled ? "none" : "auto",
    "&:active": {
      backgroundColor: "hsl(var(--accent))",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "hsl(var(--grey-light-active))",
  }),
  singleValue: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  input: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    padding: "0.5rem",
    opacity: 0.5,
    transition: "opacity 150ms",
    "&:hover": {
      opacity: 0.8,
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    padding: "0.5rem",
    cursor: "pointer",
    "&:hover": {
      color: "hsl(var(--foreground))",
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    padding: "0.375rem 0.5rem",
    fontSize: "0.875rem",
  }),
};
