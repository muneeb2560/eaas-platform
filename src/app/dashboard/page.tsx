"use client";

import { useAuth } from "@/lib/providers/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/lib/hooks/useToast";
import { useNotifications } from "@/lib/providers/NotificationProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { addNotification } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'stats' | 'actions' | 'activity' | 'complete'>('stats');
  const [stats] = useState({
    experiments: 3,
    evaluations: 12,
    avgScore: 0.84,
    recentActivity: [
      { type: "experiment", name: "Q&A Model Test", time: "2 hours ago" },
      { type: "evaluation", name: "Batch Processing Complete", time: "1 day ago" },
      { type: "experiment", name: "Text Generation Eval", time: "3 days ago" }
    ]
  });
  const router = useRouter();

  // Add welcome notification on first load
  useEffect(() => {
    if (user) {
      addNotification({
        type: 'info',
        title: 'Welcome back!',
        message: `Hello ${user.email}, your dashboard is ready.`,
        action: {
          label: 'View Profile',
          onClick: () => router.push('/profile')
        }
      });
    }
  }, [user, addNotification, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setLoadingStage('stats');
      
      showInfo('Refreshing Dashboard', 'Loading latest data...');
      
      // Stage 1: Stats cards (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 2: Quick actions (400ms)
      setLoadingStage('actions');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Stage 3: Recent activity (300ms)
      setLoadingStage('activity');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stage 4: Complete
      setLoadingStage('complete');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      showSuccess('Dashboard Updated', 'All data has been refreshed successfully.');
      
      // Add notification about the refresh
      addNotification({
        type: 'success',
        title: 'Dashboard Refreshed',
        message: 'All metrics and activity data have been updated.',
      });
      
      console.log('🔄 Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      showError('Refresh Failed', 'Unable to refresh dashboard data. Please try again.');
      
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Dashboard data could not be updated. Check your connection.',
        action: {
          label: 'Retry',
          onClick: () => handleRefresh()
        }
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-gray-300">
              {user.email} • Here&apos;s your evaluation overview.
            </p>
            <div className="text-sm text-gray-400 mt-1">
              {process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-900/20 text-yellow-300 border border-yellow-500/30">
                  🚧 Development Mode
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/20 text-green-300 border border-green-500/30">
                  ✅ Production Mode
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="border-gray-600/50 bg-gray-800/30 hover:bg-gray-700/50 text-gray-200 hover:text-white"
            >
              🔄 Refresh
            </Button>
            <Link href="/experiments/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                + New Experiment
              </Button>
            </Link>
          </div>
        </div>

      <div className={`grid lg:grid-cols-4 gap-6 mb-8 transition-all duration-700 ${
        isRefreshing && loadingStage === 'stats' 
          ? 'opacity-50 scale-95' 
          : 'opacity-100 scale-100'
      }`}>
        {isRefreshing && loadingStage === 'stats' ? (
          // Loading skeleton for stats
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={`stats-skeleton-${index}`} className="p-6 bg-gray-800/50 border-gray-700 animate-pulse">
              <div className="h-8 bg-gray-600/50 rounded mb-2 w-16"></div>
              <div className="h-4 bg-gray-600/30 rounded w-24"></div>
            </Card>
          ))
        ) : (
          [
            {
              value: stats.experiments,
              label: "Total Experiments",
              color: "text-blue-400"
            },
            {
              value: stats.evaluations,
              label: "Evaluations Run",
              color: "text-green-400"
            },
            {
              value: `${(stats.avgScore * 100).toFixed(1)}%`,
              label: "Average Score",
              color: "text-purple-400"
            },
            {
              value: 2,
              label: "Active Runs",
              color: "text-yellow-400"
            }
          ].map((stat, index) => (
            <Card 
              key={index} 
              className={`p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/50 backdrop-blur-sm hover:from-gray-700/60 hover:to-gray-800/60 transition-all duration-500 hover:scale-105 ${
                isRefreshing && loadingStage !== 'complete'
                  ? 'opacity-0 translate-y-4'
                  : 'opacity-100 translate-y-0'
              }`}
              style={{
                animationDelay: `${index * 150}ms`,
                animation: !isRefreshing || loadingStage === 'complete'
                  ? `fadeInUp 0.6s ease-out ${index * 150}ms both`
                  : 'none'
              }}
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className={`p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/50 backdrop-blur-sm transition-all duration-700 ${
          isRefreshing && (loadingStage === 'stats' || loadingStage === 'actions') 
            ? 'opacity-50 scale-95' 
            : 'opacity-100 scale-100'
        }`}>
          {isRefreshing && loadingStage === 'actions' ? (
            // Loading skeleton for quick actions
            <div className="animate-pulse">
              <div className="h-6 bg-gray-600/50 rounded mb-4 w-32"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`action-skeleton-${index}`} className="flex items-center p-3 rounded-lg bg-gray-700/50">
                    <div className="w-10 h-10 bg-gray-600/50 rounded-lg mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-600/50 rounded mb-1 w-32"></div>
                      <div className="h-3 bg-gray-600/30 rounded w-48"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  {
                    href: "/experiments",
                    icon: "📊",
                    iconBg: "bg-blue-500/20",
                    iconColor: "text-blue-400",
                    title: "View Experiments",
                    desc: "Manage your evaluation experiments"
                  },
                  {
                    href: "/upload",
                    icon: "📁",
                    iconBg: "bg-green-500/20",
                    iconColor: "text-green-400",
                    title: "Upload Dataset",
                    desc: "Upload CSV files for evaluation"
                  },
                  {
                    href: "/rubrics",
                    icon: "📋",
                    iconBg: "bg-purple-500/20",
                    iconColor: "text-purple-400",
                    title: "Manage Rubrics",
                    desc: "Create and edit evaluation criteria"
                  }
                ].map((action, index) => (
                  <div
                    key={action.href}
                    className={`transition-all duration-500 ${
                      isRefreshing && loadingStage !== 'complete'
                        ? 'opacity-0 translate-x-4'
                        : 'opacity-100 translate-x-0'
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animation: !isRefreshing || loadingStage === 'complete'
                        ? `slideInLeft 0.6s ease-out ${index * 200}ms both`
                        : 'none'
                    }}
                  >
                    <Link href={action.href} className="block">
                      <div className="flex items-center p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-300 hover:scale-105">
                        <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center mr-3`}>
                          <span className={action.iconColor}>{action.icon}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{action.title}</div>
                          <div className="text-gray-400 text-sm">{action.desc}</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className={`p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/50 backdrop-blur-sm transition-all duration-700 ${
          isRefreshing && (loadingStage === 'stats' || loadingStage === 'actions' || loadingStage === 'activity') 
            ? 'opacity-50 scale-95' 
            : 'opacity-100 scale-100'
        }`}>
          {isRefreshing && loadingStage === 'activity' ? (
            // Loading skeleton for recent activity
            <div className="animate-pulse">
              <div className="h-6 bg-gray-600/50 rounded mb-4 w-36"></div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`activity-skeleton-${index}`} className="flex items-center">
                    <div className="w-2 h-2 bg-gray-600/50 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-600/50 rounded mb-1 w-40"></div>
                      <div className="h-3 bg-gray-600/30 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => {
                  const dotColor = activity.type === "experiment" ? "bg-blue-400" : "bg-green-400";
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center transition-all duration-500 ${
                        isRefreshing && loadingStage !== 'complete'
                          ? 'opacity-0 translate-y-4'
                          : 'opacity-100 translate-y-0'
                      }`}
                      style={{
                        animationDelay: `${index * 150}ms`,
                        animation: !isRefreshing || loadingStage === 'complete'
                          ? `fadeInUp 0.6s ease-out ${index * 150}ms both`
                          : 'none'
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full mr-3 ${dotColor}`}></div>
                      <div className="flex-1">
                        <div className="text-white text-sm">{activity.name}</div>
                        <div className="text-gray-400 text-xs">{activity.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-600">
                <Link href="/experiments" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  View all activity →
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}