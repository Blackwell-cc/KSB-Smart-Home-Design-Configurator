"use client";

import { useRouter } from "next/navigation";
import { ConfiguratorShell } from "@/features/configurator/components/configurator-shell";

export default function ConfiguratorPage() {
  const router = useRouter();
  return <ConfiguratorShell onPreview={(href) => router.push(href)} />;
}
