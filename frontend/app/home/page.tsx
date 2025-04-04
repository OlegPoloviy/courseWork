'use client';
import { Box, Text, Input, Icon, Image, Button } from '@chakra-ui/react';
import {useRouter} from "next/navigation";
import { FiSearch } from 'react-icons/fi';
import {useSession} from "next-auth/react";
import {useEffect} from "react";
import { MdOutlineImageSearch } from "react-icons/md";
import RecommendedCarousele from "@/components/Recommended/RecommendedCarousele";

const HomePage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("api/auth/signin");
        }
    }, [session, status, router]);

    if (status === "loading") return <p>Loading...</p>;


    return  (
        <Box
            backgroundImage={'url("/images/blackSquares.jpg")'}
            backgroundRepeat="no-repeat"
            backgroundSize="cover"
            backgroundPosition="center"
            height="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            gap={6}
            color="white"
        >
            <Box display="flex" alignItems="center" justifyContent="center" gap={3} mb={4}>
                <Image src="/images/logo.png" boxSize="80px" />
                <Text fontSize="4xl" fontWeight="bold" letterSpacing="wider">
                    Search
                </Text>
            </Box>

            <Text fontSize="xl" mb={4} opacity={0.8}>
                Search everything you need
            </Text>

            <Box
                display="flex"
                alignItems="center"
                backgroundColor="gray.800"
                width="40%"
                padding={3}
                borderRadius="full"
                boxShadow="xl"
                _hover={{ boxShadow: "2xl" }}
            >
                <Icon as={FiSearch} color="gray.400" boxSize={5} mr={2} />
                <Input
                    placeholder="Start your search..."
                    variant="outline"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    flex={1}
                    mr={2}
                />
                <Icon as={MdOutlineImageSearch} color="gray.400" boxSize={5} mr={2} cursor="pointer" _hover={{ color: "gray.300" }} />
                <Button colorScheme="green" size="sm" borderRadius="full">
                    Search
                </Button>
            </Box>

            <Box width="60%" mt={6} height={'45%'}>
                <Text fontSize={'2xl'} textAlign={'center'}>Here you can see our latest military equipment searches</Text>
                <RecommendedCarousele />
            </Box>
        </Box>
    );
};

export default HomePage;