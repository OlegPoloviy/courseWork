"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Flex,
  VStack,
  Text,
  Link,
  Image,
  Spinner,
  Badge,
  ButtonGroup,
  useColorMode,
  IconButton,
  Container,
  Heading,
  useColorModeValue,
  Card,
  CardBody,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import { SearchIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useGoogleSearch } from "@/app/hooks/CustomSearchHook";
import toast from "react-hot-toast";

const InternetSearchPage = () => {
  const [query, setQuery] = useState("");
  const [selectedSearchType, setSelectedSearchType] = useState<
    "web" | "images"
  >("web");
  const { colorMode, toggleColorMode } = useColorMode();

  const {
    webResults,
    imageResults,
    loading,
    error,
    searchWeb,
    searchImages,
    loadMoreWeb,
    loadMoreImages,
    clearResults,
  } = useGoogleSearch();

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("blue.500", "blue.400");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const selectedTabBg = useColorModeValue("blue.600", "blue.700");
  const selectedTabBorder = useColorModeValue("white", "gray.100");
  const selectedTabText = useColorModeValue("white", "white");
  const greenColor = useColorModeValue("green.500", "green.400");
  const blueHover = useColorModeValue("blue.600", "blue.500");
  const greenTextColor = useColorModeValue("green.600", "green.400");

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      if (selectedSearchType === "web") {
        await searchWeb(query);
      } else {
        await searchImages(query);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleLoadMore = async () => {
    try {
      if (selectedSearchType === "web") {
        await loadMoreWeb(query);
      } else {
        await loadMoreImages(query);
      }
    } catch (err) {
      toast.error("Failed to load more results");
      console.log(err);
    }
  };

  const handleClear = () => {
    setQuery("");
    clearResults();
  };

  const handleSearchTypeChange = (type: "web" | "images") => {
    setSelectedSearchType(type);
  };

  // Визначаємо поточні результати та показуємо відповідний контент
  const currentResults =
    selectedSearchType === "web" ? webResults : imageResults;
  const hasResults = currentResults?.items && currentResults.items.length > 0;

  return (
    <Box minH="100vh" bg={bgColor} transition="background-color 0.2s">
      <Container maxW="6xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading size="lg" color={textColor}>
              Internet Search
            </Heading>
            <Tooltip
              label={`Switch to ${
                colorMode === "light" ? "dark" : "light"
              } mode`}
            >
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                colorScheme={colorMode === "light" ? "gray" : "yellow"}
              />
            </Tooltip>
          </Flex>

          {/* Search Field */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack gap={4}>
                {/* Search Type Selection */}
                <ButtonGroup
                  size="md"
                  variant="outline"
                  w="full"
                  justifyContent="center"
                >
                  <Button
                    onClick={() => handleSearchTypeChange("web")}
                    colorScheme={selectedSearchType === "web" ? "blue" : "gray"}
                    variant={selectedSearchType === "web" ? "solid" : "outline"}
                    bg={
                      selectedSearchType === "web"
                        ? selectedTabBg
                        : "transparent"
                    }
                    borderColor={
                      selectedSearchType === "web"
                        ? selectedTabBorder
                        : borderColor
                    }
                    borderWidth={selectedSearchType === "web" ? "2px" : "1px"}
                    color={
                      selectedSearchType === "web" ? selectedTabText : textColor
                    }
                    _hover={{
                      bg:
                        selectedSearchType === "web" ? selectedTabBg : hoverBg,
                      borderColor:
                        selectedSearchType === "web"
                          ? selectedTabBorder
                          : borderColor,
                    }}
                  >
                    Web Search
                    {webResults && (
                      <Badge
                        ml={2}
                        colorScheme="blue"
                        bg={
                          selectedSearchType === "web"
                            ? selectedTabBorder
                            : accentColor
                        }
                        color={
                          selectedSearchType === "web" ? selectedTabBg : "white"
                        }
                      >
                        {webResults.items?.length || 0}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSearchTypeChange("images")}
                    colorScheme={
                      selectedSearchType === "images" ? "blue" : "gray"
                    }
                    variant={
                      selectedSearchType === "images" ? "solid" : "outline"
                    }
                    bg={
                      selectedSearchType === "images"
                        ? selectedTabBg
                        : "transparent"
                    }
                    borderColor={
                      selectedSearchType === "images"
                        ? selectedTabBorder
                        : borderColor
                    }
                    borderWidth={
                      selectedSearchType === "images" ? "2px" : "1px"
                    }
                    color={
                      selectedSearchType === "images"
                        ? selectedTabText
                        : textColor
                    }
                    _hover={{
                      bg:
                        selectedSearchType === "images"
                          ? selectedTabBg
                          : hoverBg,
                      borderColor:
                        selectedSearchType === "images"
                          ? selectedTabBorder
                          : borderColor,
                    }}
                  >
                    Image Search
                    {imageResults && (
                      <Badge
                        ml={2}
                        colorScheme="green"
                        bg={
                          selectedSearchType === "images"
                            ? selectedTabBorder
                            : greenColor
                        }
                        color={
                          selectedSearchType === "images"
                            ? selectedTabBg
                            : "white"
                        }
                      >
                        {imageResults.items?.length || 0}
                      </Badge>
                    )}
                  </Button>
                </ButtonGroup>

                {/* Search Input */}
                <Flex gap={2} w="full">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search for ${
                      selectedSearchType === "web" ? "web pages" : "images"
                    }...`}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    size="lg"
                    borderColor={borderColor}
                    bg={bgColor}
                    color={textColor}
                    _placeholder={{ color: secondaryTextColor }}
                    _hover={{ borderColor: accentColor }}
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`,
                    }}
                  />
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    isLoading={loading}
                    colorScheme="blue"
                    bg={accentColor}
                    _hover={{ bg: blueHover }}
                  >
                    <SearchIcon />
                  </Button>
                </Flex>

                {/* Additional Controls */}
                <ButtonGroup
                  size="sm"
                  variant="outline"
                  w="full"
                  justifyContent="center"
                >
                  <Button
                    onClick={handleClear}
                    variant="ghost"
                    isDisabled={!query && !webResults && !imageResults}
                    colorScheme="gray"
                    color={secondaryTextColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Clear
                  </Button>
                </ButtonGroup>
              </VStack>
            </CardBody>
          </Card>

          {/* Errors */}
          {error && (
            <Card bg="red.50" borderColor="red.200" variant="outline">
              <CardBody>
                <Text color="red.600">{error}</Text>
              </CardBody>
            </Card>
          )}

          {/* Results Section */}
          {hasResults && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack gap={6} align="stretch">
                  {/* Search Info */}
                  <HStack justify="space-between" align="center">
                    <Text fontSize="sm" color={secondaryTextColor}>
                      {selectedSearchType === "web" ? "Web" : "Image"} results
                      for &quot;{query}&quot;
                    </Text>
                    <Badge
                      colorScheme={
                        selectedSearchType === "web" ? "blue" : "green"
                      }
                    >
                      {currentResults?.items?.length || 0} results
                    </Badge>
                  </HStack>

                  {/* Web Results */}
                  {selectedSearchType === "web" && webResults?.items && (
                    <VStack gap={4} align="stretch">
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Found approximately{" "}
                        {webResults.searchInformation?.formattedTotalResults}{" "}
                        results in{" "}
                        {webResults.searchInformation?.formattedSearchTime}{" "}
                        seconds
                      </Text>

                      <VStack gap={4} align="stretch">
                        {webResults.items.map((item, index) => (
                          <Card
                            key={index}
                            bg={bgColor}
                            variant="outline"
                            borderColor={borderColor}
                          >
                            <CardBody>
                              <VStack align="start" gap={2}>
                                <Text fontSize="xl" fontWeight="medium">
                                  <Link
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color={accentColor}
                                    _hover={{ textDecoration: "underline" }}
                                  >
                                    {item.title}
                                  </Link>
                                </Text>
                                <Text fontSize="sm" color={greenTextColor}>
                                  {item.displayLink}
                                </Text>
                                <Text color={secondaryTextColor}>
                                  {item.snippet}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>

                      {webResults.queries?.nextPage && (
                        <Button
                          onClick={handleLoadMore}
                          isLoading={loading}
                          colorScheme="gray"
                          variant="outline"
                          mx="auto"
                          borderColor={borderColor}
                          color={textColor}
                          _hover={{ bg: hoverBg }}
                        >
                          Load More Web Results
                        </Button>
                      )}
                    </VStack>
                  )}

                  {/* Image Results */}
                  {selectedSearchType === "images" && imageResults?.items && (
                    <VStack gap={4} align="stretch">
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Found approximately{" "}
                        {imageResults.searchInformation?.formattedTotalResults}{" "}
                        images in{" "}
                        {imageResults.searchInformation?.formattedSearchTime}{" "}
                        seconds
                      </Text>

                      <Box
                        display="grid"
                        gridTemplateColumns={{
                          base: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                          lg: "repeat(4, 1fr)",
                        }}
                        gap={4}
                      >
                        {imageResults.items.map((item, index) => (
                          <Card
                            key={index}
                            overflow="hidden"
                            cursor="pointer"
                            _hover={{ transform: "scale(1.02)" }}
                            transition="transform 0.2s"
                            bg={bgColor}
                            variant="outline"
                            borderColor={borderColor}
                          >
                            <Link
                              href={item.image?.contextLink || item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Box position="relative" h="200px">
                                <Image
                                  src={item.link}
                                  alt={item.title}
                                  w="100%"
                                  h="100%"
                                  objectFit="cover"
                                  loading="lazy"
                                />
                              </Box>
                              <CardBody>
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  maxH="2.5em"
                                  overflow="hidden"
                                  color={textColor}
                                >
                                  {item.title}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  color={secondaryTextColor}
                                  mt={1}
                                >
                                  {item.displayLink}
                                </Text>
                                {item.image?.width && item.image?.height && (
                                  <Text
                                    fontSize="xs"
                                    color={secondaryTextColor}
                                    mt={1}
                                  >
                                    {item.image.width} × {item.image.height}
                                  </Text>
                                )}
                              </CardBody>
                            </Link>
                          </Card>
                        ))}
                      </Box>

                      {imageResults.queries?.nextPage && (
                        <Button
                          onClick={handleLoadMore}
                          isLoading={loading}
                          colorScheme="gray"
                          variant="outline"
                          mx="auto"
                          borderColor={borderColor}
                          color={textColor}
                          _hover={{ bg: hoverBg }}
                        >
                          Load More Images
                        </Button>
                      )}
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* No Results Message */}
          {!loading && !hasResults && (webResults || imageResults) && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Text color={secondaryTextColor} textAlign="center">
                  No {selectedSearchType === "web" ? "web" : "image"} results
                  found for &quot;{query}&quot;
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Loading Indicator */}
          {loading && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack gap={4}>
                  <Spinner size="lg" color={accentColor} />
                  <Text color={secondaryTextColor}>
                    Searching for{" "}
                    {selectedSearchType === "web" ? "web pages" : "images"}...
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default InternetSearchPage;
