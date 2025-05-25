import {
  Box,
  Image,
  Text,
  Flex,
  Link,
  Badge,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Equipment } from "@/types/Equipment";

const EquipmentListItem = ({ equipment }: { equipment: Equipment }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      p={{ base: 2, md: 3 }}
      _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
      transition="all 0.2s ease"
      bg="gray.900"
      height="80%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderColor="gray.700"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        mb={{ base: 1, md: 2 }}
        gap={{ base: 2, md: 0 }}
      >
        {/* Image container */}
        <Box
          width={{ base: "100%", md: "40%" }}
          pr={{ base: 0, md: 3 }}
          position="relative"
        >
          {equipment.imageUrl ? (
            <Image
              src={equipment.imageUrl}
              alt={equipment.name}
              width={{ base: "100%", md: "80%" }}
              height="auto"
              minHeight={{ base: "200px", md: "120px" }}
              objectFit="cover"
              borderRadius="md"
            />
          ) : (
            <Box
              width="100%"
              minHeight={{ base: "200px", md: "480px" }}
              height={"100%"}
              bg="gray.700"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xs" color="gray.500" textAlign="center" px={2}>
                No image
              </Text>
            </Box>
          )}

          {/* Vertical divider - only show on desktop */}
          {!isMobile && (
            <Box
              position="absolute"
              right="0"
              top="0"
              bottom="0"
              width="1px"
              bg="gray.600"
              height="100%"
            />
          )}
        </Box>

        {/* Content container */}
        <Box
          width={{ base: "100%", md: "60%" }}
          textAlign="start"
          pl={{ base: 0, md: 3 }}
        >
          <Box mb={{ base: 1, md: 2 }}>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              color="teal.300"
              lineHeight="shorter"
              mb={1}
            >
              {equipment.name}
            </Text>
            <Badge
              colorScheme="teal"
              size="sm"
              bg="teal.800"
              color="teal.200"
              fontSize={{ base: "xs", md: "sm" }}
            >
              {equipment.type}
            </Badge>
          </Box>

          <Box mb={{ base: 1, md: 2 }}>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.400"
              noOfLines={{ base: 2, md: 3 }}
            >
              {equipment.description
                ? equipment.description
                : "No description available for this equipment."}
            </Text>
          </Box>

          {equipment.country && (
            <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.400">
              Location: {equipment.country}
            </Text>
          )}
        </Box>
      </Flex>

      <Box
        alignSelf={{ base: "stretch", md: "flex-end" }}
        mt={{ base: 2, md: 1 }}
      >
        <Link
          colorScheme="teal"
          _hover={{ bg: "teal.700", textDecoration: "none" }}
          bg="teal.600"
          href={`/home/equipmentList/${equipment.id}`}
          p={{ base: 1.5, md: 2 }}
          textDecor={"none"}
          display="block"
          textAlign="center"
          fontSize={{ base: "sm", md: "md" }}
          borderRadius="md"
        >
          Details
        </Link>
      </Box>
    </Box>
  );
};

export default EquipmentListItem;
