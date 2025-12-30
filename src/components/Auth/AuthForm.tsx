import { useEffect, useState } from "react";
import { useForm, isEmail } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useRouter } from "@tanstack/react-router";
import { connector } from "@/db/powersync/db";

import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  ScrollArea,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import GithubButton from "@/components/Auth/SocialButtons/GithubButton";

import PasswordStrength from "./PasswordStrenght";
import { showNotification } from "@mantine/notifications";
type AuthType = "login" | "register";

interface AuthenticationFormProps extends PaperProps {
  defaultType?: AuthType;
}

export default function AuthenticationForm({
  defaultType = "login",
  ...props
}: AuthenticationFormProps) {
  const [type, toggle] = useToggle(["login", "register"] as const);
  const [isLoading, setIsLoading] = useState(false);
  const { getLocalizedText } = useIntl();
  const router = useRouter();

  useEffect(() => {
    toggle(defaultType);
  }, [defaultType]);

  async function handleSubmit(values: typeof form.values) {
    setIsLoading(true);
    try {
      if (type === "login") {
        await connector.login(values.email, values.password);
      } else {
        await connector.register(values.email, values.password);
      }
      router.invalidate();
      router.navigate({ to: "/dashboard" });
    } catch (error) {
      console.error(error);
      showNotification({
        title: getLocalizedText("Fehler", "Error"),
        message: getLocalizedText(
          "Fehler beim Anmelden",
          "Error while logging in"
        ),
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGithub() {
    setIsLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      await connector.signInWithGithub(callbackUrl);
      // Note: The user will be redirected to GitHub, so we don't need to
      // navigate here. The callback route will handle the redirect back.
    } catch (error) {
      console.error(error);
      showNotification({
        title: getLocalizedText("Fehler", "Error"),
        message: getLocalizedText(
          "Fehler bei der GitHub-Anmeldung",
          "Error during GitHub login"
        ),
        color: "red",
      });
      setIsLoading(false);
    }
  }

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validate: {
      email: isEmail(
        getLocalizedText("Ungültige E-Mail Adresse", "Invalid email")
      ),
      password: (value) =>
        value.length <= 6
          ? getLocalizedText(
              "Passwort muss mindestens 6 Zeichen lang sein",
              "Password must be at least 6 characters long"
            )
          : null,
      confirmPassword: (value, values) =>
        type === "register" && value !== values.password
          ? getLocalizedText(
              "Passwörter stimmen nicht überein",
              "Passwords do not match"
            )
          : null,
      terms: (value) =>
        type === "register" && value !== true
          ? getLocalizedText(
              "Sie müssen die Nutzungsbedingungen akzeptieren",
              "You must accept the terms and conditions"
            )
          : null,
    },
  });

  return (
    <ScrollArea>
      <Paper radius="md" p="xl" {...props}>
        <Title
          order={2}
          ta="center"
          mt="md"
          mb={50}
          c="var(--mantine-color-text)"
        >
          {getLocalizedText(
            "Willkommen beim Life Manager",
            "Welcome to Life Manager"
          )}
        </Title>
        <Group grow mb="md" mt="md">
          <GithubButton radius="xl" onClick={handleGithub}>
            {getLocalizedText("Mit Github fortfahren", "Continue with Github")}
          </GithubButton>
        </Group>
        <Divider
          label={getLocalizedText(
            "Oder mit E-Mail fortfahren",
            "Or continue with email"
          )}
          labelPosition="center"
          my="lg"
        />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label={getLocalizedText("E-Mail", "Email")}
              radius="md"
              size="md"
              placeholder={getLocalizedText(
                "email@beispiel.com",
                "email@example.com"
              )}
              {...form.getInputProps("email")}
            />
            {type === "register" ? (
              <Stack>
                <PasswordStrength
                  currentPassword={form.values.password}
                  required
                  radius="md"
                  size="md"
                  label={getLocalizedText("Passwort", "Password")}
                  placeholder={getLocalizedText(
                    "Dein Passwort",
                    "Your password"
                  )}
                  {...form.getInputProps("password")}
                />
                <PasswordInput
                  required
                  radius="md"
                  size="md"
                  label={getLocalizedText(
                    "Bestätige Passwort",
                    "Confirm Password"
                  )}
                  placeholder={getLocalizedText(
                    "Bestätige dein Passwort",
                    "Confirm your password"
                  )}
                  {...form.getInputProps("confirmPassword")}
                />
                <Checkbox
                  required
                  label={getLocalizedText(
                    "Ich akzeptiere die Nutzungsbedingungen",
                    "I accept terms and conditions"
                  )}
                  {...form.getInputProps("terms")}
                />
              </Stack>
            ) : (
              <PasswordInput
                required
                radius="md"
                size="md"
                label={getLocalizedText("Passwort", "Password")}
                placeholder={getLocalizedText("Dein Passwort", "Your password")}
                {...form.getInputProps("password")}
              />
            )}
          </Stack>
          <Group justify="space-between" mt="xl">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={() => toggle()}
              size="sm"
            >
              {type === "register"
                ? getLocalizedText(
                    "Hast du bereits ein Konto? Login",
                    "Already have an account? Login"
                  )
                : getLocalizedText(
                    "Hast du noch kein Konto? Registrieren",
                    "Don't have an account? Register"
                  )}
            </Anchor>
            <Button type="submit" radius="xl" loading={isLoading} size="md">
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Paper>
    </ScrollArea>
  );
}
