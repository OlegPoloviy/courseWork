"use client";
import {
  Box,
  Button,
  Text,
  Input,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import NextLink from "next/link";

const LoginModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        username: email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        console.log("Logged in successfully");
        router.push("/home");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    }
  };

  return (
    <Box
      width="400px"
      p={6}
      borderRadius="20px"
      bg="rgba(255, 255, 255, 0.2)"
      backdropFilter="blur(10px)"
      boxShadow="lg"
      color="white"
      textAlign="center"
    >
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Login
      </Text>

      {error && (
        <Box bg="red.500" p={2} borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      )}

      <form onSubmit={login}>
        <Text textAlign="left" mb={2}>
          Email
        </Text>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="username@gmail.com"
          type="email"
          bg="rgba(255, 255, 255, 0.3)"
          border="none"
          color="white"
          _placeholder={{ color: "whiteAlpha.700" }}
          mb={4}
          required
        />
        <Text textAlign="left" mb={2}>
          Password
        </Text>
        <Box position="relative" mb={4}>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            bg="rgba(255, 255, 255, 0.3)"
            border="none"
            color="white"
            _placeholder={{ color: "whiteAlpha.700" }}
            pr="3rem"
            required
          />
          <Icon
            as={showPassword ? FaRegEyeSlash : FaRegEye}
            onClick={() => setShowPassword(!showPassword)}
            position="absolute"
            right="1rem"
            top="50%"
            transform="translateY(-50%)"
            cursor="pointer"
            color="white"
          />
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={4}
        >
          <NextLink href="/register" passHref legacyBehavior>
            <ChakraLink
              color="blue.300"
              fontWeight="bold"
              _hover={{ color: "blue.500", textDecoration: "underline" }}
              _focus={{ boxShadow: "none" }}
            >
              Don&apos;t have an account?
            </ChakraLink>
          </NextLink>
          <Button
            bg="blue.900"
            color="white"
            _hover={{ bg: "blue.700" }}
            width="60%"
            onClick={login}
            type="submit"
          >
            Sign in
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginModal;
