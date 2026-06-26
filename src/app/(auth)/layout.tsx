import { AuthPageGuard } from "@/features/auth/auth-page-guard";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AuthPageGuard>{children}</AuthPageGuard>
}