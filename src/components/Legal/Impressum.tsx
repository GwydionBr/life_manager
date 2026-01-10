import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Card,
  Divider,
  ThemeIcon,
  Group,
} from "@mantine/core";
import {
  IconFileText,
  IconMail,
  IconUser,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { LegalHeader } from "./LegalHeader";

export default function Impressum() {
  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(13, 148, 136, 0.08) 100%)",
      }}
    >
      <Box py={40}>
        <LegalHeader />
      </Box>

      <Container size="md" py={60}>
        <Stack gap="xl">
          <Box ta="center" mb="xl">
            <ThemeIcon
              size={64}
              radius="md"
              variant="gradient"
              gradient={{ from: "teal", to: "cyan", deg: 135 }}
              mb="md"
            >
              <IconFileText size={32} />
            </ThemeIcon>
            <Title order={1} mb="xs">
              Impressum
            </Title>
            <Text size="sm" c="dimmed">
              Angaben gemäß § 5 TMG
            </Text>
          </Box>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Box>
                <Group gap="xs" mb="xs">
                  <IconUser size={20} color="var(--mantine-color-teal-6)" />
                  <Title order={3} size="h4">
                    Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
                  </Title>
                </Group>
                <Text pl={28}>
                  Gwydion Braunsdorf
                  <br />
                  Marktplatz 7
                  <br />
                  87724 Ottobeuren
                </Text>
              </Box>

              <Divider />

              <Box>
                <Group gap="xs" mb="xs">
                  <IconMail size={20} color="var(--mantine-color-teal-6)" />
                  <Title order={3} size="h4">
                    Kontakt:
                  </Title>
                </Group>
                <Text pl={28}>E-Mail: gwydie@googlemail.com</Text>
              </Box>

              <Divider />

              <Box>
                <Group gap="xs" mb="md">
                  <IconAlertTriangle
                    size={20}
                    color="var(--mantine-color-teal-6)"
                  />
                  <Title order={3} size="h4">
                    Haftungsausschluss:
                  </Title>
                </Group>
                <Stack gap="md" pl={28}>
                  <Box>
                    <Title order={4} size="h5" mb="xs">
                      Haftung für Inhalte
                    </Title>
                    <Text size="sm" c="dimmed">
                      Die Inhalte unserer Seiten wurden mit größter Sorgfalt
                      erstellt. Für die Richtigkeit, Vollständigkeit und
                      Aktualität der Inhalte können wir jedoch keine Gewähr
                      übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1
                      TMG für eigene Inhalte auf diesen Seiten nach den
                      allgemeinen Gesetzen verantwortlich.
                    </Text>
                  </Box>

                  <Box>
                    <Title order={4} size="h5" mb="xs">
                      Haftung für Links
                    </Title>
                    <Text size="sm" c="dimmed">
                      Unser Angebot enthält Links zu externen Webseiten Dritter,
                      auf deren Inhalte wir keinen Einfluss haben. Deshalb
                      können wir für diese fremden Inhalte auch keine Gewähr
                      übernehmen. Für die Inhalte der verlinkten Seiten ist
                      stets der jeweilige Anbieter oder Betreiber der Seiten
                      verantwortlich.
                    </Text>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
