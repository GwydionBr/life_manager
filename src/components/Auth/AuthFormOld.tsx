// deprecated

import { useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Alert,
} from "@mantine/core";
import { useRouter } from "@tanstack/react-router";
import { signIn, signUp } from "@/actions/auth/credentials";


export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn({ data: { email, password } });
      } else {
        await signUp({ data: { email, password } });
      }

      // Redirect to dashboard after successful auth
      router.invalidate();
      router.navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder w={400}>
      <Title order={2} ta="center" mb="md">
        {isLogin ? "Welcome back!" : "Create account"}
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}

          <TextInput
            required
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            disabled={loading}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            disabled={loading}
            minLength={6}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            variant="gradient"
            gradient={{ from: "violet", to: "grape", deg: 135 }}
          >
            {isLogin ? "Sign in" : "Sign up"}
          </Button>
        </Stack>
      </form>

      <Text ta="center" mt="md">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Anchor
          component="button"
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          disabled={loading}
        >
          {isLogin ? "Sign up" : "Sign in"}
        </Anchor>
      </Text>
    </Paper>
  );
}
