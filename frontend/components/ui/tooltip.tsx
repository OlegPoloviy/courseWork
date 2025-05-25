import {
  Tooltip as ChakraTooltip,
  TooltipProps as ChakraTooltipProps,
} from "@chakra-ui/react";
import * as React from "react";

export interface TooltipProps extends ChakraTooltipProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  showArrow = false,
  portalled = false,
  portalRef,
  ...rest
}) => {
  return (
    <ChakraTooltip
      hasArrow={showArrow}
      portalProps={portalled ? { containerRef: portalRef } : undefined}
      {...rest}
    >
      {children}
    </ChakraTooltip>
  );
};
