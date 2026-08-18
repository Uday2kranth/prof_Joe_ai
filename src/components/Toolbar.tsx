"use client";

import {
  MessageSquare,
  GraduationCap,
  BookOpen,
  Sparkles,
  BarChart3,
  Theater,
  Box,
  FlaskConical,
  Binary,
  type LucideIcon
} from "lucide-react";

export interface ToolbarItem {
  id: string;
  title: string;
  icon: LucideIcon;
}

export interface ToolbarProps {
  items?: ToolbarItem[];
  defaultSelected?: string;
  activeId?: string;
  className?: string;
  onSelect?: (itemId: string) => void;
}

export const DEFAULT_NAV_TOOLBAR_ITEMS: ToolbarItem[] = [
  { id: "chat", title: "Chat", icon: MessageSquare },
  { id: "dsa_lab", title: "DSA Lab", icon: Binary },
  { id: "sandbox", title: "Sandbox", icon: FlaskConical },
  { id: "diagrams", title: "Diagrams", icon: BarChart3 },
  { id: "examprep", title: "Exam Prep", icon: GraduationCap },
  { id: "system_prompts", title: "System Prompts", icon: BookOpen },
  { id: "prompts", title: "Prompts", icon: Sparkles },
  { id: "fun_personas", title: "Fun Personas", icon: Theater },
  { id: "cubes", title: "3D Cubes", icon: Box }
];

export function getNavItemsForRole(role?: string): ToolbarItem[] {
  if (role === 'teacher') {
    return [
      { id: "chat", title: "Chat", icon: MessageSquare },
      { id: "dsa_lab", title: "DSA Lab", icon: Binary },
      { id: "sandbox", title: "Sandbox", icon: FlaskConical },
      { id: "diagrams", title: "Diagrams", icon: BarChart3 },
      { id: "lecture_notes", title: "Lecture Notes", icon: BookOpen },
      { id: "examprep", title: "Exam Prep", icon: GraduationCap },
      { id: "system_prompts", title: "System Prompts", icon: BookOpen },
      { id: "prompts", title: "Prompts", icon: Sparkles }
    ];
  }
  if (role === 'admin') {
    return [
      { id: "chat", title: "Chat", icon: MessageSquare },
      { id: "dsa_lab", title: "DSA Lab", icon: Binary },
      { id: "sandbox", title: "Sandbox", icon: FlaskConical },
      { id: "diagrams", title: "Diagrams", icon: BarChart3 },
      { id: "lecture_notes", title: "Lecture Notes", icon: BookOpen },
      { id: "examprep", title: "Exam Prep", icon: GraduationCap },
      { id: "system_prompts", title: "System Prompts", icon: BookOpen },
      { id: "prompts", title: "Prompts", icon: Sparkles },
      { id: "fun_personas", title: "Fun Personas", icon: Theater },
      { id: "cubes", title: "3D Cubes", icon: Box }
    ];
  }
  return DEFAULT_NAV_TOOLBAR_ITEMS;
}

export function Toolbar({
  items = DEFAULT_NAV_TOOLBAR_ITEMS,
  defaultSelected = "chat",
  activeId,
  className = "",
  onSelect
}: ToolbarProps) {
  const selected = activeId !== undefined ? activeId : defaultSelected;

  const handleItemClick = (itemId: string) => {
    onSelect?.(itemId);
  };

  return (
    <div className={`kokonut-toolbar-outer ${className}`}>
      <div className="kokonut-toolbar-container">
        <div className="kokonut-toolbar-inner">
          {items.map((item) => {
            const isSelected = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`kokonut-toolbar-btn ${
                  isSelected ? "kokonut-toolbar-btn-active" : ""
                }`}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                <span className="font-semibold">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
