"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/lib/actions/users";
import { AlertCircle, User, Image as ImageIcon } from "lucide-react";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData | null;
  onProfileUpdated?: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setError(null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await updateUserProfile({
      userId: user.id,
      name: name.trim(),
      bio: bio.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
    });

    setIsLoading(false);

    if (res.success) {
      onClose();
      if (onProfileUpdated) onProfileUpdated();
    } else {
      setError(res.error || "Failed to update profile.");
    }
  };

  if (!user || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Member Profile"
      description="Update your workspace display name, professional bio, or avatar image URL."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Display Name *"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Avatar Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-3 py-2 bg-dark-surface text-gray-100 placeholder-gray-500 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider">
            Professional Bio
          </label>
          <textarea
            rows={3}
            placeholder="Brief bio describing role, domain expertise, or team focus..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2 bg-dark-surface text-gray-100 placeholder-gray-500 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
