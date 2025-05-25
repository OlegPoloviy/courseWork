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
  Icon,
  VStack,
  InputGroup,
  InputAddon,
  Image,
} from "@chakra-ui/react";
import { CiSearch, CiImageOn } from "react-icons/ci";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SearchParams } from "@/types/SearchParams";
import toast from "react-hot-toast";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const { data: session, status } = useSession();

  const parseSearchQuery = (query: string): SearchParams => {
    const params: SearchParams = {};

    const parts = query.match(/[^\s"]+|"([^"]*)"/g) || [];

    let hasSpecificParams = false;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].replace(/"/g, "");

      if (part.includes(":") && i < parts.length) {
        hasSpecificParams = true;
        const [key, value] = part.split(":");

        const paramValue = value || parts[i + 1]?.replace(/"/g, "");
        if (!value && parts[i + 1]) i++;

        switch (key.toLowerCase()) {
          case "name":
            params.name = paramValue;
            break;
          case "type":
            params.type = paramValue;
            break;
          case "country":
            params.country = paramValue;
            break;
          case "inservice":
            params.inService = paramValue?.toLowerCase() === "true";
            break;
          case "description":
            params.description = paramValue;
            break;
          case "techspecs":
            params.techSpecs = paramValue;
            break;
        }
      } else {
        if (!params.query) {
          params.query = part;
        } else {
          params.query += " " + part;
        }
      }
    }

    if (!hasSpecificParams && !params.query) {
      params.query = query;
    }

    return params;
  };

  const createSearchUrl = (baseUrl: string, params: SearchParams): string => {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlParams.append(key, value.toString());
      }
    });

    const queryString = urlParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  useEffect(() => {
    if (!session && status != "loading") {
      router.push("/");
    }
  }, [session, router, status]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    const searchParams = parseSearchQuery(searchQuery);

    const hasSearchParams = Object.values(searchParams).some(
      (value) => value !== undefined && value !== ""
    );

    if (!hasSearchParams) {
      toast.error("Could not identify any search parameters");
      return;
    }

    const apiUrl = createSearchUrl("/home/equipmentSearch", searchParams);
    console.log("API URL for fetch:", apiUrl);

    router.push(apiUrl);
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
      formData.append("image", imageFile);

      fetch("http://localhost:3001/ai/search/image", {
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

          if (
            data.status === "success" &&
            data.results &&
            data.results.length > 0
          ) {
            // Get the best match (first result which has highest similarity)
            const bestMatch = data.results[0];

            if (bestMatch.metadata && bestMatch.metadata.militaryEquipment) {
              const equipment = bestMatch.metadata.militaryEquipment;

              // Get equipment IDs from all results to create a more comprehensive search
              const equipmentIds = [];

              // First, add the best match ID
              if (equipment.id) {
                equipmentIds.push(equipment.id);
              }

              // Create a search query that will work well with your backend
              const searchQuery = equipment.name || "";

              // Create search parameters
              const searchParams = new URLSearchParams();

              // Add the primary search query
              if (searchQuery) {
                searchParams.append("query", searchQuery);
              }

              // Add specific fields if available
              if (equipment.name) {
                searchParams.append("name", equipment.name);
              }

              if (equipment.type) {
                searchParams.append("type", equipment.type);
              }

              if (equipment.country) {
                searchParams.append("country", equipment.country);
              }

              // Redirect to the equipment search page with these parameters
              const searchUrl = `/home/equipmentSearch?${searchParams.toString()}`;
              console.log("Redirecting to:", searchUrl);
              router.push(searchUrl);
            } else {
              // No equipment metadata found in the results
              toast.error("Equipment details not found in search results");
              router.push("/home/equipmentSearch");
            }
          } else {
            // No results found
            toast.error("No matching equipment found");
            router.push("/home/equipmentSearch");
          }
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
        bg="gray.900"
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
              Search equipment in our database
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
                    placeholder="Search across all fields or use filters like name:T-72..."
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
                      <Image
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
      <Box py={20} bgColor={"black"} mt={3}>
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
