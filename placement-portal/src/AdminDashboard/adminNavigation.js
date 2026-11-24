import {
  Activity, Bell, BriefcaseBusiness, ClipboardCheck, FileClock, LayoutDashboard,
  Settings, Users, UserRoundCog, ChartNoAxesCombined,
} from "lucide-react";

export const adminNavigation = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, key: "overview", end: true },
  { label: "Students", path: "/admin/students", icon: Users, key: "students" },
  { label: "Recruiters & Companies", path: "/admin/recruiters", icon: UserRoundCog, key: "recruiters" },
  { label: "Job Management", path: "/admin/jobs", icon: BriefcaseBusiness, key: "jobs" },
  { label: "Applications & Placements", path: "/admin/applications", icon: ClipboardCheck, key: "applications" },
  { label: "Announcements", path: "/admin/announcements", icon: Bell, key: "announcements" },
  { label: "Analytics & Reports", path: "/admin/analytics", icon: ChartNoAxesCombined, key: "analytics" },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: FileClock, key: "auditLogs" },
  { label: "Settings", path: "/admin/settings", icon: Settings, key: "settings" },
];

export const adminModuleDetails = {
  students: { title: "Students", description: "Student directory and profile administration will be added in a later step." },
  recruiters: { title: "Recruiters & Companies", description: "Recruiter accounts and company administration will be added in a later step." },
  jobs: { title: "Job Management", description: "Job review and management workflows will be added in a later step." },
  applications: { title: "Applications & Placements", description: "Application oversight and placement tracking." },
  announcements: { title: "Announcements", description: "Official placement notices and updates." },
  analytics: { title: "Analytics & Reports", description: "Administrative reports will be added in a later step." },
  auditLogs: { title: "Audit Logs", description: "Administrative audit history will be added in a later step." },
  settings: { title: "Settings", description: "Portal-wide administration settings will be added in a later step." },
};
