"use client";
import { Input, Box, Text, Image, Field, Button } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const UserAccount: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!session?.user?.email) return;

        setLoading(true);
        const encodedEmail = encodeURIComponent(session.user.email);
        const response = await fetch(
          `http://localhost:3001/user?email=${encodedEmail}`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const user = await response.json();

        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
          setAvatar(user.avatar || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);

      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/file", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();
        setAvatar(data.url);
      } catch (err) {
        console.error("Error uploading file:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/user/update", {
        method: "POST",
        body: JSON.stringify({ name, email, avatar }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();
      alert("User successfully updated");

      if (data.user) {
        setName(data.user.name || name);
        setEmail(data.user.email || email);
        setAvatar(data.user.avatar || avatar);
      }
    } catch (error) {
      console.error("Error in update function:", error);
      alert("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
    >
      <Box
        width="50%"
        height="fit-content"
        mt="10vh"
        p={6}
        borderWidth="1px"
        borderRadius="2xl"
        boxShadow="lg"
        display="flex"
        justifyContent="space-between"
        gap={10}
      >
        {/* Left: Form */}
        <Box flex="1" display="flex" flexDirection="column" gap={5}>
          <Text fontSize="xl" fontWeight="bold">
            User account settings
          </Text>

          <Field.Root>
            <Field.Label>Your name</Field.Label>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Your email</Field.Label>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field.Root>

          <Button colorScheme="teal" onClick={handleUpdateUser}>
            Confirm changes
          </Button>
        </Box>

        {/* Right: Avatar Upload */}
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={4}
        >
          {avatar ? (
            <Image
              src={avatar}
              alt="Avatar"
              boxSize="220px"
              borderRadius="full"
              objectFit="cover"
              border="2px solid #ccc"
            />
          ) : (
            <Box
              width="220px"
              height="220px"
              border="2px dashed #ccc"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.500"
              fontSize="sm"
              textAlign="center"
              p={2}
            >
              No avatar
            </Box>
          )}

          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            display="none"
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload">
            <Button as="span" variant="outline" size="sm" colorScheme="teal">
              Upload avatar
            </Button>
          </label>
        </Box>
      </Box>
    </Box>
  );
};

export default UserAccount;
