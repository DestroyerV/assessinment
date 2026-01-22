"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Role {
	id: string;
	name: string;
	description: string;
	_count?: {
		role_permissions: number;
		user_roles: number;
	};
}

export default function RolesPage() {
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newRole, setNewRole] = useState({ name: "", description: "" });

	
	const fetchRoles = async () => {
		try {
			const res = await fetch("/api/roles");
			if (res.ok) {
				const data = await res.json();
				setRoles(data);
			}
		} catch (error) {
			toast.error("Failed to fetch roles");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchRoles();
	}, []);

	const handleCreateRole = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/roles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newRole),
			});

			if (!res.ok) throw new Error("Failed to create role");

			toast.success("Role created");
			setIsCreateOpen(false);
			setNewRole({ name: "", description: "" });
			fetchRoles();
		} catch (error) {
			toast.error("Error creating role");
		}
	};

	const handleDeleteRole = async (id: string) => {
		if (!confirm("Are you sure you want to delete this role?")) return;

		try {
			const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Failed to delete role");

			toast.success("Role deleted");
			fetchRoles();
		} catch (error) {
			toast.error("Error deleting role");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Roles</h2>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>Create Role</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Role</DialogTitle>
							<DialogDescription>
								Define a new role for your application.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreateRole}>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="name" className="text-right">
										Name
									</Label>
									<Input
										id="name"
										value={newRole.name}
										onChange={(e) =>
											setNewRole({ ...newRole, name: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="description" className="text-right">
										Description
									</Label>
									<Input
										id="description"
										value={newRole.description}
										onChange={(e) =>
											setNewRole({ ...newRole, description: e.target.value })
										}
										className="col-span-3"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button type="submit">Create Role</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Permissions</TableHead>
							<TableHead>Users</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{roles.map((role) => (
							<TableRow key={role.id}>
								<TableCell className="font-medium">{role.name}</TableCell>
								<TableCell>{role.description}</TableCell>
								<TableCell>{role._count?.role_permissions || 0}</TableCell>
								<TableCell>{role._count?.user_roles || 0}</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										className="text-red-600 hover:text-red-700 hover:bg-red-50"
										onClick={() => handleDeleteRole(role.id)}
									>
										Delete
									</Button>
								</TableCell>
							</TableRow>
						))}
						{!loading && roles.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center h-24 text-muted-foreground"
								>
									No roles found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
