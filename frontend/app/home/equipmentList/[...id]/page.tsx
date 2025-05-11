"use client";
import {
  Text,
  Box,
  Image,
  Badge,
  Flex,
  Stack,
  Icon,
  Heading,
  SimpleGrid,
  Button,
  Link,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useEquipmentStore } from "@/app/store/equipmentStore";
import { Equipment } from "@/types/Equipment";
import { use } from "react";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const EquipmentInfoPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment | undefined>(undefined);
  const [wikipediaUrl, setWikipediaUrl] = useState<string | null>(null);
  const [loadingWiki, setLoadingWiki] = useState(false);

  const { id } = use(params);

  const getEquipmentById = useEquipmentStore((state) => state.getEquipmentById);

  useEffect(() => {
    const item = getEquipmentById(id[0]);
    setEquipment(item);
    setLoading(false);

    console.log("Looking for equipment with ID:", id);
    console.log(
      "All equipment in store:",
      useEquipmentStore.getState().equipment
    );
    console.log("Found equipment:", item);

    if (item) {
      fetchWikipediaUrl(item.name);
    }
  }, [id, getEquipmentById]);

  const fetchWikipediaUrl = async (equipmentName: string) => {
    setLoadingWiki(true);
    try {
      const encodedName = encodeURIComponent(equipmentName);

      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedName}&format=json&origin=*`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.query.search.length > 0) {
        const topResult = data.query.search[0];
        const pageTitle = encodeURIComponent(topResult.title);

        // Generate Wikipedia URL
        const wikipediaPageUrl = `https://en.wikipedia.org/wiki/${pageTitle}`;
        setWikipediaUrl(wikipediaPageUrl);
      } else {
        setWikipediaUrl(null);
      }
    } catch (error) {
      console.error("Error fetching Wikipedia information:", error);
      setWikipediaUrl(null);
    } finally {
      setLoadingWiki(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Text fontSize="lg" color="gray.300">
          Loading equipment details...
        </Text>
      </Flex>
    );
  }

  if (!equipment) {
    return (
      <Box p={8} bg="gray.800" borderRadius="lg" shadow="md">
        <Heading as="h2" size="lg" color="gray.300">
          Not Found
        </Heading>
        <Text mt={4} fontSize="md" color="gray.400">
          No equipment found for ID: {id}
        </Text>
        <Text mt={2} fontSize="sm" color="gray.500">
          This could be because the equipment data hasn{"'"}t been loaded yet or
          the equipment with this ID doesn{"'"}t exist.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6} borderRadius="lg" shadow="md">
      <Flex direction={{ base: "column", md: "row" }} gap={8}>
        {/* Left Side - Equipment Details */}
        <Box flex="1">
          <Stack>
            <Flex justify="space-between" wrap="wrap" align="center">
              <Heading size="xl" fontWeight="bold" color="gray.200">
                {equipment.name}
              </Heading>

              <Link href={wikipediaUrl || "#"} target="_blank">
                <Button
                  colorScheme="blue"
                  size="sm"
                  loadingText="Searching..."
                  variant="outline"
                >
                  Wikipedia
                </Button>
              </Link>
            </Flex>

            <Flex wrap="wrap" gap={2} mt={2}>
              <Badge
                colorScheme="teal"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                {equipment.type}
              </Badge>

              {equipment.inService ? (
                <Badge
                  colorScheme="green"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon as={FaCheckCircle} w={4} h={4} />
                  Currently in service
                </Badge>
              ) : (
                <Badge
                  colorScheme="red"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon as={FaTimesCircle} w={4} h={4} />
                  Out of service
                </Badge>
              )}
            </Flex>

            <SimpleGrid columns={{ base: 1, sm: 2 }} mt={2}>
              <Box>
                <Text color="gray.400" fontSize="sm">
                  Country of Origin
                </Text>
                <Text fontSize="md" fontWeight="medium" color="gray.200">
                  {equipment.country || "Unknown"}
                </Text>
              </Box>

              {equipment.year && (
                <Box>
                  <Text color="gray.400" fontSize="sm">
                    Manufacture Year
                  </Text>
                  <Flex align="center" gap={1}>
                    <Icon as={FaCalendarAlt} color="gray.400" w={4} h={4} />
                    <Text fontSize="md" fontWeight="medium" color="gray.200">
                      {equipment.year}
                    </Text>
                  </Flex>
                </Box>
              )}
            </SimpleGrid>

            {/* Custom Divider using Box */}
            <Box h="1px" bg="gray.700" my={4} />

            <Box>
              <Text fontWeight="medium" mb={2} color="gray.300">
                Description
              </Text>
              <Text color="gray.400" fontSize="md" lineHeight="tall">
                {equipment.description ||
                  "No description available for this equipment."}
              </Text>
            </Box>

            {equipment.technicalSpecs && (
              <Box mt={6}>
                <Text
                  fontWeight="bold"
                  mb={3}
                  color="gray.200"
                  fontSize="lg"
                  borderBottom="2px"
                  borderColor="blue.500"
                  pb={1}
                  display="inline-block"
                >
                  Technical Specifications
                </Text>
                <Box
                  bg="gray.800"
                  p={5}
                  borderRadius="lg"
                  boxShadow="md"
                  borderLeft="4px solid"
                  borderColor="blue.500"
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }}>
                    {equipment.technicalSpecs
                      .replace(/,/g, ";")
                      .split(";")
                      .map((spec, index) => {
                        if (!spec.trim()) return null;

                        // Handle both formats: "key: value" and "key - value"
                        let key, value;
                        if (spec.includes(":")) {
                          [key, value] = spec
                            .split(":")
                            .map((item) => item.trim());
                        } else if (spec.includes("-")) {
                          [key, value] = spec
                            .split("-")
                            .map((item) => item.trim());
                        } else {
                          key = spec.trim();
                          value = "";
                        }

                        if (!key) return null;

                        return (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="flex-start"
                            p={2}
                          >
                            <Box
                              bg="blue.500"
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                              mr={3}
                              fontSize="sm"
                              fontWeight="medium"
                              minWidth="80px"
                              textAlign="center"
                            >
                              {key}
                            </Box>
                            <Text color="gray.300" fontSize="md" pt="2px">
                              {value}
                            </Text>
                          </Box>
                        );
                      })}
                  </SimpleGrid>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Right Side - Equipment Image */}
        <Flex
          flex="1"
          justify="center"
          align="center"
          bg="gray.800"
          borderRadius="lg"
          p={4}
        >
          {equipment.imageUrl ? (
            <Image
              src={equipment.imageUrl}
              alt={equipment.name}
              maxW="100%"
              maxH="400px"
              objectFit="contain"
              borderRadius="md"
              shadow="sm"
            />
          ) : (
            <Flex
              w="full"
              h="400px"
              bg="gray.700"
              borderRadius="md"
              direction="column"
              align="center"
              justify="center"
              color="gray.500"
              border="2px dashed"
              borderColor="gray.600"
            >
              <Text fontSize="lg">No image provided</Text>
              <Text fontSize="sm" mt={2}>
                Equipment visualization unavailable
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default EquipmentInfoPage;
