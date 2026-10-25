"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  Settings,
  SlidersHorizontal,
  CheckCircle2,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Download,
  RotateCcw,
  LogOut,
  Layers,
  HelpCircle,
  LucideIcon,
  ChevronRight,
  Wallet,
  Landmark,
  CreditCard,
  CalendarSync,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppSettings, APP_MODULES, AppModuleId, getModuleConfig } from "@/hooks/use-app-settings";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function CommonSettings() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const { defaultModule, setDefaultModule, resetSettings } = useAppSettings();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const [copiedId, setCopiedId] = useState(false);

  const currentModuleConfig = getModuleConfig(defaultModule);

  const handleSelectDefaultModule = (id: AppModuleId) => {
    setDefaultModule(id);
    const selected = APP_MODULES.find((m) => m.id === id);
    toast.success(`Default startup module updated to ${selected?.name || id}`);
  };

  const handleCopyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  const handleInstallPWA = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      toast.info("PWA can be installed via your browser menu ('Add to Home Screen' or 'Install App')");
    }
  };

  const handleResetPreferences = () => {
    resetSettings();
    toast.success("Settings restored to defaults");
  };

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "Authenticated via Clerk";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <SlidersHorizontal className="size-3.5" />
            <span>Workspace Preferences</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure default startup behavior, Clerk account security, appearance, and module shortcuts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPreferences}
            className="h-9 gap-1.5 rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Defaults</span>
          </Button>
        </div>
      </div>

      {/* Quick Overview Hero Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Current Default Module Card */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Startup Module
            </span>
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
              <currentModuleConfig.icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                {currentModuleConfig.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {currentModuleConfig.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Clerk Account Overview Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Clerk Account
            </span>
            <Badge variant="outline" className="h-5 text-[10px] font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              Authenticated
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center">
              <UserButton
                afterSignOutUrl="/"
                userProfileMode="modal"
                appearance={{
                  elements: {
                    avatarBox: "size-10",
                  },
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Theme & System Status Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Theme & App Mode
            </span>
            <Badge variant="outline" className="h-5 capitalize text-[10px] font-bold">
              {theme || "System"}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {theme === "dark" ? (
                <Moon className="size-5 text-indigo-400" />
              ) : theme === "light" ? (
                <Sun className="size-5 text-amber-500" />
              ) : (
                <Laptop className="size-5 text-emerald-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black capitalize text-slate-900 dark:text-white">
                {theme || "system"} Mode
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                PWA: {isInstalled ? "Installed (Standalone)" : "Browser Web App"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="default-module" className="space-y-6">
        <TabsList className="inline-flex h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1.5 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/80 sm:w-auto">
          <TabsTrigger
            value="default-module"
            className="h-9 gap-2 rounded-xl px-4 text-xs font-bold text-slate-600 shadow-none transition-all dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
          >
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Default Startup Module</span>
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="h-9 gap-2 rounded-xl px-4 text-xs font-bold text-slate-600 shadow-none transition-all dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
          >
            <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>Clerk Account & Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="h-9 gap-2 rounded-xl px-4 text-xs font-bold text-slate-600 shadow-none transition-all dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
          >
            <Sun className="size-3.5 text-amber-500" />
            <span>Appearance & Themes</span>
          </TabsTrigger>
          <TabsTrigger
            value="modules"
            className="h-9 gap-2 rounded-xl px-4 text-xs font-bold text-slate-600 shadow-none transition-all dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
          >
            <Layers className="size-3.5 text-violet-500" />
            <span>Module Hub</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: DEFAULT MODULE SELECTION ─────────────────────────── */}
        <TabsContent value="default-module" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-950/60">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                    Default Startup Module
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Pick which tool opens automatically whenever you launch ToolCity, click the app logo, or open the PWA.
                  </CardDescription>
                </div>
                <div className="mt-2 sm:mt-0">
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Active Default: {currentModuleConfig.shortName}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {APP_MODULES.map((module) => {
                  const isSelected = defaultModule === module.id;
                  const Icon = module.icon;

                  return (
                    <div
                      key={module.id}
                      onClick={() => handleSelectDefaultModule(module.id)}
                      className={cn(
                        "group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 hover:shadow-md active:scale-[0.99]",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/40 dark:border-emerald-400 dark:bg-emerald-950/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800/50",
                      )}
                    >
                      {/* Top Bar inside card */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={cn(
                              "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-200 group-hover:scale-105",
                              module.gradient,
                              module.colorClass,
                            )}
                          >
                            <Icon className="size-5" />
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isSelected ? (
                              <Badge className="h-6 gap-1 rounded-full bg-emerald-600 px-2 text-[10px] font-black text-white hover:bg-emerald-600">
                                <CheckCircle2 className="size-3" />
                                <span>Default</span>
                              </Badge>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                {module.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            {module.name}
                          </h3>
                          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {module.tagline}
                          </p>
                          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom action inside card */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60">
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {isSelected ? "Active Startup Tool" : "Click to set default"}
                        </span>
                        <Link
                          href={module.url}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-300"
                        >
                          <span>Launch</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informative Note */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-300">
                <HelpCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    How default module redirection works:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Whenever you navigate to the root workspace (via browser bookmark, PWA icon, or landing page), you will be smoothly directed straight into your selected default module. You can always click &quot;Dashboard&quot; in the sidebar or switch between modules freely.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 2: CLERK ACCOUNT & SECURITY ─────────────────────────── */}
        <TabsContent value="account" className="space-y-4">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Clerk User Profile Card */}
            <Card className="rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-950/60">
              <CardHeader className="p-5 sm:p-6 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Clerk Profile & Authentication</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your personal credentials, linked emails, two-factor auth, and sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5 sm:p-6 pt-0">
                {/* Profile Box */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <UserButton
                      afterSignOutUrl="/"
                      userProfileMode="modal"
                      appearance={{
                        elements: {
                          avatarBox: "size-12",
                          userButtonAvatarBox: "size-12",
                        },
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-900 dark:text-white">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {userEmail}
                      </p>
                      {user?.username && (
                        <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => openUserProfile()}
                    className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-500"
                  >
                    <Settings className="size-3.5" />
                    <span>Manage Account</span>
                  </Button>
                </div>

                {/* Clerk Details List */}
                <div className="space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs dark:border-slate-800/80 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Clerk User ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {user?.id ? `${user.id.slice(0, 16)}...` : "Loading..."}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyUserId}
                        className="size-6 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        title="Copy User ID"
                      >
                        {copiedId ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Account Created</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Session Status</span>
                    <Badge className="h-5 gap-1 rounded-full bg-emerald-600/15 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600/15 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active & Verified
                    </Badge>
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="pt-2">
                  <ConfirmDialog
                    title="Sign Out of ToolCity"
                    description="Are you sure you want to end your active session on this device?"
                    onConfirm={handleSignOut}
                    variant="destructive"
                    confirmText="Sign Out"
                    trigger={
                      <Button
                        variant="outline"
                        className="h-10 w-full gap-2 rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut className="size-4" />
                        <span>Sign Out of Account</span>
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Architecture & Row-Level Security Info */}
            <Card className="rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-950/60">
              <CardHeader className="p-5 sm:p-6 pb-3">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Security Architecture
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  ToolCity is built on enterprise security standards to isolate and safeguard your personal financial data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5 sm:p-6 pt-0 text-xs">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <ShieldCheck className="size-4" />
                    <span>Row Level Security (RLS) Active</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    All tables in Supabase enforce database-level RLS tied to your unique Clerk user token. No other user can read or mutate your transactions, credentials, or portfolio data.
                  </p>
                </div>

                <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Token Exchange</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Clerk JWT to Supabase client</p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Automatic</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Password Manager Encryption</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">AES-GCM client-side vault</p>
                    </div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Zero Knowledge</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Multi-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Configured via Clerk Security</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUserProfile()}
                      className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 3: APPEARANCE & THEMES ──────────────────────────────── */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-950/60">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Display Theme
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Choose how ToolCity looks across all modules and devices.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Light Mode Card */}
                <div
                  onClick={() => setTheme("light")}
                  className={cn(
                    "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border p-5 transition-all",
                    theme === "light"
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50",
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
                    <Sun className="size-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900 dark:text-white">Light Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Crisp daytime clarity</p>
                  </div>
                  {theme === "light" && (
                    <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-[10px] font-bold">
                      Active
                    </Badge>
                  )}
                </div>

                {/* Dark Mode Card */}
                <div
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border p-5 transition-all",
                    theme === "dark"
                      ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50",
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Moon className="size-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sleek obsidian night</p>
                  </div>
                  {theme === "dark" && (
                    <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 text-[10px] font-bold">
                      Active
                    </Badge>
                  )}
                </div>

                {/* System Mode Card */}
                <div
                  onClick={() => setTheme("system")}
                  className={cn(
                    "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border p-5 transition-all",
                    theme === "system"
                      ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50",
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600">
                    <Laptop className="size-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900 dark:text-white">System Sync</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Follow OS settings</p>
                  </div>
                  {theme === "system" && (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[10px] font-bold">
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progressive Web App (PWA) Section */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Install ToolCity Progressive Web App (PWA)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isInstalled
                        ? "ToolCity is currently installed as a standalone app on this device."
                        : "Install to your desktop dock or phone home screen for offline launch and full-screen experience."}
                    </p>
                  </div>

                  {!isInstalled && (
                    <Button
                      size="sm"
                      onClick={handleInstallPWA}
                      className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-500"
                    >
                      <Download className="size-3.5" />
                      <span>Install App</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 4: MODULE HUB & SHORTCUTS ───────────────────────────── */}
        <TabsContent value="modules" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-950/60">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Module Settings & Hub
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Direct shortcuts to module-level configuration, budgets, and vaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Expense Tracker Settings Link */}
                <Link
                  href="/app/expense-tracker/settings"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-500 hover:bg-emerald-500/5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Wallet className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Expense Tracker Settings
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Category budgets & people management
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>

                {/* Password Vault Link */}
                <Link
                  href="/app/passwords"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-500 hover:bg-indigo-500/5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <KeyRound className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Password Vault
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Encrypted credentials & security health
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>

                {/* Credit Cards & Dues Link */}
                <Link
                  href="/app/credit-dues"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-500 hover:bg-violet-500/5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-violet-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <CreditCard className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Credit Cards & Dues
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Credit limits, statements & due reminders
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>

                {/* Recurring Subscriptions Link */}
                <Link
                  href="/app/subscriptions"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-rose-500 hover:bg-rose-500/5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-rose-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <CalendarSync className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Recurring Subscriptions
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Active bills, cycle alerts & spend totals
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
