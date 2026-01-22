"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
	const [command, setCommand] = useState("");
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<string[]>([]);

	const handleCommand = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!command.trim()) return;

		setLoading(true);
		setResults([]);

		try {
			const res = await fetch("/api/agent/command", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ command }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Agent failed");
			}

			setResults(data.results || []);
			toast.success("Command executed successfully");
			setCommand("");
		} catch (error: any) {
			if (error.message.includes("GEMINI_API_KEY")) {
				toast.error("Please configure GEMINI_API_KEY in .env");
			} else {
				toast.error(error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
				<h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5" />
							AI Commander (Beta)
						</CardTitle>
						<CardDescription>
							Manage your RBAC system using natural language. Try:{" "}
							<i>"Create an editor role and give it edit:posts permission"</i>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleCommand} className="flex gap-4">
							<Input
								placeholder="Type a command..."
								value={command}
								onChange={(e) => setCommand(e.target.value)}
							/>
							<Button type="submit" disabled={loading}>
								{loading ? "Processing..." : "Execute"}
							</Button>
						</form>
						{results.length > 0 && (
							<div className="mt-4 p-4 rounded-md border border-gray-200 dark:border-gray-700">
								<h4 className="font-semibold mb-2 text-sm text-gray-500 uppercase">
									Execution Results
								</h4>
								<ul className="list-disc list-inside space-y-1 text-sm">
									{results.map((r, i) => (
										<li key={i} className="text-gray-700 dark:text-gray-300">
											{r}
										</li>
									))}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Roles</CardTitle>
							<CardDescription>Manage user roles</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" className="w-full" asChild>
								<a href="/dashboard/roles">Manage Roles</a>
							</Button>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Permissions</CardTitle>
							<CardDescription>Define system capabilities</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" className="w-full" asChild>
								<a href="/dashboard/permissions">Manage Permissions</a>
							</Button>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Access Matrix</CardTitle>
							<CardDescription>Link roles and permissions</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" className="w-full" asChild>
								<a href="/dashboard/matrix">View Matrix</a>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
