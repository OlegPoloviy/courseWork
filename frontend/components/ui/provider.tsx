"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import type { ThemeProviderProps } from "next-themes";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      },
    },
  },
});

interface ProviderProps extends ThemeProviderProps {
  children: React.ReactNode;
}

export function Provider({ children, ...props }: ProviderProps) {
  return (
    <ColorModeProvider defaultTheme="dark" {...props}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </ColorModeProvider>
  );
}
