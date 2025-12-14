"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useRouter } from "@tanstack/react-router";
import { useOtherProfiles, useProfile } from "@/queries/profile/use-profile";
import { useUpdateProfile } from "@/queries/profile/use-update-profile";

import {
  Card,
  Text,
  TextInput,
  Button,
  Modal,
  Group,
  Stack,
  Select,
} from "@mantine/core";
import { IconArrowRight, IconCheck, IconUser } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { Locale } from "@/types/settings.types";
import ReactCountryFlag from "react-country-flag";
import { locales } from "@/constants/settings";


export default function InitializeProfile() {
  const router = useRouter();
  const { data: profile, isPending: isProfilePending } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: () => {
      router.invalidate();
      router.navigate({ to: "/dashboard" });
    },
  });
  const { data: otherProfiles } = useOtherProfiles();

  const { locale, format_24h, setSettingState, primaryColor } =
    useSettingsStore();
  const { getLocalizedText } = useIntl();

  const currentLocale = locales.find((l) => l.value === locale);

  const form = useForm({
    initialValues: {
      name: "",
      surname: "",
      username: "",
    },
    validate: {
      username: (value) => {
        if (!value) return null;
        if (value.length < 3) return null;

        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return getLocalizedText(
            "Benutzername kann nur Buchstaben, Zahlen und Unterstriche enthalten",
            "Username can only contain letters, numbers, and underscores"
          );
        }
        if (value.length > 20)
          return getLocalizedText(
            "Benutzername muss höchstens 20 Zeichen lang sein",
            "Username must be at most 20 characters long"
          );
        if (
          otherProfiles?.some(
            (p) => p.username === value && p.id !== profile?.id
          )
        ) {
          return getLocalizedText(
            "Benutzername ist bereits vergeben",
            "Username is already taken"
          );
        }
        return null;
      },
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  async function handleSubmit(values: typeof form.values) {
    if (!profile) return;
    updateProfile({
      id: profile.id,
      full_name: `${values.name} ${values.surname}`,
      username: values.username,
      initialized: true,
    });
  }

  if (!profile) {
    return null;
  }

  const isUsernameValid =
    !form.errors.username && form.values.username.length >= 3;
  const isOldUsername = profile.username === form.values.username;

  return (
    <Stack align="center" justify="center" h="100vh">
      <Card
        withBorder
        style={{
          border: `2px solid light-dark(var(--mantine-color-${primaryColor}-3), var(--mantine-color-${primaryColor}-7))`,
        }}
      >
        <Stack>
          <Text>
            {getLocalizedText(
              "Fülle die folgenden Informationen aus, um zu starten.",
              "Fill in the following information to get started."
            )}
          </Text>
          <Group grow>
            <Select
              data={locales}
              label={getLocalizedText("Sprache", "Language")}
              placeholder={getLocalizedText(
                "Sprache auswählen",
                "Select Language"
              )}
              value={locale}
              allowDeselect={false}
              onChange={(value) => setSettingState({ locale: value as Locale })}
              leftSection={
                currentLocale && (
                  <ReactCountryFlag
                    countryCode={currentLocale.flag}
                    svg
                    style={{ width: "1.2em", height: "1.2em" }}
                  />
                )
              }
              renderOption={({ option, ...others }) => {
                const localeData = locales.find(
                  (l) => l.value === option.value
                );
                return (
                  <div {...others}>
                    <Group gap="xs">
                      <ReactCountryFlag
                        countryCode={localeData?.flag || "US"}
                        svg
                        style={{ width: "1.2em", height: "1.2em" }}
                      />
                      <Text>{option.label}</Text>
                    </Group>
                  </div>
                );
              }}
            />
            <Select
              data={[
                { value: "24h", label: "24h" },
                { value: "12h", label: "12h" },
              ]}
              label={getLocalizedText("Zeitformat", "Time Format")}
              placeholder={getLocalizedText(
                "Zeitformat auswählen",
                "Select Time Format"
              )}
              value={format_24h ? "24h" : "12h"}
              onChange={(value) =>
                setSettingState({ format_24h: value === "24h" })
              }
            />
          </Group>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label={getLocalizedText("Name", "Name")}
                {...form.getInputProps("name")}
              />
              <TextInput
                label={getLocalizedText("Nachname", "Surname")}
                {...form.getInputProps("surname")}
              />
              <Stack gap="md">
                <TextInput
                  withAsterisk
                  label={getLocalizedText("Neuer Benutzername", "New Username")}
                  placeholder={getLocalizedText(
                    "Gib einen neuen Benutzernamen ein (min. 3 Zeichen)",
                    "Enter new username (min. 3 characters)"
                  )}
                  {...form.getInputProps("username")}
                  rightSection={
                    isUsernameValid && !isOldUsername ? (
                      <IconCheck
                        size={16}
                        style={{
                          color: "var(--mantine-color-green-6)",
                        }}
                      />
                    ) : null
                  }
                />
                <Button
                  rightSection={<IconArrowRight size={16} />}
                  type="submit"
                  disabled={
                    !isUsernameValid ||
                    isUpdating ||
                    isOldUsername ||
                    !profile ||
                    isProfilePending
                  }
                  loading={isUpdating}
                >
                  {getLocalizedText("Starten", "Get Started")}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  );
}
