import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamHub — Work Tracking & Internal Team Platform",
  description: "Lightweight internal team collaboration and work-tracking platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#121418",
          colorInputBackground: "#181b22",
          colorInputText: "#ffffff",
          colorText: "#f3f4f6",
          colorTextSecondary: "#9ca3af",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="bg-dark-bg text-gray-100 antialiased min-h-[100dvh]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
