"use client";

import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { ThemeProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      disableTransitionOnChange
      {...props}
    />
  );
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme("dark"); // Always set to dark
  };
  return {
    colorMode: "dark" as ColorMode, // Always return dark
    setColorMode: () => setTheme("dark"), // Always set to dark
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  return dark; // Always return dark value
}

export function ColorModeIcon() {
  return <LuMoon />; // Always show moon icon
}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  Omit<IconButtonProps, "aria-label">
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      variant="ghost"
      aria-label="Toggle color mode"
      size="sm"
      ref={ref}
      {...props}
      css={{
        _icon: {
          width: "5",
          height: "5",
        },
      }}
    >
      <ColorModeIcon />
    </IconButton>
  );
});

const helpers = createMultiStyleConfigHelpers(["container", "button"]);

export const ColorMode = helpers.defineMultiStyleConfig({
  baseStyle: {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "md",
      p: 2,
      _hover: {
        bg: "gray.700",
      },
    },
  },
});
