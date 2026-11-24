import type { CSSProperties, ReactNode } from "react";
import Select from "@/components/ui/select.tsx";
import { Tooltip } from "./tooltip";

export interface PickerOption<T extends string> {
  id: T;
  label: string;
  /** Previews the option, such as a font family, in an "Aa" beside its label. */
  style?: CSSProperties;
  /** Drawn before the label, such as a theme's preview. */
  icon?: ReactNode;
}

/** A labelled Yumma UI select, as the inspector lays its fields out. */
export function PickerField<T extends string>({
  label,
  value,
  options,
  onValueChange,
  badge,
}: {
  label?: string;
  value: T;
  options: PickerOption<T>[];
  onValueChange: (value: T) => void;
  badge?: { text: string; title: string };
}) {
  return (
    <div className="d:f fd:c g:2 pb:4">
      {label && (
        <span className="fs:sm us:none c:hint">
          {label}
          {badge && (
            <Tooltip content={badge.title}>
              <span className="c:accent"> {badge.text}</span>
            </Tooltip>
          )}
        </span>
      )}
      <Select
        ariaLabel={label}
        size="sm"
        value={value}
        onValueChange={(next) => {
          if (next) onValueChange(next as T);
        }}
        options={options.map((option) => ({
          value: option.id,
          label: option.label,
          icon:
            option.icon ??
            (option.style ? (
              <span className="fs:xs c:hint" style={option.style}>
                Aa
              </span>
            ) : undefined),
        }))}
        className="w:100%"
      />
    </div>
  );
}
