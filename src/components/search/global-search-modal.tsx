"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckSquare,
  FolderKanban,
  User,
  Activity,
  X,
  Loader2,
  ArrowRight,
  Command,
} from "lucide-react";
import { globalSearch, GroupedSearchResults } from "@/lib/actions/search";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GroupedSearchResults>({
    tasks: [],
    projects: [],
    members: [],
    activities: [],
    totalCount: 0,
  });
  const [isSearching, setIsSearching] = React.useState(false);

  // Debounced search trigger
  React.useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ tasks: [], projects: [], members: [], activities: [], totalCount: 0 });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const res = await globalSearch(query);
      setResults(res);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Global Cmd+K keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger handled by parent or state toggle
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectResult = (link: string) => {
    onClose();
    setQuery("");
    router.push(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-xs">
        {/* Search Input Bar */}
        <div className="p-4 bg-dark-surface border-b border-dark-border flex items-center gap-3">
          <Search className="w-5 h-5 text-metallic-cyan flex-shrink-0" />
          <input
            type="text"
            placeholder="Type to search tasks, projects, members, activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-metallic-steel animate-spin flex-shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-dark-card border border-dark-border text-[10px] text-gray-400 font-mono">
              <Command className="w-3 h-3" /> K
            </kbd>
          )}
        </div>

        {/* Search Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 divide-y divide-dark-border/40">
          {query.trim().length > 0 && query.trim().length < 2 && (
            <div className="text-center py-6 text-gray-400 italic">
              Type at least 2 characters to perform global search...
            </div>
          )}

          {results.totalCount > 0 && (
            <>
              {/* Tasks Section */}
              {results.tasks.length > 0 && (
                <div className="space-y-2 pt-2 first:pt-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-metallic-steel" />
                    <span>Tasks ({results.tasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.link)}
                        className="p-2.5 rounded-xl hover:bg-dark-hover transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-white group-hover:text-metallic-cyan transition-colors block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {item.subtitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-dark-surface border border-dark-border text-gray-300">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {results.projects.length > 0 && (
                <div className="space-y-2 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-metallic-cyan" />
                    <span>Projects ({results.projects.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.projects.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.link)}
                        className="p-2.5 rounded-xl hover:bg-dark-hover transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-white group-hover:text-metallic-cyan transition-colors block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {item.subtitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members Section */}
              {results.members.length > 0 && (
                <div className="space-y-2 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-300" />
                    <span>Team Members ({results.members.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.members.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.link)}
                        className="p-2.5 rounded-xl hover:bg-dark-hover transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-white group-hover:text-metallic-cyan transition-colors block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {item.subtitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 border border-slate-600/40 text-slate-300">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Feed Section */}
              {results.activities.length > 0 && (
                <div className="space-y-2 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Activity Events ({results.activities.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.activities.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.link)}
                        className="p-2.5 rounded-xl hover:bg-dark-hover transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-white group-hover:text-metallic-cyan transition-colors block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {item.subtitle}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {query.trim().length >= 2 && !isSearching && results.totalCount === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Search className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-gray-300">No matching search results</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Try searching for a different task, project, member, or activity event.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-dark-surface border-t border-dark-border flex items-center justify-between text-[10px] text-gray-400">
          <span>Search TeamHub Workspace</span>
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1 bg-dark-card rounded border border-dark-border">Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
