import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, Settings, Database, Activity } from "lucide-react";

export default async function AdminPage() {
  // Server-side Admin Guard
  const adminUser = await requireAdmin();

  const userCount = await db.user.count();
  const taskCount = await db.task.count();
  const projectCount = await db.project.count();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="metallic-card rounded-2xl p-6 border border-amber-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Management Hub</h1>
            <Badge roleValue="ADMIN" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Server-side authorization enforced. Restricted to Admin workspace owners.
          </p>
        </div>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400">Total Members</span>
              <div className="text-xl font-bold text-white">{userCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Total Tasks</span>
              <div className="text-xl font-bold text-white">{taskCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Total Projects</span>
              <div className="text-xl font-bold text-white">{projectCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-metallic-steel" />
            Workspace Administration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-300">
            As an Admin ({adminUser.email}), you have full control to create/assign tasks, manage projects, and oversee team operations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
