import { Link } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Button,
  Group,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

export default function Impressum() {
  return (
    <Container size="md" py={80}>
      <Stack gap="xl">
        <Group>
          <Button
            component={Link}
            to="/"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Zurück zur Startseite
          </Button>
        </Group>

        <Box>
          <Title order={1} mb="md">
            Impressum
          </Title>
          <Text size="sm" c="dimmed" mb="xl">
            Angaben gemäß § 5 TMG
          </Text>
        </Box>

        <Stack gap="md">
          <Box>
            <Title order={3} size="h4" mb="xs">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
            </Title>
            <Text>
              Gwydion Braunsdorf
              <br />
              Marktplatz 7
              <br />
              87724 Ottobeuren
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Kontakt:
            </Title>
            <Text>E-Mail: gwydie@googlemail.com</Text>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Haftungsausschluss:
            </Title>
            <Stack gap="sm">
              <Box>
                <Title order={4} size="h5" mb="xs">
                  Haftung für Inhalte
                </Title>
                <Text size="sm">
                  Die Inhalte unserer Seiten wurden mit größter Sorgfalt
                  erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
                  der Inhalte können wir jedoch keine Gewähr übernehmen. Als
                  Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
                  Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                  verantwortlich.
                </Text>
              </Box>

              <Box>
                <Title order={4} size="h5" mb="xs">
                  Haftung für Links
                </Title>
                <Text size="sm">
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf
                  deren Inhalte wir keinen Einfluss haben. Deshalb können wir
                  für diese fremden Inhalte auch keine Gewähr übernehmen. Für
                  die Inhalte der verlinkten Seiten ist stets der jeweilige
                  Anbieter oder Betreiber der Seiten verantwortlich.
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
