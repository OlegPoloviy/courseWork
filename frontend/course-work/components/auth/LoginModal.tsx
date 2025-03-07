"use client";
import { Box, Button, Text, Input, Icon, Link } from "@chakra-ui/react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";

const LoginModal = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      width={"400px"}
      p={6}
      borderRadius={"20px"}
      bg={"rgba(255, 255, 255, 0.2)"}
      backdropFilter={"blur(10px)"}
      boxShadow={"lg"}
      color={"white"}
      textAlign={"center"}
    >
      <Text fontSize={"2xl"} fontWeight={"bold"} mb={4}>
        Login
      </Text>

      <Text textAlign={"left"} mb={2}>
        Email
      </Text>
      <Input
        placeholder="username@gmail.com"
        type="email"
        bg={"rgba(255, 255, 255, 0.3)"}
        border={"none"}
        color={"white"}
        _placeholder={{ color: "whiteAlpha.700" }}
        mb={4}
      />

      <Text textAlign={"left"} mb={2}>
        Password
      </Text>
      <Box position="relative">
        <Input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          bg={"rgba(255, 255, 255, 0.3)"}
          border={"none"}
          color={"white"}
          _placeholder={{ color: "whiteAlpha.700" }}
          pr="3rem" 
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

      <Box display={"flex"} justifyContent={"space-between"} mt={4}>
        <Link>Register</Link>
        <Link
          textAlign={"right"}
          mt={2}
          fontSize={"sm"}
          opacity={0.8}
          cursor={"pointer"}
        >
          Forgot Password?
        </Link>
      </Box>

      <Button
        width={"full"}
        mt={6}
        bg={"blue.900"}
        color={"white"}
        _hover={{ bg: "blue.700" }}
      >
        Sign in
      </Button>
    </Box>
  );
};

export default LoginModal;
