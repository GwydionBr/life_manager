// src/components/Legal/LegalHeader.tsx
import { Link, useRouteContext, useLocation } from "@tanstack/react-router";
import {
  Container,
  Group,
  Button,
  Title,
  Divider,
  Stack,
  Anchor,
} from "@mantine/core";
import {
  IconHome,
  IconDashboard,
  IconFileText,
  IconShield,
} from "@tabler/icons-react";

export function LegalHeader() {
  const { user } = useRouteContext({ from: "__root__" });
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Container size="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2} c="teal">
            Life Manager
          </Title>
          <Group gap="xs">
            <Button
              component={Link}
              to="/"
              variant={pathname === "/" ? "light" : "subtle"}
              leftSection={<IconHome size={16} />}
              size="sm"
            >
              Startseite
            </Button>
            {user && (
              <Button
                component={Link}
                to="/dashboard"
                variant={pathname === "/dashboard" ? "light" : "subtle"}
                leftSection={<IconDashboard size={16} />}
                size="sm"
                color="teal"
              >
                Dashboard
              </Button>
            )}
          </Group>
        </Group>

        <Divider />

        <Group gap="md">
          <Anchor
            component={Link}
            to="/impressum"
            size="sm"
            c={pathname === "/impressum" ? "teal" : "dimmed"}
            fw={pathname === "/impressum" ? 600 : 400}
            style={{
              textDecoration: "none",
              borderBottom: pathname === "/impressum" ? "2px solid" : "none",
              paddingBottom: pathname === "/impressum" ? "4px" : "0",
            }}
          >
            <Group gap={4}>
              <IconFileText size={16} />
              Impressum
            </Group>
          </Anchor>
          <Anchor
            component={Link}
            to="/datenschutz"
            size="sm"
            c={pathname === "/datenschutz" ? "teal" : "dimmed"}
            fw={pathname === "/datenschutz" ? 600 : 400}
            style={{
              textDecoration: "none",
              borderBottom: pathname === "/datenschutz" ? "2px solid" : "none",
              paddingBottom: pathname === "/datenschutz" ? "4px" : "0",
            }}
          >
            <Group gap={4}>
              <IconShield size={16} />
              Datenschutzerklärung
            </Group>
          </Anchor>
        </Group>
      </Stack>
    </Container>
  );
}
