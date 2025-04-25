"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Heading,
  Spinner,
  Grid,
  Card,
  CardBody,
  Stack,
  Image,
  Badge,
} from "@chakra-ui/react";
import axios from "axios";

interface Equipment {
  id: string;
  name: string;
  type: string;
  country: string;
  inService: boolean;
  description?: string;
  techSpecs?: string;
  year?: number;
  imageUrl?: string;
}

const EquipmentSearchPage = () => {
  const searchParams = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);

        // Створюємо URLSearchParams з параметрів запиту
        const params = new URLSearchParams();

        // Додаємо всі параметри з URL
        if (searchParams.has("query"))
          params.append("query", searchParams.get("query")!);
        if (searchParams.has("name"))
          params.append("name", searchParams.get("name")!);
        if (searchParams.has("type"))
          params.append("type", searchParams.get("type")!);
        if (searchParams.has("country"))
          params.append("country", searchParams.get("country")!);
        if (searchParams.has("description"))
          params.append("description", searchParams.get("description")!);
        if (searchParams.has("techSpecs"))
          params.append("techSpecs", searchParams.get("techSpecs")!);
        if (searchParams.has("inService"))
          params.append("inService", searchParams.get("inService")!);

        // Виконуємо запит на бекенд
        const response = await axios.get(
          `/api/equipment/search?${params.toString()}`
        );

        setEquipment(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching equipment:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch equipment"
        );
        setEquipment([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [searchParams]);

  // Отримуємо пошуковий запит для відображення
  const searchQueryText = () => {
    const query = searchParams.get("query");
    const name = searchParams.get("name");
    const type = searchParams.get("type");
    const country = searchParams.get("country");

    if (query) return `"${query}"`;

    const filters = [];
    if (name) filters.push(`name: ${name}`);
    if (type) filters.push(`type: ${type}`);
    if (country) filters.push(`country: ${country}`);

    return filters.length > 0 ? filters.join(", ") : "all equipment";
  };

  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={6}>
        Search Results
      </Heading>

      <Text fontSize="lg" mb={6}>
        Equipment matching your search for {searchQueryText()}
      </Text>

      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading equipment data...</Text>
        </Box>
      ) : error ? (
        <Box
          p={5}
          bg="red.50"
          borderRadius="md"
          borderLeft="4px"
          borderColor="red.500"
        >
          <Text color="red.500">{error}</Text>
        </Box>
      ) : equipment.length === 0 ? (
        <Box
          p={5}
          bg="blue.50"
          borderRadius="md"
          borderLeft="4px"
          borderColor="blue.500"
        >
          <Text>No equipment found matching your search criteria.</Text>
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {equipment.map((item) => (
            <Card key={item.id} overflow="hidden">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  height="200px"
                  objectFit="cover"
                />
              )}
              <CardBody>
                <Stack>
                  <Heading size="md">{item.name}</Heading>

                  <Box display="flex" gap={2}>
                    <Badge colorScheme="blue">{item.type}</Badge>
                    <Badge colorScheme="green">{item.country}</Badge>
                    <Badge colorScheme={item.inService ? "teal" : "gray"}>
                      {item.inService ? "In Service" : "Not In Service"}
                    </Badge>
                  </Box>

                  {item.description && <Text>{item.description}</Text>}

                  {item.year && (
                    <Text fontSize="sm" color="gray.500">
                      Year: {item.year}
                    </Text>
                  )}
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EquipmentSearchPage;
