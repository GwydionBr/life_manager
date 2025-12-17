import { ColorPicker, DEFAULT_THEME, ColorPickerProps } from "@mantine/core";

interface ProjectColorPickerProps extends ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

export default function ProjectColorPicker({
  value,
  onChange,
  onClose,
  ...props
}: ProjectColorPickerProps) {
  return (
    <ColorPicker
      saturationLabel="Saturation"
      hueLabel="Hue"
      value={value}
      onChange={(color) => {
        onChange(color);
      }}
      onColorSwatchClick={(color) => {
        onChange(color);
        onClose();
      }}
      swatchesPerRow={6}
      swatches={[
        DEFAULT_THEME.colors.red[6],
        DEFAULT_THEME.colors.pink[6],
        DEFAULT_THEME.colors.grape[6],
        DEFAULT_THEME.colors.violet[6],
        DEFAULT_THEME.colors.indigo[6],
        DEFAULT_THEME.colors.blue[6],
        DEFAULT_THEME.colors.cyan[6],
        DEFAULT_THEME.colors.teal[6],
        DEFAULT_THEME.colors.green[6],
        DEFAULT_THEME.colors.lime[6],
        DEFAULT_THEME.colors.yellow[6],
        DEFAULT_THEME.colors.orange[6],
      ]}
      autoFocus={true}
      {...props}
    />
  );
}
