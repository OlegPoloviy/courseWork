"use client";
import { Box, Text, Input } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import EquipmentListItem from "@/components/equipment/EquipmentListItem";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Equipment } from "@/types/Equipment";

const EquipmentList = () => {
  const [equipment, setEquipment] = useState<Equipment[] | null | undefined>(
    []
  );
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
            setEquipment(Array.isArray(data) ? data : data?.equipment ?? []);
          });
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    if (session) fetchEquipment();
  }, [session]);

  return (
    <Box textAlign={"center"} p={4}>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Text fontSize={"2xl"} as={"h1"}>
          Equipment List
        </Text>
        <Input
          width={"30%"}
          justifySelf={"flex-end"}
          placeholder="Enter title..."
        />
      </Box>

      {loading ? (
        <Text>Loading,please wait...</Text>
      ) : (
        equipment &&
        equipment.map((el) => (
          <Box key={el.id} p={4}>
            <EquipmentListItem equipment={el} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default EquipmentList;
