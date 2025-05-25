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
  Container,
  useColorModeValue,
  Card,
  CardBody,
  Grid,
  GridItem,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useEquipmentStore } from "@/app/store/equipmentStore";
import { Equipment } from "@/types/Equipment";
import { use } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaWikipediaW,
  FaExternalLinkAlt,
} from "react-icons/fa";

const EquipmentInfoPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment | undefined>(undefined);
  const [wikipediaUrl, setWikipediaUrl] = useState<string | null>(null);
  const [loadingWiki, setLoadingWiki] = useState(false);

  const { id } = use(params);
  const getEquipmentById = useEquipmentStore((state) => state.getEquipmentById);

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.950");
  const cardBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.500");
  const headerBg = useColorModeValue("gray.50", "gray.800");
  const specBg = useColorModeValue("gray.100", "gray.800");
  const specKeyBg = useColorModeValue("blue.600", "blue.700");
  const badgeBg = useColorModeValue("teal.500", "teal.600");
  const statusBadgeBg = useColorModeValue("green.500", "green.600");
  const statusBadgeBgRed = useColorModeValue("red.500", "red.600");

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
        setWikipediaUrl(`https://en.wikipedia.org/wiki/${pageTitle}`);
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
      <Container maxW="container.xl" py={8}>
        <Card bg={cardBg} shadow="lg" borderRadius="xl">
          <CardBody>
            <Heading as="h2" size="lg" color="gray.300">
              Equipment Not Found
            </Heading>
            <Text mt={4} fontSize="md" color="gray.400">
              No equipment found for ID: {id}
            </Text>
            <Text mt={2} fontSize="sm" color="gray.500">
              This could be because the equipment data hasn&apos;t been loaded
              yet or the equipment with this ID doesn&apos;t exist.
            </Text>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      maxW="container.xl"
      py={{ base: 4, md: 8 }}
      px={{ base: 4, md: 6 }}
      bg={bgColor}
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={{ base: 4, md: 8 }}
      >
        {/* Left Column - Equipment Image */}
        <GridItem>
          <Card
            bg={cardBg}
            shadow="xl"
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <CardBody p={0}>
              {equipment.imageUrl ? (
                <Image
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  w="100%"
                  h={{ base: "300px", md: "500px" }}
                  objectFit="cover"
                />
              ) : (
                <Flex
                  w="full"
                  h={{ base: "300px", md: "500px" }}
                  bg="gray.800"
                  direction="column"
                  align="center"
                  justify="center"
                  color="gray.500"
                  border="2px dashed"
                  borderColor="gray.700"
                >
                  <Text fontSize={{ base: "md", md: "lg" }}>
                    No image provided
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} mt={2}>
                    Equipment visualization unavailable
                  </Text>
                </Flex>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Right Column - Equipment Details */}
        <GridItem>
          <Stack spacing={{ base: 4, md: 6 }}>
            {/* Header Section */}
            <Card
              bg={headerBg}
              shadow="xl"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <Stack spacing={{ base: 3, md: 4 }}>
                  <Flex
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                  >
                    <Heading
                      size={{ base: "lg", md: "xl" }}
                      fontWeight="bold"
                      color={textColor}
                    >
                      {equipment.name}
                    </Heading>
                    <Tooltip label="View on Wikipedia">
                      <Link
                        href={wikipediaUrl || "#"}
                        target="_blank"
                        isExternal
                      >
                        <Button
                          leftIcon={<FaWikipediaW />}
                          rightIcon={<FaExternalLinkAlt />}
                          colorScheme="blue"
                          variant="outline"
                          size={{ base: "xs", md: "sm" }}
                          isLoading={loadingWiki}
                          _hover={{ bg: "blue.900", color: "white" }}
                        >
                          Wikipedia
                        </Button>
                      </Link>
                    </Tooltip>
                  </Flex>

                  <Flex wrap="wrap" gap={2}>
                    <Badge
                      colorScheme="teal"
                      px={{ base: 2, md: 3 }}
                      py={1}
                      borderRadius="full"
                      fontSize={{ base: "xs", md: "sm" }}
                      bg={badgeBg}
                    >
                      {equipment.type}
                    </Badge>
                    {equipment.inService ? (
                      <Badge
                        colorScheme="green"
                        px={{ base: 2, md: 3 }}
                        py={1}
                        borderRadius="full"
                        fontSize={{ base: "xs", md: "sm" }}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        bg={statusBadgeBg}
                      >
                        <Icon
                          as={FaCheckCircle}
                          w={{ base: 3, md: 4 }}
                          h={{ base: 3, md: 4 }}
                        />
                        Currently in service
                      </Badge>
                    ) : (
                      <Badge
                        colorScheme="red"
                        px={{ base: 2, md: 3 }}
                        py={1}
                        borderRadius="full"
                        fontSize={{ base: "xs", md: "sm" }}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        bg={statusBadgeBgRed}
                      >
                        <Icon
                          as={FaTimesCircle}
                          w={{ base: 3, md: 4 }}
                          h={{ base: 3, md: 4 }}
                        />
                        Out of service
                      </Badge>
                    )}
                  </Flex>
                </Stack>
              </CardBody>
            </Card>

            {/* Basic Information */}
            <Card
              bg={cardBg}
              shadow="xl"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <Stack spacing={{ base: 3, md: 4 }}>
                  <Heading size={{ base: "md", md: "lg" }} color={textColor}>
                    Basic Information
                  </Heading>
                  <SimpleGrid
                    columns={{ base: 1, sm: 2 }}
                    spacing={{ base: 3, md: 4 }}
                  >
                    <Box>
                      <Text
                        color={secondaryTextColor}
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        Country of Origin
                      </Text>
                      <Text
                        fontSize={{ base: "sm", md: "md" }}
                        fontWeight="medium"
                        color={textColor}
                      >
                        {equipment.country || "Unknown"}
                      </Text>
                    </Box>
                    {equipment.year && (
                      <Box>
                        <Text
                          color={secondaryTextColor}
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          Manufacture Year
                        </Text>
                        <Flex align="center" gap={1}>
                          <Icon
                            as={FaCalendarAlt}
                            color={secondaryTextColor}
                            w={{ base: 3, md: 4 }}
                            h={{ base: 3, md: 4 }}
                          />
                          <Text
                            fontSize={{ base: "sm", md: "md" }}
                            fontWeight="medium"
                            color={textColor}
                          >
                            {equipment.year}
                          </Text>
                        </Flex>
                      </Box>
                    )}
                  </SimpleGrid>
                </Stack>
              </CardBody>
            </Card>

            {/* Description */}
            <Card
              bg={cardBg}
              shadow="xl"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <Stack spacing={{ base: 3, md: 4 }}>
                  <Heading size={{ base: "md", md: "lg" }} color={textColor}>
                    Description
                  </Heading>
                  <Text
                    color={secondaryTextColor}
                    fontSize={{ base: "sm", md: "md" }}
                    lineHeight="tall"
                  >
                    {equipment.description ||
                      "No description available for this equipment."}
                  </Text>
                </Stack>
              </CardBody>
            </Card>

            {/* Technical Specifications */}
            {equipment.technicalSpecs && (
              <Card
                bg={cardBg}
                shadow="xl"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <CardBody p={{ base: 4, md: 6 }}>
                  <Stack spacing={{ base: 3, md: 4 }}>
                    <Heading size={{ base: "md", md: "lg" }} color={textColor}>
                      Technical Specifications
                    </Heading>
                    <Box
                      bg={specBg}
                      p={{ base: 3, md: 5 }}
                      borderRadius="lg"
                      borderLeft="4px solid"
                      borderColor={specKeyBg}
                    >
                      <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing={{ base: 3, md: 4 }}
                      >
                        {equipment.technicalSpecs
                          .replace(/,/g, ";")
                          .split(";")
                          .map((spec, index) => {
                            if (!spec.trim()) return null;

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
                                p={{ base: 1, md: 2 }}
                              >
                                <Box
                                  bg={specKeyBg}
                                  color="white"
                                  px={{ base: 2, md: 3 }}
                                  py={1}
                                  borderRadius="md"
                                  mr={3}
                                  fontSize={{ base: "xs", md: "sm" }}
                                  fontWeight="medium"
                                  minWidth={{ base: "80px", md: "100px" }}
                                  textAlign="center"
                                >
                                  {key}
                                </Box>
                                <Text
                                  color={textColor}
                                  fontSize={{ base: "sm", md: "md" }}
                                  pt="2px"
                                >
                                  {value}
                                </Text>
                              </Box>
                            );
                          })}
                      </SimpleGrid>
                    </Box>
                  </Stack>
                </CardBody>
              </Card>
            )}
          </Stack>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default EquipmentInfoPage;
