import { Group, Kbd } from "@mantine/core";
import { useEffect, useState } from "react";

interface ShortcutProps {
  keys: string[];
}

export default function Shortcut({ keys }: ShortcutProps) {
  const [isMac, setIsMac] = useState<boolean>(false);

  useEffect(() => {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const platform =
      (nav as any)?.userAgentData?.platform || nav?.platform || "";
    const ua = nav?.userAgent || "";
    const detectedMac =
      /Mac|iPhone|iPad|iPod/i.test(platform) ||
      /Mac OS X|like Mac OS X/i.test(ua);
    setIsMac(detectedMac);
  }, []);

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
