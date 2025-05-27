"use client";

import { Box, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { Equipment } from "@/types/Equipment";
import EquipmentListItem from "@/components/equipment/EquipmentListItem";

const EquipmentSearchContent = () => {
  const searchParams = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!session) {
        console.log("No session available");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();

        // Add the main search query
        const query = searchParams.get("query");
        if (query) {
          params.append("query", query);
        }

        // Add additional filters
        if (searchParams.has("techSpecs")) {
          params.append("techSpecs", searchParams.get("techSpecs")!);
        }

        if (searchParams.has("inService")) {
          params.append("inService", searchParams.get("inService")!);
        }

        if (searchParams.has("id")) {
          params.append("id", searchParams.get("id")!);
        }

        const url = `http://localhost:3001/equipment/search?${params}`;
        console.log("Fetching from URL:", url);
        console.log("With headers:", {
          Authorization: `Bearer ${session?.accessToken}`,
        });

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response:", data);

        if (Array.isArray(data)) {
          setEquipment(data);
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray(data.items)
        ) {
          setEquipment(data.items);
        } else {
          console.error("Unexpected API response format:", data);
          setEquipment([]);
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch equipment"
        );
        setEquipment([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, [searchParams, session]);

  if (status === "loading") {
    return <Text>Loading session...</Text>;
  }

  if (!session) {
    return <Text>Please log in to view equipment</Text>;
  }

  return (
    <Box textAlign="center" p={4}>
      <Text fontSize="2xl" as="h1" mb={4}>
        Equipment List based on your search
      </Text>

      {error && (
        <Text color="red.500" mb={4}>
          Error: {error}
        </Text>
      )}

      {isLoading ? (
        <Text>Loading equipment...</Text>
      ) : equipment.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {equipment.map((el) => (
            <Box key={el.id} p={2}>
              <EquipmentListItem equipment={el} />
            </Box>
          ))}
        </Box>
      ) : (
        <Text>No equipment found</Text>
      )}
    </Box>
  );
};

const EquipmentSearchPage = () => {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <EquipmentSearchContent />
    </Suspense>
  );
};

export default EquipmentSearchPage;
