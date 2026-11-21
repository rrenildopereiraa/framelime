import ColorPicker from "@/components/ui/color-picker.tsx";

/** One frame color: its name, and Yumma UI's color picker in a popover. */
export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="d:f ai:c jc:sb g:3 pb:2">
      <span className="fs:sm us:none c:hint">{label}</span>
      <ColorPicker variant="popover" value={value} onValueChange={onChange} className="fs:0" />
    </div>
  );
}
