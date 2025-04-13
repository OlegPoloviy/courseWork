import { Box } from "@chakra-ui/react";
import RegisterModal from "@/components/auth/RegisterModal";

export default function RegisterPage() {
  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      height={"90vh"}
    >
      <RegisterModal />
    </Box>
  );
}
