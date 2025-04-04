"use client";
import { Box, Link, Text, Flex, Button } from "@chakra-ui/react";
import { IUser } from "@/types/UserInterface";
import { useSession } from "next-auth/react";
import React from "react";

interface NavbarProps {
  user?: IUser;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return (
      <Box bg="white" px={4} py={2} borderBottom="1px" borderColor="gray.200">
        <Text fontSize="sm" color="gray.500">
          Please log in for better experience!
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bg="gray.800"
      px={4}
      py={2}
      borderBottom="1px"
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex
        mx="auto"
        width={"100%"}
        alignItems="center"
        justifyContent="space-between"
      >
        <Link
          href="/home"
          fontSize="lg"
          fontWeight="bold"
          _hover={{ textDecoration: "none", color: "blue.500" }}
        >
          Search something in web
        </Link>

        <Flex alignItems="center" gap={4}>
          <Text fontSize="sm" color="gray.600">
            Logged in as {session.user.email}
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={() => {}}
          >
            Sign Out
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
