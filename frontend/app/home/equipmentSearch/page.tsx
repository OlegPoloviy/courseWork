"use client";
import { Box, Text } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Equipment } from "@/types/Equipment";
import EquipmentListItem from "@/components/equipment/EquipmentListItem";

const EquipmentSearchPage = () => {
  const searchParams = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchParam, setSearchParam] = useState<URLSearchParams | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (status === "loading" || !session) return;

      setIsLoading(true);
      const params = new URLSearchParams();

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
      if (searchParams.has("id")) params.append("id", searchParams.get("id")!);

      setSearchParam(params);

      try {
        const response = await fetch(
          `http://localhost:3001/equipment/search?${params}`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );

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
        setEquipment([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, [searchParams, session, status]);

  if (status === "loading") {
    return <Text>Loading session...</Text>;
  }

  return (
    <Box textAlign="center" p={4}>
      <Text fontSize="2xl" as="h1" mb={4}>
        Equipment List based on your search
      </Text>

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

export default EquipmentSearchPage;
