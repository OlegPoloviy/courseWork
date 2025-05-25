"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import type { ThemeProviderProps } from "next-themes";

interface ProviderProps extends ThemeProviderProps {
  children: React.ReactNode;
}

export function Provider({ children, ...props }: ProviderProps) {
  return (
    <ColorModeProvider {...props}>
      <ChakraProvider>{children}</ChakraProvider>
    </ColorModeProvider>
  );
}
