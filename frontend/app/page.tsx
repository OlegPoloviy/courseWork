"use client";
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  Stack,
  Grid,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { CiSearch } from "react-icons/ci";
import { useState, forwardRef } from "react";
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg="gray.800"
        color="white"
        py={20}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "rgba(0,0,0,0.5)",
          zIndex: 1,
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={2}>
          <Stack align="center" textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="bold">
              Military Search System
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Access comprehensive military information, personnel records, and
              operational data through our secure and efficient search platform.
            </Text>
            <HStack maxW="xl" w="full">
              <Input
                placeholder="Search for military personnel, operations, or records..."
                size="lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                color="black"
                _placeholder={{ color: "gray.500" }}
              />
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleSearch}
                px={8}
              >
                <Icon as={CiSearch} />
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="gray.800">
        <Container maxW="container.xl">
          <Stack align="center">
            <Heading as="h2" size="xl" textAlign="center">
              Key Features
            </Heading>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={8}
            >
              <Box bg="gray.700" p={6} borderRadius="lg" boxShadow="lg">
                <Stack>
                  <Heading size="md">Advanced Search</Heading>
                  <Text>
                    Utilize powerful search filters and algorithms to find
                    exactly what you need.
                  </Text>
                </Stack>
              </Box>
              <Box bg="gray.700" p={6} borderRadius="lg" boxShadow="lg">
                <Stack>
                  <Heading size="md">Secure Access</Heading>
                  <Text>
                    Enterprise-grade security ensuring your data remains
                    protected at all times.
                  </Text>
                </Stack>
              </Box>
              <Box bg="gray.700" p={6} borderRadius="lg" boxShadow="lg">
                <Stack>
                  <Heading size="md">Real-time Updates</Heading>
                  <Text>
                    Access the most current information with our real-time data
                    synchronization.
                  </Text>
                </Stack>
              </Box>
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Quick Access Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Stack align="center">
            <Heading as="h2" size="xl" textAlign="center">
              Quick Access
            </Heading>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={6}
            >
              <Button
                size="lg"
                colorScheme="blue"
                variant="outline"
                height="100px"
              >
                Personnel Records
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                variant="outline"
                height="100px"
              >
                Operations Database
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                variant="outline"
                height="100px"
              >
                Equipment Inventory
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                variant="outline"
                height="100px"
              >
                Training Records
              </Button>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
