"use client";
import { Box, Link, Text, Flex, Button, Image } from "@chakra-ui/react";
import { IUser } from "@/types/UserInterface";
import { useSession, signOut } from "next-auth/react";
import React from "react";

interface NavbarProps {
  user?: IUser;
}

const Navbar: React.FC<NavbarProps> = () => {
  const { data: session, status } = useSession();

  if (status === "loading")
    return (
      <Box
        bg="gray.800"
        px={4}
        py={2}
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Text fontSize="sm" color="gray.500">
          Loading...
        </Text>
      </Box>
    );

  if (!session) {
    return (
      <Box
        bg="gray.800"
        px={4}
        py={2}
        borderBottom="1px"
        borderColor="gray.200"
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Text fontSize="sm" color="gray.500">
          Please log in for better experience!
        </Text>

        <Link href="/">Log in</Link>
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
          Home
        </Link>
        <Link
          href="/home/internetSearch"
          fontSize="lg"
          fontWeight="bold"
          _hover={{ textDecoration: "none", color: "blue.500" }}
        >
          Search something in web
        </Link>

        {session.user?.isAdmin && (
          <Link
            href="/home/admin"
            fontSize="lg"
            fontWeight="bold"
            _hover={{ textDecoration: "none", color: "blue.500" }}
          >
            Create new records in database
          </Link>
        )}

        <Flex alignItems="center" gap={4}>
          <Box display={"flex"} alignItems="center" gap={2}>
            <Image
              src={
                session.user.image || "/Profile_avatar_placeholder_large.png"
              }
              alt="User avatar"
              boxSize="32px"
              borderRadius="full"
              objectFit="cover"
            />
            <Link href="/home/userAccount" fontSize="sm" color="gray.600">
              Logged in as {session.user.email}
            </Link>
          </Box>

          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
