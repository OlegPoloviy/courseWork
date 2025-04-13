import { Box } from "@chakra-ui/react";
import LoginModal from "@/components/auth/LoginModal";

export default function LoginPage() {
  return (
    <>
      <Box
        display={"flex"}
        height={"95vh"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <LoginModal />
      </Box>
    </>
  );
}
