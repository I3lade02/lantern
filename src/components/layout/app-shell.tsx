import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NotificationBell } from "@/features/notifications/notification-bell";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-void lg:pl-72">
      <SidebarNav />
      <NotificationBell />

      <div className="flex min-h-screen flex-col">
        <AppHeader />

        <div className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
          {children}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}