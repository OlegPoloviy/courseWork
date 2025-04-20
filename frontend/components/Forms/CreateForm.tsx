import { useState, useEffect } from "react";
import { Box, Input, List, ListItem, Field } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";

const CountryAutocompleteInput = ({ value, onChange }) => {
  const countries = [
    "Ukraine",
    "USA",
    "United Kingdom",
    "Germany",
    "France",
    "Israel",
    "Poland",
    "Turkey",
    "Italy",
    "Canada",
    "Spain",
    "Sweden",
    "Norway",
    "Finland",
    "Czech Republic",
    "Slovakia",
    "Belgium",
    "Netherlands",
    "Australia",
    "Japan",
    "South Korea",
    "China",
    "India",
    "Brazil",
    "South Africa",
  ];

  const [inputValue, setInputValue] = useState(value || "");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredCountries([]);
    } else {
      const filtered = countries.filter((country) =>
        country.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    setShowDropdown(true);
  };

  const handleSelectCountry = (country) => {
    setInputValue(country);
    if (onChange) {
      onChange(country);
    }
    setShowDropdown(false);
  };

  return (
    <Box>
      <Box>
        <Field.Root>
          <Field.Label>Enter the name of equipment</Field.Label>
          <Input placeholder="Tiger etc." />
        </Field.Root>
      </Box>
      <Box>
        <Field.Root>
          <Field.Label>Enter the type</Field.Label>
          <Input placeholder="Plane, ship etc." />
        </Field.Root>
      </Box>
      <Box>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Почніть вводити назву країни"
          onFocus={() => inputValue && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />

        {showDropdown && filteredCountries.length > 0 && (
          <List
            position="absolute"
            width="100%"
            bg="white"
            boxShadow="md"
            borderRadius="md"
            maxHeight="200px"
            overflowY="auto"
            zIndex={10}
          >
            {filteredCountries.map((country, index) => (
              <ListItem
                key={index}
                padding="8px 12px"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleSelectCountry(country)}
              >
                {country}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Box>
        <Field.Root>
          <Field.Label>In service</Field.Label>
          <Checkbox size="lg" colorScheme="green" defaultChecked={false} />
        </Field.Root>
      </Box>
    </Box>
  );
};

export default CountryAutocompleteInput;
