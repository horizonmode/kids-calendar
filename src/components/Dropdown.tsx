import { Select, SelectItem } from "@tremor/react";

interface DropDownProps {
  options: { label: string; value: string }[];
  label: string;
  onChange: (e: any) => void;
  value: string;
  id: string;
  defaultOption?: string;
  showDefault?: boolean;
}

export default function DropDown({
  options,
  label,
  onChange,
  value,
  id,
  defaultOption,
  showDefault = true,
}: DropDownProps) {
  return (
    <Select key="default" defaultValue="1" onChange={onChange} value={value}>
      {showDefault && (
        <SelectItem key={`select-${id}-default`} value="none">
          {defaultOption}
        </SelectItem>
      )}
      {options.map((o, i) => (
        <SelectItem key={`select-${id}-${i}`} value={o.value}>
          {o.label}
        </SelectItem>
      ))}
    </Select>
  );
}
