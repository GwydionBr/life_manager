import { Menu, Button, Text, Avatar } from "@mantine/core";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/utils/supabase";
import { useRouter } from "@tanstack/react-router";

const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
});

interface UserMenuProps {
  userEmail?: string | null;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.invalidate();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button variant="subtle" style={{ padding: "0 8px" }}>
          <Avatar color="violet" radius="xl" size="sm">
            {userEmail?.charAt(0).toUpperCase() || "U"}
          </Avatar>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" truncate>
            {userEmail || "User"}
          </Text>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item color="red" onClick={handleSignOut}>
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
