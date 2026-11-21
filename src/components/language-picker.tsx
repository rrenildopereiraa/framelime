import { IconCode } from "@tabler/icons-react";
import Select from "@/components/ui/select.tsx";
import { LANGUAGES, type LanguageId } from "../lib/highlighter";

const options = Object.entries(LANGUAGES).map(([id, label]) => ({ value: id, label }));

export function LanguagePicker({
  value,
  onValueChange,
}: {
  value: LanguageId;
  onValueChange: (value: LanguageId) => void;
}) {
  return (
    <Select
      ariaLabel="Language"
      size="sm"
      shape="pill"
      icon={<IconCode className="w:4 h:4" />}
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as LanguageId);
      }}
      options={options}
      className="w:40"
    />
  );
}
