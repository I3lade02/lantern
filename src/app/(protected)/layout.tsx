import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { AuthGuard } from "@/features/auth/auth-guard";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <AuthenticatedHeader />
            {children}
        </AuthGuard>
    );
}