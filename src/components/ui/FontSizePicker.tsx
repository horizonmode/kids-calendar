import {
  DropdownButton,
  DropdownCategoryTitle,
} from "@/components/ui/Dropdown";
import { Icon } from "@/components/ui/Icon";
import { Surface } from "@/components/ui/Surface";
import { Toolbar } from "@/components/ui/Toolbar";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { RiFontSize } from "@remixicon/react";
import { useCallback } from "react";

const FONT_SIZES = [
  { label: "Smaller", value: "0.7rem" },
  { label: "Small", value: "0.8rem" },
  { label: "Medium", value: "1rem" },
  { label: "Large", value: "1.2rem" },
  { label: "Extra Large", value: "1.3rem" },
];

export type FontSizePickerProps = {
  onChange: (value: string) => void; // eslint-disable-line no-unused-vars
  value: string;
};

export const FontSizePicker = ({ onChange, value }: FontSizePickerProps) => {
  const currentValue = FONT_SIZES.find((size) => size.value === value);
  const currentSizeLabel = currentValue?.label.split(" ")[0] || "Medium";

  const selectSize = useCallback(
    (size: string) => () => onChange(size),
    [onChange]
  );

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Toolbar.Button active={!!currentValue?.value}>
          <RiFontSize className="h-10 w-10" />
        </Toolbar.Button>
      </Dropdown.Trigger>
      <Dropdown.Content asChild>
        <Surface className="flex flex-col gap-1 px-2 py-4">
          {FONT_SIZES.map((size) => (
            <DropdownButton
              isActive={value === size.value}
              onClick={selectSize(size.value)}
              key={`${size.label}_${size.value}`}
            >
              <span style={{ fontSize: size.value }}>{size.label}</span>
            </DropdownButton>
          ))}
        </Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
