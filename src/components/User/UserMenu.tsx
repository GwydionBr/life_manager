import { Menu, Button, Text, Avatar } from "@mantine/core";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profileQueryOptions } from "@/queries/profile/use-profile";
import { signOut } from "@/actions/auth/signOut";

export function UserMenu() {
  const router = useRouter();

  const { data: profile } = useQuery(profileQueryOptions);

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
        <Button variant="transparent" style={{ padding: "0 8px" }}>
          <Avatar
            src={profile?.avatar_url || undefined}
            color="violet"
            radius="xl"
            size="sm"
          >
            {profile?.full_name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" truncate>
            {profile?.full_name ||
              profile?.username ||
              profile?.email ||
              "User"}
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
