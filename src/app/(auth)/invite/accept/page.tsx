"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Building2,
  Mail,
  Shield,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { acceptInvitation } from "@/lib/auth/workspace-guard";
import { apiClient } from "@/lib/api/client";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const token = searchParams.get("token") || "";
  const email = (searchParams.get("email") || "").trim();
  const role = searchParams.get("role") || "Catalog Manager";
  const name = searchParams.get("name") || "";
  const department = searchParams.get("department") || "Catalog Operations";

  const [isAccepting, setIsAccepting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isUserMatching = user && user.email && user.email.toLowerCase() === email.toLowerCase();

  const handleAccept = async () => {
    setIsAccepting(true);
    setErrorMessage(null);

    try {
      // 1. Mark accepted locally
      acceptInvitation(email, token);

      // 2. Notify backend
      try {
        await apiClient.post("/auth/invite/accept", {
          email,
          token,
          role,
          name,
        });
      } catch {
        // Fallback gracefully if offline
      }

      setSuccessNotice("Invitation accepted! Connecting you to the Enterprise Workspace...");
      setTimeout(() => {
        if (user) {
          router.push("/dashboard");
        } else {
          router.push(`/login?email=${encodeURIComponent(email)}&invited=true`);
        }
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to process invitation acceptance.");
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#141B2D] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-3 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              <span className="text-[#38BDF8]">Catalog</span>Forge
            </span>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Enterprise Collaboration
            </p>
          </div>
        </div>

        {/* Card Title */}
        <div className="space-y-1.5 border-t border-slate-800/80 pt-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[#38BDF8] text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Invitation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            You&apos;re Invited to Join the Team!
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            {name ? `Hello ${name}, you` : "You"} have been granted access to collaborate in the CatalogForge Enterprise Workspace.
          </p>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-bold flex items-center gap-2 text-left">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 font-bold flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role & Details Box */}
        <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Assigned Role
            </span>
            <span className="font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              {role}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
            </span>
            <span className="font-bold text-slate-200">{department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Invited Email
            </span>
            <span className="font-mono font-bold text-slate-200 truncate max-w-[200px]">{email || "—"}</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="space-y-3 pt-2">
          {user && isUserMatching ? (
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting || !!successNotice}
              className="w-full py-3.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Accepting Invitation...</span>
                </>
              ) : (
                <>
                  <span>Accept Invitation &amp; Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : user && !isUserMatching ? (
            <div className="space-y-2">
              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                You are currently signed in as <strong>{user.email}</strong>. This invitation was sent to <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={handleAccept}
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-2xl transition"
              >
                Accept as {user.email} &amp; Proceed
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAccept}
                disabled={isAccepting || !!successNotice}
                className="w-full py-3.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Accept Invitation &amp; Join Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500">
                Already have an account?{" "}
                <Link href={`/login?email=${encodeURIComponent(email)}`} className="text-[#38BDF8] hover:underline font-bold">
                  Sign In
                </Link>{" "}
                or{" "}
                <Link href={`/signup?email=${encodeURIComponent(email)}`} className="text-[#38BDF8] hover:underline font-bold">
                  Sign Up
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F17]" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
