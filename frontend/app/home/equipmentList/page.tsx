"use client";
import { Box, Text, Input } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import EquipmentListItem from "@/components/equipment/EquipmentListItem";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Equipment } from "@/types/Equipment";
import { useEquipmentStore } from "@/app/store/equipmentStore";

const EquipmentList = () => {
  const equipment = useEquipmentStore((state) => state.equipment);
  const setEquipment = useEquipmentStore((state) => state.setEquipment);
  const [filteredEquipment, setFilteredEquipment] = useState<
    Equipment[] | null | undefined
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    console.log("Session:", session);
    const fetchEquipment = () => {
      try {
        setLoading(true);
        fetch("http://localhost:3001/equipment", {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            const equipmentData = Array.isArray(data)
              ? data
              : data?.equipment ?? [];
            setEquipment(equipmentData);
            setFilteredEquipment(equipmentData);
          });
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    if (session) fetchEquipment();
  }, [session]);

  useEffect(() => {
    if (!equipment) return;

    if (searchTerm.trim() === "") {
      setFilteredEquipment(equipment);
    } else {
      const filtered = equipment.filter(
        (item) =>
          item.name &&
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipment(filtered);
    }
  }, [searchTerm, equipment]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  console.log(equipment);

  return (
    <Box textAlign={"center"} p={4}>
      <Box display={"flex"} justifyContent={"space-between"} mb={4}>
        <Text fontSize={"2xl"} as={"h1"}>
          Equipment List
        </Text>
        <Input
          width={"30%"}
          justifySelf={"flex-end"}
          placeholder="Filter by title..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>

      {loading ? (
        <Text>Loading, please wait...</Text>
      ) : filteredEquipment && filteredEquipment.length > 0 ? (
        filteredEquipment.map((el) => (
          <Box key={el.id} p={4}>
            <EquipmentListItem equipment={el} />
          </Box>
        ))
      ) : (
        <Text mt={4}>
          No equipment found matching {'"'}
          {searchTerm}
          {'"'}
        </Text>
      )}
    </Box>
  );
};

export default EquipmentList;
