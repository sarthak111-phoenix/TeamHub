"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { addProjectMember } from "@/lib/actions/projects";
import { AlertCircle, UserPlus } from "lucide-react";

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  existingMemberUserIds: string[];
  members: MemberOption[];
  onMemberAdded?: () => void;
}

export function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  existingMemberUserIds,
  members,
  onMemberAdded,
}: AddMemberModalProps) {
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const availableMembers = members.filter(
    (m) => !existingMemberUserIds.includes(m.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedUserId) {
      setError("Please select a team member.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await addProjectMember({
      projectId,
      userId: selectedUserId,
    });

    setIsLoading(false);

    if (res.success) {
      setSelectedUserId("");
      onClose();
      if (onMemberAdded) onMemberAdded();
    } else {
      setError(res.error || "Failed to add member to project.");
    }
  };

  if (!isOpen || !projectId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member to Project"
      description="Grant a registered workspace member access to project tasks and activities."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5 text-gray-400" /> Select Workspace Member
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
          >
            <option value="">Choose a member...</option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          {availableMembers.length === 0 && (
            <p className="text-[11px] text-gray-400 italic">
              All registered team members are already assigned to this project.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isLoading}
            disabled={!selectedUserId}
          >
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
