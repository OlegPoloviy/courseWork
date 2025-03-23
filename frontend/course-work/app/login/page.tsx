import {Box} from "@chakra-ui/react";
import LoginModal from "@/components/auth/LoginModal";

const LoginPage = () => {
    return (
        <Box display={'flex'} alignItems={"center"} justifyContent={'center'} width={'100%'} height={'100vh'}>
            <LoginModal />
        </Box>

    )
}

export default LoginPage