"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, LogOut, ArrowLeft } from "lucide-react";
import { User } from "@/lib/types";

interface AccountMenuProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
}

export function AccountMenu({ user, onLogout, onBack }: AccountMenuProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Account</h1>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-sm">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loading}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loading ? "Signing out..." : "Sign Out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
