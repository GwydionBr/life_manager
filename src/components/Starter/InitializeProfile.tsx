import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { useForm } from "@mantine/form";
import {
  profileCollection,
  useOtherProfiles,
  useProfile,
} from "@/db/collections/profile/profile-collection";

import {
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  Title,
  Box,
  Container,
  Paper,
  ThemeIcon,
  Divider,
  Progress,
  rem,
  ColorSwatch,
  MantineColor,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCheck,
  IconUser,
  IconWorld,
  IconClock,
  IconSparkles,
} from "@tabler/icons-react";
import ReactCountryFlag from "react-country-flag";

import { locales } from "@/constants/settings";
import { getGradientForColor, mantineColors } from "@/constants/colors";

import { Locale } from "@/types/settings.types";

export default function InitializeProfile() {
  const router = useRouter();
  const { data: otherProfiles } = useOtherProfiles();
  const { data: profile } = useProfile();

  const { locale, format_24h, setSettingState, primaryColor, setPrimaryColor } =
    useSettingsStore();
  const { getLocalizedText } = useIntl();

  const currentLocale = useMemo(
    () => locales.find((l) => l.value === locale),
    [locale]
  );

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
    profileCollection.update(profile.id, (draft) => {
      draft.username = values.username;
      draft.full_name = `${values.name} ${values.surname}`;
      draft.initialized = true;
    });
    router.invalidate();
    router.navigate({ to: "/dashboard" });
  }

  if (!profile) {
    return null;
  }

  const isUsernameValid =
    !form.errors.username && form.values.username.length >= 3;
  const isOldUsername = profile.username === form.values.username;

  // Calculate form completion percentage
  const totalFields = 3;
  let completedFields = 0;
  if (form.values.name) completedFields++;
  if (form.values.surname) completedFields++;
  if (isUsernameValid && !isOldUsername) completedFields++;
  const progressPercentage = (completedFields / totalFields) * 100;

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: rem(20),
      }}
    >
      <Container size="lg" w="100%" maw={1000}>
        <Stack gap="lg">
          {/* Welcome Header */}
          <Group justify="center" align="center" wrap="nowrap">
            <ThemeIcon
              size={65}
              radius="xl"
              variant="gradient"
              gradient={getGradientForColor(primaryColor)}
            >
              <IconSparkles size={32} stroke={2} />
            </ThemeIcon>
            <div>
              <Title
                order={1}
                style={{
                  fontSize: rem(34),
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
                c={primaryColor}
              >
                {getLocalizedText("Willkommen!", "Welcome!")}
              </Title>
              <Text size="md" c="dimmed" mt={4}>
                {getLocalizedText(
                  "Lass uns dein Profil einrichten.",
                  "Let's set up your profile."
                )}
              </Text>
            </div>
          </Group>

          {/* Progress Bar */}
          <Box>
            <Group justify="space-between" mb={8}>
              <Text size="sm" fw={500} c="dimmed">
                {getLocalizedText(
                  "Profil vervollständigen",
                  "Complete Profile"
                )}
              </Text>
              <Text size="sm" fw={600}>
                {completedFields}/{totalFields}
              </Text>
            </Group>
            <Progress
              value={progressPercentage}
              transitionDuration={500}
              color={primaryColor}
              size="md"
              radius="xl"
              animated
              striped={progressPercentage < 100}
            />
          </Box>

          {/* Main Card */}
          <Paper
            shadow="xl"
            radius="lg"
            p="xl"
            style={{
              background:
                "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))",
              border: `2px solid light-dark(var(--mantine-color-${primaryColor}-2), var(--mantine-color-${primaryColor}-8))`,
            }}
          >
            <Group align="flex-start" gap="xl" wrap="nowrap">
              {/* Settings Section */}
              <Stack gap="md" style={{ flex: "0 0 42%" }}>
                <Group gap="sm">
                  <ThemeIcon size="md" variant="light" color={primaryColor}>
                    <IconWorld size={18} />
                  </ThemeIcon>
                  <Text fw={600} size="md">
                    {getLocalizedText("Einstellungen", "Settings")}
                  </Text>
                </Group>

                <Stack gap="md">
                  <Select
                    size="md"
                    data={locales}
                    label={getLocalizedText("Sprache", "Language")}
                    placeholder={getLocalizedText(
                      "Sprache auswählen",
                      "Select Language"
                    )}
                    value={locale}
                    allowDeselect={false}
                    onChange={(value) =>
                      setSettingState({ locale: value as Locale })
                    }
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
                    size="md"
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
                    leftSection={<IconClock size={18} />}
                  />
                  <Select
                    size="md"
                    data={mantineColors}
                    label={getLocalizedText("Theme-Farbe", "Theme Color")}
                    placeholder={getLocalizedText(
                      "Farbe auswählen",
                      "Select Color"
                    )}
                    value={primaryColor}
                    allowDeselect={false}
                    onChange={(value) => setPrimaryColor(value as MantineColor)}
                    leftSection={
                      <ColorSwatch
                        color={`var(--mantine-color-${primaryColor}-6)`}
                        size={18}
                      />
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
                </Stack>

                <Text size="xs" c="dimmed" mt="xs">
                  {getLocalizedText(
                    "Du kannst diese Einstellungen später ändern.",
                    "You can change these settings later."
                  )}
                </Text>
              </Stack>

              <Divider orientation="vertical" />

              {/* Profile Form */}
              <form
                onSubmit={form.onSubmit(handleSubmit)}
                style={{ flex: "0 0 53%" }}
              >
                <Stack gap="md">
                  <Group gap="sm">
                    <ThemeIcon size="md" variant="light" color={primaryColor}>
                      <IconUser size={18} />
                    </ThemeIcon>
                    <Text fw={600} size="md">
                      {getLocalizedText(
                        "Persönliche Informationen",
                        "Personal Information"
                      )}
                    </Text>
                  </Group>

                  <Group grow>
                    <TextInput
                      size="md"
                      label={getLocalizedText("Vorname", "First Name")}
                      placeholder={getLocalizedText("Max", "John")}
                      {...form.getInputProps("name")}
                    />
                    <TextInput
                      size="md"
                      label={getLocalizedText("Nachname", "Last Name")}
                      placeholder={getLocalizedText("Mustermann", "Doe")}
                      {...form.getInputProps("surname")}
                    />
                  </Group>

                  <TextInput
                    size="md"
                    withAsterisk
                    label={getLocalizedText("Benutzername", "Username")}
                    placeholder={getLocalizedText(
                      "Gib einen einzigartigen Benutzernamen ein",
                      "Enter a unique username"
                    )}
                    description={getLocalizedText(
                      "Mindestens 3 Zeichen",
                      "At least 3 characters"
                    )}
                    {...form.getInputProps("username")}
                    rightSection={
                      isUsernameValid && !isOldUsername ? (
                        <ThemeIcon color="green" variant="light" size="sm">
                          <IconCheck size={16} />
                        </ThemeIcon>
                      ) : null
                    }
                  />

                  <Button
                    fullWidth
                    size="lg"
                    rightSection={<IconArrowRight size={20} />}
                    type="submit"
                    disabled={
                      !isUsernameValid ||
                      isOldUsername ||
                      !profile ||
                      !isUsernameValid
                    }
                    variant="gradient"
                    gradient={{
                      from: `${primaryColor}.5`,
                      to: `${primaryColor}.7`,
                      deg: 135,
                    }}
                    mt="md"
                  >
                    {getLocalizedText("Los geht's!", "Let's Go!")}
                  </Button>
                </Stack>
              </form>
            </Group>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
