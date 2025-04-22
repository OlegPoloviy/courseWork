import { Box, Image, Text, Flex, Button, Badge } from "@chakra-ui/react";
import { Equipment } from "@/types/Equipment";

const EquipmentListItem = ({ equipment }: { equipment: Equipment }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      p={3}
      _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
      transition="all 0.2s ease"
      bg="gray.800"
      height="80%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderColor="gray.700"
    >
      <Flex direction="row" mb={2}>
        {/* Image container - 40% width */}
        <Box width="40%" pr={3} position="relative">
          {equipment.imageUrl ? (
            <Image
              src={equipment.imageUrl}
              alt={equipment.name}
              width="80%"
              height="auto"
              minHeight="120px"
              objectFit="cover"
              borderRadius="md"
              fallback={
                <Box
                  width="100%"
                  minHeight="120px"
                  bg="gray.700"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textAlign="center"
                    px={2}
                  >
                    No image
                  </Text>
                </Box>
              }
            />
          ) : (
            <Box
              width="100%"
              minHeight="120px"
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

          {/* Vertical divider */}
          <Box
            position="absolute"
            right="0"
            top="0"
            bottom="0"
            width="1px"
            bg="gray.600"
            height="100%"
          />
        </Box>

        {/* Content container - 60% width */}
        <Box width="60%" textAlign="start" pl={3}>
          <Box mb={2}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="teal.300"
              lineHeight="shorter"
              mb={1}
            >
              {equipment.name}
            </Text>
            <Badge colorScheme="teal" size="sm" bg="teal.800" color="teal.200">
              {equipment.type}
            </Badge>
          </Box>

          <Box mb={2}>
            <Text fontSize="sm" color="gray.400" noOfLines={3}>
              {equipment.description
                ? equipment.description
                : "No description available for this equipment."}
            </Text>
          </Box>

          {equipment.country && (
            <Text fontSize="xs" color="gray.400">
              Location: {equipment.country}
            </Text>
          )}
        </Box>
      </Flex>

      <Box alignSelf="flex-end" mt={1}>
        <Button
          colorScheme="teal"
          size="xs"
          _hover={{ bg: "teal.700" }}
          bg="teal.600"
        >
          Details
        </Button>
      </Box>
    </Box>
  );
};

export default EquipmentListItem;
