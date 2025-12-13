import { ColorSwatch, Group, Select, Text } from "@mantine/core";
import { MantineColor } from "@mantine/core";

// Mantine default colors
const mantineColors = [
  { value: "dark", label: "Dark" },
  { value: "gray", label: "Gray" },
  { value: "red", label: "Red" },
  { value: "pink", label: "Pink" },
  { value: "grape", label: "Grape" },
  { value: "violet", label: "Violet" },
  { value: "indigo", label: "Indigo" },
  { value: "blue", label: "Blue" },
  { value: "cyan", label: "Cyan" },
  { value: "teal", label: "Teal" },
  { value: "green", label: "Green" },
  { value: "lime", label: "Lime" },
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
];

interface ModuleColorPickerProps {
  label: string;
  placeholder: string;
  value: MantineColor;
  onChange: (color: MantineColor) => void;
}

export default function ModuleColorPicker({
  label,
  placeholder,
  value,
  onChange,
}: ModuleColorPickerProps) {
  return (
    <Group>
      <Select
        data={mantineColors}
        label={label}
        placeholder={placeholder}
        value={value}
        allowDeselect={false}
        onChange={(val) => onChange(val as MantineColor)}
        leftSection={
          <ColorSwatch color={`var(--mantine-color-${value}-6)`} size={18} />
        }
        renderOption={({ option, ...others }) => (
          <div {...others}>
            <Group gap="xs">
              <ColorSwatch
                color={`var(--mantine-color-${option.value}-6)`}
                size={18}
              />
              <Text>{option.label}</Text>
            </Group>
          </div>
        )}
      />
    </Group>
  );
}
