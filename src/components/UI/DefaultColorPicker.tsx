import { ColorPicker, DEFAULT_THEME, ColorPickerProps } from "@mantine/core";

interface DefaultColorPickerProps extends ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
}

export default function DefaultColorPicker({
  color,
  setColor,
  ...props
}: DefaultColorPickerProps) {
  return (
    <ColorPicker
      format="hex"
      value={color || DEFAULT_THEME.colors.lime[6]}
      onChange={setColor}
      withPicker={false}
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
      {...props}
    />
  );
}
