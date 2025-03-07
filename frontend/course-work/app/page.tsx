"use client";
import { Box } from "@chakra-ui/react";
import LoginModal from "@/components/auth/LoginModal";

export default function Home() {

  return (
    <Box
      position="relative"
      h="100vh"
      // backgroundImage={`url("/images/background.jpg")`}
      backgroundPosition="center"
      backgroundSize="cover"
      backdropFilter="blur(20px)"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <LoginModal />
    </Box>
  );
}
