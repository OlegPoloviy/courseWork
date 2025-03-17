"use client";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import useUserStore from "@/store/user.store";
import RegisterModal from "@/components/auth/RegisterModal";

export default function Home() {
  const user = useUserStore((state) => state.user);


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
      
      <RegisterModal />
    </Box>
  );
}
