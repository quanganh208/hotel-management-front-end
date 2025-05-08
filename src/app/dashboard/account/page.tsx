"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { Loader2, ArrowLeft } from "lucide-react";
import ProfileTab from "@/components/account/profile-tab";
import SecurityTab from "@/components/account/security-tab";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  role: string;
  accountType: string;
  image: string;
  isVerified: boolean;
  phoneNumber?: string;
  gender?: string;
  birthday?: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/users/profile");
        setUserProfile(response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        toast.error("Không thể lấy thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status]);

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      const response = await axiosInstance.patch("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUserProfile(response.data.data);
      toast.success("Cập nhật thông tin thành công");
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Không thể cập nhật thông tin");
      return false;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-8 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tài khoản</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Link>
        </Button>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Mật khẩu & Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            user={session?.user}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
