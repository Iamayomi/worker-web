import { Header } from "@/components/layout/header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
