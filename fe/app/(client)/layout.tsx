import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/client/navbar/navbar";
import { ReactQueryProvider } from "@/react-query-provider";
import { Providers } from "@/app/providers";
import { AuthProvider } from "@/context/auth-context";
import ClientLayout from "@/components/client/ClientLayout";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <Providers
              themeProps={{ attribute: "class", defaultTheme: "light" }}
            >
              <div className="relative flex flex-col h-screen">
                <Navbar />
                <ClientLayout>
                  <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                    {children}
                    <ToastContainer position="top-right" autoClose={3000} />
                  </main>
                </ClientLayout>
                <footer className="w-full flex items-center justify-center py-3">
                  <span className="text-default-600">
                    Powered by <span className="text-primary">HeroUI</span>
                  </span>
                </footer>
              </div>
            </Providers>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
