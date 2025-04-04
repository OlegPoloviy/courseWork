import { Box, Text, Image } from "@chakra-ui/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const Carousel = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };

    const slides = [
        {
            id: 1,
            image: "https://placehold.co/400x400",
            caption: "Мокап 1 — Опис першого зображення",
        },
        {
            id: 2,
            image: "https://placehold.co/400x400",
            caption: "Мокап 2 — Опис другого зображення",
        },
        {
            id: 3,
            image: "https://placehold.co/400x400",
            caption: "Мокап 3 — Опис третього зображення",
        },
    ];

    return (
        <Box
            width="80%"
            mx="auto"
            mt={8}
            p={4}
            bg="gray.800"
            borderRadius="md"
            boxShadow="lg"
        >
            <Slider {...settings}>
                {slides.map((slide) => (
                    <Box
                        key={slide.id}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        textAlign="center"
                        height="100%"
                        p={4}
                        color="white"
                    >
                        <Image
                            src={slide.image}
                            alt={`Slide ${slide.id}`}
                            mb={4}
                            borderRadius="md"
                            maxW="80%"
                            objectFit="cover"
                        />
                        <Box>
                            <Text>{slide.caption}</Text>
                        </Box>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
};

export default Carousel;