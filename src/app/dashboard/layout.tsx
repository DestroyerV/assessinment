import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/login");
	}

	const userData = {
		name: user.email.split("@")[0],
		email: user.email,
		avatar: "",
	};

	return (
		<div className="flex h-screen bg-background">
			<SidebarProvider>
				<AppSidebar user={userData} />

				<main className="flex-1 overflow-y-auto p-4">
					<SidebarTrigger />
					{children}
				</main>
			</SidebarProvider>
		</div>
	);
}
