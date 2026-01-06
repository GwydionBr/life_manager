import { useOs } from "@mantine/hooks";

import { Group, Kbd } from "@mantine/core";

interface ShortcutProps {
  keys: string[];
}

export default function Shortcut({ keys }: ShortcutProps) {
  const os = useOs();

  const isMac = os === "macos";

  const renderKey = (key: string): string => {
    const k = key.toLowerCase();
    switch (k) {
      case "mod":
        return isMac ? "⌘" : "Ctrl";
      case "option":
      case "alt":
        return isMac ? "⌥" : "Alt";
      case "control":
      case "ctrl":
        return isMac ? "⌃" : "Ctrl";
      case "shift":
        return isMac ? "⇧" : "Shift";
      case "enter":
        return "↵";
      case "del":
        return isMac ? "⌫" : "Del";
      default:
        return key;
    }
  };

  return (
    <Group gap={0}>
      {keys.map((key, index) => (
        <span
          key={`wrap-${index}`}
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          {index > 0 && <span style={{ margin: "0 8px" }}>+</span>}
          <Kbd>{renderKey(key)}</Kbd>
        </span>
      ))}
    </Group>
  );
}
