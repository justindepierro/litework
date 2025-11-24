"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Display, Body, Label } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ClearAuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("");

  const clearAuth = () => {
    try {
      setStatus("clearing");
      setMessage("Clearing authentication data...");

      // Clear all localStorage
      localStorage.clear();

      // Clear all sessionStorage
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      setStatus("success");
      setMessage("Authentication data cleared successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(
        "Error clearing auth: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-purple-50 p-4">
      <Card
        variant="elevated"
        padding="lg"
        className="max-w-md w-full text-center"
      >
        <Display size="md" className="mb-4">
          Clear Authentication
        </Display>

        <Body variant="secondary" className="mb-6">
          This will clear all authentication data and log you out. You will be
          redirected to the login page.
        </Body>

        {status === "ready" && (
          <Button variant="danger" onClick={clearAuth} className="w-full mb-4">
            Clear Auth Data
          </Button>
        )}

        {status === "clearing" && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <Label>{message}</Label>
          </div>
        )}

        {status === "success" && (
          <div className="mb-4 p-4 bg-success-100 rounded-lg">
            <Label className="text-success-800">{message}</Label>
          </div>
        )}

        {status === "error" && (
          <div className="mb-4 p-4 bg-error-100 rounded-lg">
            <Label className="text-error-800">{message}</Label>
          </div>
        )}

        <Button
          variant="secondary"
          onClick={() => router.push("/login")}
          className="w-full"
        >
          Go to Login
        </Button>
      </Card>
    </div>
  );
}
