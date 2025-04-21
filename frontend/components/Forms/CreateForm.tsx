import {
  Box,
  Input,
  Text,
  Field,
  Checkbox,
  Textarea,
  Image,
  Button,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { z, ZodError } from "zod";

const schema = z.object({
  equipmentName: z.string().min(3, "Name must be at least 3 characters long"),
  equipmentType: z.string().min(3, "Type must be at least 3 characters long"),
  description: z.string(),
  year: z.number().min(1900, "Year must be at least 1900"),
});

const CreateForm = () => {
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [equipmentCountry, setEquipmentCountry] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [inService, setInService] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();

  const handleValidation = async () => {
    try {
      await schema.parseAsync({
        equipmentName,
        equipmentType,
        equipmentCountry,
        description,
        year: year || 0,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(
          error.errors.reduce(
            (acc, err) => ({ ...acc, [err.path[0]]: err.message }),
            {}
          )
        );
      }
      return false;
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("isEquipment", "true");
      formData.append("equipmentName", equipmentName || "unknown-equipment");

      console.log(session?.accessToken);

      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/file", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        const data = await response.json();
        setImage(data.url);
      } catch (err) {
        console.error("Error uploading file:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadData = async () => {
    const isValid = await handleValidation();
    if (!isValid) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/equipment", {
        method: "POST",
        body: JSON.stringify({
          name: equipmentName,
          type: equipmentType,
          country: equipmentCountry,
          description,
          year,
          inService,
          imageUrl: image,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const data = await response.json();
      console.log(data);
      alert("Equipment successfully uploaded");

      setEquipmentName("");
      setEquipmentType("");
      setDescription("");
      setYear(undefined);
      setInService(false);
      setImage(null);
    } catch (error) {
      console.error("Error uploading equipment data:", error);
      alert("Error uploading equipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent={"space-around"}
      alignItems="center"
      flexDirection="column"
      width="100%"
      height={"100%"}
      mt={5}
    >
      <Text fontSize={"xl"}>Create a new entry in our database</Text>
      <Box width="100%" maxWidth="400px" mt={5}>
        <Box marginBottom="20px">
          <Field.Root>
            <Field.Label>Enter the name of equipment</Field.Label>
            <Input
              placeholder="Tiger etc."
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
            />
            {errors.equipmentName && (
              <Text color="red.500" fontSize="sm">
                {errors.equipmentName}
              </Text>
            )}
          </Field.Root>
        </Box>
        <Box marginBottom="20px">
          <Field.Root>
            <Field.Label>Enter the type of equipment</Field.Label>
            <Input
              placeholder="Tank etc."
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
            />
            {errors.equipmentType && (
              <Text color="red.500" fontSize="sm">
                {errors.equipmentType}
              </Text>
            )}
          </Field.Root>
        </Box>
        <Box>
          <Field.Root>
            <Field.Label>Enter the country of equipment</Field.Label>
            <Input
              placeholder="USA etc."
              value={equipmentCountry}
              onChange={(e) => setEquipmentCountry(e.target.value)}
            />
            {errors.equipmentCountry && (
              <Text color="red.500" fontSize="sm">
                {errors.equipmentCountry}
              </Text>
            )}
          </Field.Root>
        </Box>
        <Box marginBottom="20px" mt={5}>
          <Checkbox.Root>
            <Checkbox.HiddenInput
              onChange={(e) => setInService(e.target.checked)}
            />
            <Checkbox.Control />
            <Checkbox.Label>In service</Checkbox.Label>
          </Checkbox.Root>
        </Box>
        <Box marginBottom="20px">
          <Field.Root>
            <Field.Label>Enter the description of equipment</Field.Label>
            <Textarea
              placeholder="..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <Text color="red.500" fontSize="sm">
                {errors.description}
              </Text>
            )}
          </Field.Root>
        </Box>
        <Box marginBottom="20px">
          <Field.Root>
            <Field.Label>Enter the year</Field.Label>
            <Input
              type="number"
              value={year || ""}
              onChange={(e) =>
                setYear(e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
            {errors.year && (
              <Text color="red.500" fontSize="sm">
                {errors.year}
              </Text>
            )}
          </Field.Root>
        </Box>
        {image ? (
          <Image
            src={image}
            alt="Avatar"
            width={"420px"}
            boxSize="220px"
            border="2px solid #ccc"
            marginBottom="20px"
          />
        ) : (
          <label htmlFor="avatar-upload">
            <Box
              width="100%"
              height="220px"
              border="2px dashed #ccc"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.500"
              fontSize="sm"
              textAlign="center"
              p={2}
              marginBottom="20px"
              cursor={"pointer"}
            >
              No image provided
            </Box>
          </label>
        )}

        <Input
          type="file"
          accept="image/*"
          display="none"
          id="avatar-upload"
          onChange={handleImageUpload}
        />
        <Button onClick={handleUploadData} colorScheme="teal">
          Upload data
        </Button>
      </Box>
    </Box>
  );
};

export default CreateForm;
