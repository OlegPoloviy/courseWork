"use client";
import CreateForm from "@/components/Forms/CreateForm";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminPage = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  return (
    <>
      <CreateForm />
    </>
  );
};

export default AdminPage;
