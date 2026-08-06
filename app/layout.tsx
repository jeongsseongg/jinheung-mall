import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AppShell } from "./components/AppShell";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:5173";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: {
      default: "진흥몰 | 진흥조화 직영 주문몰",
      template: "%s | 진흥몰",
    },
    description: "조화를 사용하는 모든 업체를 위한 진흥조화 직영 B2B·B2C 주문몰",
    openGraph: {
      title: "진흥몰",
      description: "조화 주문을 더 쉽고 빠르게",
      images: [{ url: `${origin}/og.png`, width: 1732, height: 909, alt: "진흥몰 조화 주문몰" }],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "진흥몰",
      description: "조화 주문을 더 쉽고 빠르게",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
