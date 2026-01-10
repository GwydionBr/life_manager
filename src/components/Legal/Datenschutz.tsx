import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Card,
  Divider,
  ThemeIcon,
  Alert,
  Group,
} from "@mantine/core";
import {
  IconShield,
  IconInfoCircle,
  IconDatabase,
  IconChartBar,
  IconMail,
  IconClock,
  IconFileText,
} from "@tabler/icons-react";
import { LegalHeader } from "./LegalHeader";

export default function Datenschutz() {
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
              <IconShield size={32} />
            </ThemeIcon>
            <Title order={1} mb="xs">
              Datenschutzerklärung
            </Title>
            <Text size="sm" c="dimmed">
              Datenschutz auf einen Blick
            </Text>
          </Box>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Box>
                <Group gap="xs" mb="xs">
                  <IconInfoCircle
                    size={20}
                    color="var(--mantine-color-teal-6)"
                  />
                  <Title order={3} size="h4">
                    Allgemeine Hinweise
                  </Title>
                </Group>
                <Text size="sm" c="dimmed" pl={28}>
                  Die folgenden Hinweise geben einen einfachen Überblick
                  darüber, was mit Ihren personenbezogenen Daten passiert, wenn
                  Sie diese Website besuchen. Personenbezogene Daten sind alle
                  Daten, mit denen Sie persönlich identifiziert werden können.
                </Text>
              </Box>
            </Stack>
          </Card>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Group gap="xs" mb="md">
                <IconDatabase size={20} color="var(--mantine-color-teal-6)" />
                <Title order={3} size="h4">
                  Datenerfassung auf dieser Website
                </Title>
              </Group>

              <Stack gap="md">
                <Box>
                  <Title order={4} size="h5" mb="xs">
                    Wer ist verantwortlich für die Datenerfassung auf dieser
                    Website?
                  </Title>
                  <Text size="sm" c="dimmed">
                    Die Datenverarbeitung auf dieser Website erfolgt durch den
                    Websitebetreiber. Dessen Kontaktdaten können Sie dem{" "}
                    <a
                      href="/impressum"
                      style={{ color: "var(--mantine-color-teal-6)" }}
                    >
                      Impressum
                    </a>{" "}
                    entnehmen.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Title order={4} size="h5" mb="xs">
                    Wie erfassen wir Ihre Daten?
                  </Title>
                  <Text size="sm" c="dimmed">
                    Ihre Daten werden zum einen dadurch erhoben, dass Sie uns
                    diese mitteilen. Hierbei kann es sich z. B. um Daten
                    handeln, die Sie in ein Kontaktformular eingeben. Andere
                    Daten werden automatisch oder nach Ihrer Einwilligung beim
                    Besuch der Website durch unsere IT-Systeme erfasst. Das sind
                    vor allem technische Daten (z. B. Internetbrowser,
                    Betriebssystem oder Uhrzeit des Seitenaufrufs). Die
                    Erfassung dieser Daten erfolgt automatisch, sobald Sie diese
                    Website betreten.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Title order={4} size="h5" mb="xs">
                    Wofür nutzen wir Ihre Daten?
                  </Title>
                  <Text size="sm" c="dimmed">
                    Ein Teil der Daten wird erhoben, um eine fehlerfreie
                    Bereitstellung der Website zu gewährleisten. Andere Daten
                    können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Title order={4} size="h5" mb="xs">
                    Welche Rechte haben Sie bezüglich Ihrer Daten?
                  </Title>
                  <Text size="sm" c="dimmed">
                    Sie haben jederzeit das Recht, unentgeltlich Auskunft über
                    Herkunft, Empfänger und Zweck Ihrer gespeicherten
                    personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                    Recht, die Berichtigung oder Löschung dieser Daten zu
                    verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung
                    erteilt haben, können Sie diese Einwilligung jederzeit für
                    die Zukunft widerrufen. Außerdem haben Sie das Recht, unter
                    bestimmten Umständen die Einschränkung der Verarbeitung
                    Ihrer personenbezogenen Daten zu verlangen. Des Weiteren
                    steht Ihnen ein Beschwerderecht bei der zuständigen
                    Aufsichtsbehörde zu.
                  </Text>
                </Box>
              </Stack>
            </Stack>
          </Card>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="xs" mb="xs">
                <IconDatabase size={20} color="var(--mantine-color-teal-6)" />
                <Title order={3} size="h4">
                  Hosting
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                Diese Website wird bei Vercel Inc. gehostet. Anbieter ist Vercel
                Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Wenn Sie
                diese Website besuchen, erfasst Vercel automatisch verschiedene
                Logfiles inklusive Ihrer IP-Adressen. Diese Daten werden zur
                Bereitstellung und Sicherstellung der Stabilität und Sicherheit
                des Dienstes verwendet. Weitere Informationen finden Sie in der
                Datenschutzerklärung von Vercel:{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--mantine-color-teal-6)" }}
                >
                  https://vercel.com/legal/privacy-policy
                </a>
              </Text>
            </Stack>
          </Card>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="xs" mb="xs">
                <IconChartBar size={20} color="var(--mantine-color-teal-6)" />
                <Title order={3} size="h4">
                  Vercel Analytics
                </Title>
              </Group>
              <Text size="sm" c="dimmed" mb="xs">
                Diese Website nutzt Vercel Analytics zur Analyse des
                Nutzerverhaltens. Vercel Analytics erfasst anonymisierte Daten
                über die Nutzung der Website, wie z. B. Seitenaufrufe,
                Verweildauer und Interaktionen. Diese Daten werden verwendet, um
                die Website zu verbessern und die Nutzererfahrung zu optimieren.
                Die Daten werden anonymisiert erfasst und können nicht auf
                einzelne Personen zurückgeführt werden.
              </Text>
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Wichtig"
                color="teal"
                variant="light"
              >
                Vercel Analytics verwendet keine Cookies und erfasst keine
                personenbezogenen Daten. Daher ist keine Cookie-Einwilligung
                erforderlich. Die Verarbeitung erfolgt auf Grundlage des
                berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO.
              </Alert>
            </Stack>
          </Card>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="xs" mb="xs">
                <IconMail size={20} color="var(--mantine-color-teal-6)" />
                <Title order={3} size="h4">
                  Kontaktformular
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen,
                werden Ihre Angaben aus dem Anfrageformular inklusive der von
                Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der
                Anfrage und für den Fall von Anschlussfragen bei uns
                gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung
                weiter.
              </Text>
            </Stack>
          </Card>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="xs" mb="xs">
                <IconClock size={20} color="var(--mantine-color-teal-6)" />
                <Title order={3} size="h4">
                  Speicherdauer
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere
                Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen
                Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.
                Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine
                Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten
                gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe
                für die Speicherung Ihrer personenbezogenen Daten haben (z. B.
                steuer- oder handelsrechtliche Aufbewahrungsfristen); im
                letztgenannten Fall erfolgt die Löschung nach Fortfall dieser
                Gründe.
              </Text>
            </Stack>
          </Card>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="xs" mb="xs">
                <IconFileText size={20} color="var(--mantine-color-teal-6)" />
                <Title order={3} size="h4">
                  Allgemeine Hinweise zur Pflicht zur Auskunftserteilung
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                Die Verantwortlichen stellen sicher, dass sie zu jeder Zeit in
                der Lage sind, den Nachweis zu erbringen, dass die Einwilligung
                einer betroffenen Person zur Verarbeitung personenbezogener
                Daten erteilt wurde. Die Verantwortlichen informieren die
                betroffene Person darüber hinaus über alle weiteren
                Informationen, die zur Gewährleistung einer fairen und
                transparenten Verarbeitung erforderlich sind.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
