"use client";

import { useAuth } from "@/lib/providers/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const [stats, setStats] = useState({
    experiments: 0,
    evaluations: 0,
    avgScore: 0,
    recentActivity: []
  });
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Simulate loading stats
    setStats({
      experiments: 3,
      evaluations: 12,
      avgScore: 0.84,
      recentActivity: [
        { type: "experiment", name: "Q&A Model Test", time: "2 hours ago" },
        { type: "evaluation", name: "Batch Processing Complete", time: "1 day ago" },
        { type: "experiment", name: "Text Generation Eval", time: "3 days ago" }
      ]
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">
            Welcome back, {user.email}! Here&apos;s your evaluation overview.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/experiments/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              + New Experiment
            </Button>
          </Link>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="text-3xl font-bold text-blue-400 mb-2\">{stats.experiments}</div>
          <div className="text-gray-300 text-sm">Total Experiments</div>
        </Card>
        
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="text-3xl font-bold text-green-400 mb-2\">{stats.evaluations}</div>
          <div className="text-gray-300 text-sm">Evaluations Run</div>
        </Card>
        
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="text-3xl font-bold text-purple-400 mb-2\">
            {(stats.avgScore * 100).toFixed(1)}%
          </div>
          <div className="text-gray-300 text-sm">Average Score</div>
        </Card>
        
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="text-3xl font-bold text-yellow-400 mb-2\">2</div>
          <div className="text-gray-300 text-sm">Active Runs</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/experiments" className="block">
              <div className="flex items-center p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-400">📊</span>
                </div>
                <div>
                  <div className="text-white font-medium">View Experiments</div>
                  <div className="text-gray-400 text-sm">Manage your evaluation experiments</div>
                </div>
              </div>
            </Link>
            
            <Link href="/upload" className="block">
              <div className="flex items-center p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-400">📁</span>
                </div>
                <div>
                  <div className="text-white font-medium">Upload Dataset</div>
                  <div className="text-gray-400 text-sm">Upload CSV files for evaluation</div>
                </div>
              </div>
            </Link>
            
            <Link href="/rubrics" className="block">
              <div className="flex items-center p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-400">📋</span>
                </div>
                <div>
                  <div className="text-white font-medium">Manage Rubrics</div>
                  <div className="text-gray-400 text-sm">Create and edit evaluation criteria</div>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === \"experiment\" ? \"bg-blue-400\" : \"bg-green-400\"
                }`}></div>
                <div className="flex-1">
                  <div className="text-white text-sm">{activity.name}</div>
                  <div className="text-gray-400 text-xs">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-600">
            <Link href="/experiments" className="text-blue-400 hover:text-blue-300 text-sm">
              View all activity →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}