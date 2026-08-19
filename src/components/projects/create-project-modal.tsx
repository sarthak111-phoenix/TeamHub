"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject } from "@/lib/actions/projects";
import { ProjectStatus } from "@/types";
import { Calendar, Users, AlertCircle } from "lucide-react";

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: MemberOption[];
  onProjectCreated?: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  members,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus>("PLANNING");
  const [startDate, setStartDate] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("PLANNING");
    setStartDate("");
    setTargetDate("");
    setSelectedMemberIds([]);
    setError(null);
  };

  const handleMemberToggle = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await createProject({
      name,
      description,
      status,
      startDate: startDate || null,
      targetDate: targetDate || null,
      memberIds: selectedMemberIds,
    });

    setIsLoading(false);

    if (res.success) {
      resetForm();
      onClose();
      if (onProjectCreated) onProjectCreated();
    } else {
      setError(res.error || "Failed to create project.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Create New Project"
      description="Initialize a project workspace with team members and target milestones."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Project Name *"
          placeholder="e.g. Phoenix Hub Core Infrastructure"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider">
            Description
          </label>
          <textarea
            placeholder="High-level project scope and target deliverables..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-dark-surface text-gray-100 placeholder-gray-500 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider">
            Initial Lifecycle State
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
          >
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" /> Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
            />
          </div>
        </div>

        {/* Member Selector Checklist */}
        <div className="space-y-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-400" /> Project Members ({selectedMemberIds.length})
          </label>
          <div className="max-h-36 overflow-y-auto p-2 bg-dark-surface rounded-lg border border-dark-border space-y-1">
            {members.map((m) => {
              const isChecked = selectedMemberIds.includes(m.id);
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-dark-hover cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMemberToggle(m.id)}
                    className="rounded border-dark-border text-metallic-steel focus:ring-0"
                  />
                  <span className="text-gray-200 font-medium">{m.name}</span>
                  <span className="text-gray-500 text-[10px]">({m.email})</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
