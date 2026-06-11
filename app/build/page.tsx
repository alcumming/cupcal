import { Suspense } from "react";
import type { Metadata } from "next";
import Builder from "@/components/Builder";

export const metadata: Metadata = {
  title: "Build your custom World Cup 2026 calendar",
  description:
    "Pick the teams you want to follow and get a personal calendar feed for Google Calendar, Apple Calendar or Outlook. Knockout games appear automatically as your teams qualify.",
};

export default function BuildPage() {
  return (
    <Suspense>
      <Builder />
    </Suspense>
  );
}
