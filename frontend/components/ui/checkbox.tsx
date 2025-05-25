import {
  Checkbox as ChakraCheckbox,
  CheckboxProps as ChakraCheckboxProps,
} from "@chakra-ui/react";
import * as React from "react";

export interface CheckboxProps extends ChakraCheckboxProps {
  icon?: React.ReactElement;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(props, ref) {
    const { icon, inputProps, ...rest } = props;
    return (
      <ChakraCheckbox ref={ref} {...rest}>
        {icon}
        <input {...inputProps} />
      </ChakraCheckbox>
    );
  }
);
