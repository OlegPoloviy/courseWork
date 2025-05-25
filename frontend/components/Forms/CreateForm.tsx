import {
  Box,
  Input,
  Text,
  FormControl,
  FormLabel,
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
  technicalSpecs: z.string().optional(),
});

const CreateForm = () => {
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [equipmentCountry, setEquipmentCountry] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [inService, setInService] = useState(false);
  const [technicalSpecs, setTechnicalSpecs] = useState("");
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
        technicalSpecs,
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
          technicalSpecs,
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
      setEquipmentCountry("");
      setDescription("");
      setYear(undefined);
      setInService(false);
      setTechnicalSpecs("");
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
      minHeight={{ base: "100vh", md: "99vh" }}
      mt={0}
      bgColor={"gray.900"}
      py={{ base: 4, md: 0 }}
      px={{ base: 4, md: 0 }}
    >
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        textAlign="center"
        mb={{ base: 4, md: 0 }}
      >
        Create a new entry in our database
      </Text>
      <Box
        width="100%"
        maxWidth={{ base: "100%", md: "400px" }}
        mb={{ base: 8, md: 40 }}
      >
        <Box marginBottom={{ base: "16px", md: "20px" }}>
          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Enter the name of equipment
            </FormLabel>
            <Input
              placeholder="Tiger etc."
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              size={{ base: "sm", md: "md" }}
            />
            {errors.equipmentName && (
              <Text color="red.500" fontSize="xs">
                {errors.equipmentName}
              </Text>
            )}
          </FormControl>
        </Box>
        <Box marginBottom={{ base: "16px", md: "20px" }}>
          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Enter the type of equipment
            </FormLabel>
            <Input
              placeholder="Tank etc."
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              size={{ base: "sm", md: "md" }}
            />
            {errors.equipmentType && (
              <Text color="red.500" fontSize="xs">
                {errors.equipmentType}
              </Text>
            )}
          </FormControl>
        </Box>
        <Box>
          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Enter the country of equipment
            </FormLabel>
            <Input
              placeholder="USA etc."
              value={equipmentCountry}
              onChange={(e) => setEquipmentCountry(e.target.value)}
              size={{ base: "sm", md: "md" }}
            />
            {errors.equipmentCountry && (
              <Text color="red.500" fontSize="xs">
                {errors.equipmentCountry}
              </Text>
            )}
          </FormControl>
        </Box>
        <Box marginBottom={{ base: "16px", md: "20px" }} mt={5}>
          <Checkbox
            isChecked={inService}
            onChange={(e) => setInService(e.target.checked)}
            size={{ base: "sm", md: "md" }}
          >
            In service
          </Checkbox>
        </Box>
        <Box marginBottom={{ base: "16px", md: "20px" }}>
          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Enter the description of equipment
            </FormLabel>
            <Textarea
              placeholder="..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size={{ base: "sm", md: "md" }}
              minHeight={{ base: "100px", md: "120px" }}
            />
            {errors.description && (
              <Text color="red.500" fontSize="xs">
                {errors.description}
              </Text>
            )}
          </FormControl>
        </Box>
        <Box marginBottom={{ base: "16px", md: "20px" }}>
          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Enter the technical specifications
            </FormLabel>
            <Textarea
              placeholder="Weight: 73.6 tonnes; Length: 9.77 m; Width: 3.66 m; ..."
              value={technicalSpecs}
              onChange={(e) => setTechnicalSpecs(e.target.value)}
              minHeight={{ base: "100px", md: "120px" }}
              size={{ base: "sm", md: "md" }}
            />
            {errors.technicalSpecs && (
              <Text color="red.500" fontSize="xs">
                {errors.technicalSpecs}
              </Text>
            )}
          </FormControl>
        </Box>
        <Box marginBottom={{ base: "16px", md: "20px" }}>
          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Enter the year
            </FormLabel>
            <Input
              type="number"
              value={year || ""}
              onChange={(e) =>
                setYear(e.target.value ? parseInt(e.target.value) : undefined)
              }
              size={{ base: "sm", md: "md" }}
            />
            {errors.year && (
              <Text color="red.500" fontSize="xs">
                {errors.year}
              </Text>
            )}
          </FormControl>
        </Box>
        {image ? (
          <Image
            src={image}
            alt="Avatar"
            width={{ base: "100%", md: "420px" }}
            boxSize={{ base: "180px", md: "220px" }}
            border="2px solid #ccc"
            marginBottom={{ base: "16px", md: "20px" }}
            objectFit="cover"
          />
        ) : (
          <label htmlFor="avatar-upload">
            <Box
              width="100%"
              height={{ base: "180px", md: "220px" }}
              border="2px dashed #ccc"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.500"
              fontSize={{ base: "xs", md: "sm" }}
              textAlign="center"
              p={2}
              marginBottom={{ base: "16px", md: "20px" }}
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
        <Button
          onClick={handleUploadData}
          colorScheme="teal"
          loadingText="Uploading..."
          width="100%"
          size={{ base: "md", md: "lg" }}
          fontSize={{ base: "sm", md: "md" }}
          isLoading={loading}
        >
          Upload data
        </Button>
      </Box>
    </Box>
  );
};

export default CreateForm;
