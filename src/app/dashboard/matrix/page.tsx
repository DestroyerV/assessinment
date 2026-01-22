"use client";

import { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Permission {
	id: string;
	name: string;
}

interface Role {
	id: string;
	name: string;
	role_permissions: {
		permission_id: string;
	}[];
}

export default function AccessMatrixPage() {
	const [roles, setRoles] = useState<Role[]>([]);
	const [permissions, setPermissions] = useState<Permission[]>([]);
	const [loading, setLoading] = useState(true);

	
	const fetchData = async () => {
		setLoading(true);
		try {
			const [rolesRes, permsRes] = await Promise.all([
				fetch("/api/roles"),
				fetch("/api/permissions"),
			]);

			if (rolesRes.ok && permsRes.ok) {
				setRoles(await rolesRes.json());
				setPermissions(await permsRes.json());
			}
		} catch (error) {
			toast.error("Failed to fetch matrix data");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchData();
	}, []);

	const toggleAssignment = async (
		roleId: string,
		permissionId: string,
		hasPermission: boolean,
	) => {
		setRoles((prev) =>
			prev.map((r) => {
				if (r.id !== roleId) return r;
				if (hasPermission) {
					return {
						...r,
						role_permissions: r.role_permissions.filter(
							(rp) => rp.permission_id !== permissionId,
						),
					};
				} else {
					return {
						...r,
						role_permissions: [
							...r.role_permissions,
							{ permission_id: permissionId },
						],
					};
				}
			}),
		);

		try {
			if (hasPermission) {
				await fetch(`/api/roles/${roleId}/permissions/${permissionId}`, {
					method: "DELETE",
				});
			} else {
				await fetch(`/api/roles/${roleId}/permissions`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ permissionId }),
				});
			}
		} catch (error) {
			toast.error("Failed to update permission");
			fetchData(); 
		}
	};

	if (loading) return <div>Loading matrix...</div>;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Access Matrix</h2>
				<p className="text-muted-foreground">
					Toggle permissions for each role.
				</p>
			</div>

			<div className="border rounded-md overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[200px] bg-sidebar">
								Role / Permission
							</TableHead>
							{permissions.map((perm) => (
								<TableHead key={perm.id} className="text-center min-w-[120px]">
									<div className="flex flex-col items-center gap-1 py-2">
										<span className="font-mono text-xs">{perm.name}</span>
									</div>
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{roles.map((role) => (
							<TableRow key={role.id}>
								<TableCell className="font-medium b-r sticky left-0 z-10">
									{role.name}
								</TableCell>
								{permissions.map((perm) => {
									const rolePermissions = role.role_permissions || [];
									const hasPermission = rolePermissions.some(
										(rp) => rp.permission_id === perm.id,
									);
									return (
										<TableCell key={perm.id} className="text-center">
											<div className="flex justify-center">
												<Switch
													checked={hasPermission}
													onCheckedChange={() =>
														toggleAssignment(role.id, perm.id, hasPermission)
													}
												/>
											</div>
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
