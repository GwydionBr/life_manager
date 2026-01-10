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

export default function Datenschutz() {
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
            Datenschutzerklärung
          </Title>
          <Text size="sm" c="dimmed" mb="xl">
            Datenschutz auf einen Blick
          </Text>
        </Box>

        <Stack gap="md">
          <Box>
            <Title order={3} size="h4" mb="xs">
              Allgemeine Hinweise
            </Title>
            <Text size="sm">
              Die folgenden Hinweise geben einen einfachen Überblick darüber,
              was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
              Website besuchen. Personenbezogene Daten sind alle Daten, mit
              denen Sie persönlich identifiziert werden können.
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Datenerfassung auf dieser Website
            </Title>
            <Stack gap="sm">
              <Box>
                <Title order={4} size="h5" mb="xs">
                  Wer ist verantwortlich für die Datenerfassung auf dieser
                  Website?
                </Title>
                <Text size="sm">
                  Die Datenverarbeitung auf dieser Website erfolgt durch den
                  Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt
                  &ldquo;Hinweis zur Verantwortlichen Stelle&rdquo; in dieser
                  Datenschutzerklärung entnehmen.
                </Text>
              </Box>

              <Box>
                <Title order={4} size="h5" mb="xs">
                  Wie erfassen wir Ihre Daten?
                </Title>
                <Text size="sm">
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns
                  diese mitteilen. Hierbei kann es sich z. B. um Daten handeln,
                  die Sie in ein Kontaktformular eingeben. Andere Daten werden
                  automatisch oder nach Ihrer Einwilligung beim Besuch der
                  Website durch unsere IT-Systeme erfasst. Das sind vor allem
                  technische Daten (z. B. Internetbrowser, Betriebssystem oder
                  Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt
                  automatisch, sobald Sie diese Website betreten.
                </Text>
              </Box>

              <Box>
                <Title order={4} size="h5" mb="xs">
                  Wofür nutzen wir Ihre Daten?
                </Title>
                <Text size="sm">
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie
                  Bereitstellung der Website zu gewährleisten. Andere Daten
                  können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                </Text>
              </Box>

              <Box>
                <Title order={4} size="h5" mb="xs">
                  Welche Rechte haben Sie bezüglich Ihrer Daten?
                </Title>
                <Text size="sm">
                  Sie haben jederzeit das Recht, unentgeltlich Auskunft über
                  Herkunft, Empfänger und Zweck Ihrer gespeicherten
                  personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                  Recht, die Berichtigung oder Löschung dieser Daten zu
                  verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung
                  erteilt haben, können Sie diese Einwilligung jederzeit für die
                  Zukunft widerrufen. Außerdem haben Sie das Recht, unter
                  bestimmten Umständen die Einschränkung der Verarbeitung Ihrer
                  personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen
                  ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
                </Text>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Hosting
            </Title>
            <Text size="sm">
              Diese Website wird bei Vercel Inc. gehostet. Anbieter ist Vercel
              Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Wenn Sie diese
              Website besuchen, erfasst Vercel automatisch verschiedene Logfiles
              inklusive Ihrer IP-Adressen. Diese Daten werden zur Bereitstellung
              und Sicherstellung der Stabilität und Sicherheit des Dienstes
              verwendet. Weitere Informationen finden Sie in der
              Datenschutzerklärung von Vercel:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Vercel Analytics
            </Title>
            <Text size="sm" mb="xs">
              Diese Website nutzt Vercel Analytics zur Analyse des
              Nutzerverhaltens. Vercel Analytics erfasst anonymisierte Daten
              über die Nutzung der Website, wie z. B. Seitenaufrufe,
              Verweildauer und Interaktionen. Diese Daten werden verwendet, um
              die Website zu verbessern und die Nutzererfahrung zu optimieren.
              Die Daten werden anonymisiert erfasst und können nicht auf
              einzelne Personen zurückgeführt werden.
            </Text>
            <Text size="sm" c="dimmed" style={{ fontStyle: "italic" }}>
              Wichtig: Vercel Analytics verwendet keine Cookies und erfasst
              keine personenbezogenen Daten. Daher ist keine Cookie-Einwilligung
              erforderlich. Die Verarbeitung erfolgt auf Grundlage des
              berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO.
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Kontaktformular
            </Title>
            <Text size="sm">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden
              Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort
              angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für
              den Fall von Anschlussfragen bei uns gespeichert. Diese Daten
              geben wir nicht ohne Ihre Einwilligung weiter.
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Speicherdauer
            </Title>
            <Text size="sm">
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere
              Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen
              Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.
              Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine
              Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten
              gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für
              die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer-
              oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten
              Fall erfolgt die Löschung nach Fortfall dieser Gründe.
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="xs">
              Allgemeine Hinweise zur Pflicht zur Auskunftserteilung
            </Title>
            <Text size="sm">
              Die Verantwortlichen stellen sicher, dass sie zu jeder Zeit in der
              Lage sind, den Nachweis zu erbringen, dass die Einwilligung einer
              betroffenen Person zur Verarbeitung personenbezogener Daten
              erteilt wurde. Die Verantwortlichen informieren die betroffene
              Person darüber hinaus über alle weiteren Informationen, die zur
              Gewährleistung einer fairen und transparenten Verarbeitung
              erforderlich sind.
            </Text>
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
