import {
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputProps as ChakraNumberInputProps,
} from "@chakra-ui/react";
import * as React from "react";

export const NumberInputRoot = React.forwardRef<
  HTMLDivElement,
  ChakraNumberInputProps
>(function NumberInput(props, ref) {
  const { children, ...rest } = props;
  return (
    <ChakraNumberInput ref={ref} variant="outline" {...rest}>
      {children}
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </ChakraNumberInput>
  );
});

export { NumberInputField };
export const NumberInputScrubber = NumberInputStepper;
export const NumberInputLabel = NumberInputField;
