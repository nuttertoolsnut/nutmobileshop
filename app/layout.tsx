import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider, App } from 'antd';
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import theme from "@/theme/themeConfig";
import AppLayout from "@/components/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NutMobile Shop - มือถือมือ 1 มือ 2 คุณภาพดี",
  description: "แหล่งรวมโทรศัพท์มือถือและอุปกรณ์เสริม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <ConfigProvider theme={theme}>
            <App>
              <AppLayout>
                {children}
              </AppLayout>
            </App>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}