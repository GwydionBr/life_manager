import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import GroupDefaultSettings from "./GroupDefaultSettings";

export default function GroupSettings() {
  return (
    <Stack>
      <SettingsRow title="Group Settings" children={<GroupDefaultSettings />} />
    </Stack>
  );
}
