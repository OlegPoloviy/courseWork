"use client";
import { Box, Button, Text, Input, Icon, Link } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { registerUser } from "@/api/registerUser";
import { useState } from "react";

const RegisterModal = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const user = await registerUser(email, name, password);
      console.log("Зареєстрований користувач:", user);
      alert("Registered successfully");
      router.push("/login");
    } catch (err) {
      console.error("Помилка реєстрації:", err);
      alert("Error with registration");
    }
  };

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
          Register
        </Text>

        <Text textAlign={"left"} mb={2}>
          Email
        </Text>
        <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="username@gmail.com"
            type="email"
            bg={"rgba(255, 255, 255, 0.3)"}
            border={"none"}
            color={"white"}
            _placeholder={{ color: "whiteAlpha.700" }}
            mb={4}
        />

        <Text textAlign={"left"} mb={2}>
          Name
        </Text>
        <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            type="text"
            bg={"rgba(255, 255, 255, 0.3)"}
            border={"none"}
            color={"white"}
            _placeholder={{ color: "whiteAlpha.700" }}
            mb={4}
        />

        <Text textAlign={"left"} mb={2}>
          Password
        </Text>
        <Box position="relative" mb={4}>
          <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} mt={4}>
          <Link
              href="/login"
              color="blue.300"
              fontWeight="bold"
              _hover={{ color: "blue.500", textDecoration: "underline" }}
              _focus={{ boxShadow: "none" }}
          >
            Already have an account?
          </Link>
          <Button
              bg={"blue.900"}
              color={"white"}
              _hover={{ bg: "blue.700" }}
              onClick={handleRegister}
              width={"60%"}
          >
            Sign in
          </Button>
        </Box>
      </Box>
  );
};

export default RegisterModal;
