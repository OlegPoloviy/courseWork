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
  VStack,
  InputGroup,
  InputAddon,
} from "@chakra-ui/react";
import { CiSearch, CiImageOn } from "react-icons/ci";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session && status != "loading") {
      router.push("/");
    }
  }, [session]);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const handleSearchByImage = () => {
    try {
      if (!imageFile) {
        toast.error("No image selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", imageFile);

      fetch("http://localhost:3001/file", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          toast.success("Image search completed");
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Failed to search by image");
        });
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to process image");
    }
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
          <Stack align="center" textAlign="center" gap={8}>
            <Heading as="h1" size="2xl" fontWeight="bold">
              Military Search System in our database
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Access comprehensive military information, personnel records, and
              operational data through our secure and efficient search platform.
            </Text>

            {/* Text Search */}
            <VStack gap={4} w="full" maxW="xl">
              <InputGroup>
                <>
                  <Input
                    placeholder="Search for military personnel, operations, or records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="white"
                    color="black"
                    _placeholder={{ color: "gray.500" }}
                  />
                  <InputAddon p={0}>
                    <Button
                      colorScheme="blue"
                      onClick={handleSearch}
                      h="full"
                      w="full"
                      borderLeftRadius={0}
                    >
                      <Icon as={CiSearch} boxSize={6} />
                    </Button>
                  </InputAddon>
                </>
              </InputGroup>

              <Box
                w="full"
                p={4}
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                cursor="pointer"
                _hover={{ borderColor: "blue.400" }}
                position="relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                <VStack gap={2}>
                  <Icon as={CiImageOn} boxSize={8} color="gray.400" />
                  <Text>Drag and drop an image or click to upload</Text>
                  {imagePreview && (
                    <Box mt={2}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                      />
                    </Box>
                  )}
                </VStack>
              </Box>
              {imageFile && (
                <Button onClick={handleSearchByImage}>Search by image</Button>
              )}
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="gray.800">
        <Container maxW="container.xl">
          <Stack align="center" gap={12}>
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
          <Stack align="center" gap={12}>
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
                _hover={{ bg: "blue.50" }}
                onClick={() => router.push("/home/equipmentList")}
              >
                Equipment Records
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                variant="outline"
                height="100px"
                _hover={{ bg: "blue.50" }}
              >
                Operations Database
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                variant="outline"
                height="100px"
                _hover={{ bg: "blue.50" }}
              >
                Equipment Inventory
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                variant="outline"
                height="100px"
                _hover={{ bg: "blue.50" }}
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
