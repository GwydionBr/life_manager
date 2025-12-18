import { Box, Divider, MantineTransition, Transition } from "@mantine/core";

export default function TransitionDivider({
  mounted,
  transition,
  duration,
  enterDelay,
}: {
  mounted: boolean;
  transition: MantineTransition;
  duration: number;
  enterDelay: number;
}) {
  return (
    <Box w="100%">
      <Transition
        mounted={mounted}
        transition={transition}
        duration={duration}
        enterDelay={enterDelay}
      >
        {(styles) => (
          <div style={{ ...styles, width: "100%" }}>
            <Divider size="sm" w="100%" />
          </div>
        )}
      </Transition>
      <Transition
        mounted={!mounted}
        transition={transition}
        duration={duration}
        enterDelay={enterDelay}
      >
        {(styles) => (
          <div style={{ ...styles, width: "100%" }}>
            <Divider size="sm" w="100%" />
          </div>
        )}
      </Transition>
    </Box>
  );
}
