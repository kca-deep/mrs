import { Header } from "@/components/layout/header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  )
}
