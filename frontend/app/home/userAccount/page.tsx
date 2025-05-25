"use client";
import {
  Input,
  Box,
  Text,
  Image,
  FormControl,
  FormLabel,
  Button,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
}

const UserAccount: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>("");

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!session?.user?.email) return;

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
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const profileData: ProfileData = {
        name,
        email,
        avatar: avatar || undefined,
      };

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
        bgColor={"gray.900"}
        gap={10}
      >
        {/* Left: Form */}
        <Box flex="1" display="flex" flexDirection="column" gap={5}>
          <Text fontSize="xl" fontWeight="bold">
            User account settings
          </Text>

          <FormControl>
            <FormLabel>Your name</FormLabel>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Your email</FormLabel>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <Button colorScheme="teal" onClick={handleUpdateProfile}>
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
