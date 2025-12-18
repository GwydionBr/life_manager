import { useIntl } from "@/hooks/useIntl";

import { Text, Title, Stack, Group, Flex, Box } from "@mantine/core";

interface HeaderProps {
  headerTitle?: string;
  leftSalary?: string;
  rightSalary?: string;
  description?: string;
  primaryButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  leftButton?: React.ReactNode;
}

export default function Header({
  headerTitle,
  leftSalary,
  rightSalary,
  description,
  primaryButton,
  secondaryButton,
  rightButton,
  leftButton,
}: HeaderProps) {
  const { getLocalizedText } = useIntl();
  return (
    <Stack align="center" justify="center" py="xl" w="100%">
      <Flex
        w="100%"
        align="center"
        justify="space-between"
        wrap="wrap"
        gap="md"
      >
        {/* Left Button */}
        <Box style={{ flexShrink: 0 }}>
          {leftButton || <div style={{ width: 40 }} />}
        </Box>

        {/* Center Content */}
        <Group align="center" justify="center" style={{ flex: 1, minWidth: 0 }}>
          {leftSalary && (
            <Text c="red" fw={700}>
              {leftSalary}
            </Text>
          )}
          <Title order={1} style={{ textAlign: "center" }}>
            {headerTitle}
          </Title>
          {rightSalary && (
            <Text c={leftSalary ? "blue" : "red"} fw={leftSalary ? 400 : 700}>
              {rightSalary} / {getLocalizedText("Stunde", "Hour")}
            </Text>
          )}
          {primaryButton && primaryButton}
        </Group>

        {/* Right Button */}
        <Box style={{ flexShrink: 0 }}>
          {rightButton || <div style={{ width: 40 }} />}
        </Box>
      </Flex>

      {description && (
        <Title order={2} size="sm">
          {description}
        </Title>
      )}
      {secondaryButton && secondaryButton}
    </Stack>
  );
}
