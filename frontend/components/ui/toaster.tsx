"use client";

import { Portal } from "@chakra-ui/react";
import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <Portal>
      <HotToaster />
    </Portal>
  );
}
