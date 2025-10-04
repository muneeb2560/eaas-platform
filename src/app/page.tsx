"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'hero' | 'features' | 'actions' | 'complete'>('hero');

  useEffect(() => {
    const initLoad = async () => {
      // Initial load with staggered animations
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
    };
    initLoad();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setLoadingStage('hero');
      
      // Stage 1: Hero section (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 2: Features (400ms)
      setLoadingStage('features');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Stage 3: Quick actions (300ms)
      setLoadingStage('actions');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stage 4: Complete
      setLoadingStage('complete');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('🔄 Homepage refreshed successfully');
    } catch (error) {
      console.error('Error refreshing homepage:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-6">
          Evaluation as a Service
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Automated AI model evaluation platform with custom rubrics, 
          real-time scoring, and comprehensive analytics.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signin">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 shadow-xl">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="lg" className="border-2 border-blue-500/50 text-blue-300 hover:bg-blue-600/20 hover:border-blue-400 px-8 py-3">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className={`grid md:grid-cols-3 gap-8 mb-16 transition-all duration-700 ${
        isRefreshing && (loadingStage === 'hero' || loadingStage === 'features') 
          ? 'opacity-50 scale-95' 
          : 'opacity-100 scale-100'
      }`}>
        {isRefreshing && loadingStage === 'features' ? (
          // Loading skeleton for features
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`feature-skeleton-${index}`} className="p-6 bg-gray-800/50 border-gray-700 animate-pulse">
              <div className="w-12 h-12 bg-gray-600/50 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-600/50 rounded mb-2"></div>
              <div className="h-4 bg-gray-600/30 rounded mb-1"></div>
              <div className="h-4 bg-gray-600/30 rounded w-3/4"></div>
            </Card>
          ))
        ) : (
          [
            {
              icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: "Custom Rubrics",
              description: "Create detailed evaluation criteria with weighted scoring across multiple dimensions.",
              bgColor: "bg-blue-500/20"
            },
            {
              icon: (
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Automated Processing",
              description: "Fast, parallel evaluation processing with real-time progress tracking.",
              bgColor: "bg-green-500/20"
            },
            {
              icon: (
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Analytics & Trends",
              description: "Comprehensive dashboards with performance trends and model comparisons.",
              bgColor: "bg-purple-500/20"
            }
          ].map((feature, index) => (
            <Card 
              key={index} 
              className={`p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/50 backdrop-blur-sm hover:from-gray-700/60 hover:to-gray-800/60 transition-all duration-500 hover:scale-105 ${
                isRefreshing && loadingStage !== 'complete'
                  ? 'opacity-0 translate-y-4'
                  : 'opacity-100 translate-y-0'
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: !isRefreshing || loadingStage === 'complete'
                  ? `fadeInUp 0.6s ease-out ${index * 200}ms both`
                  : 'none'
              }}
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className={`text-center transition-all duration-700 ${
        isRefreshing && (loadingStage === 'hero' || loadingStage === 'features' || loadingStage === 'actions') 
          ? 'opacity-50 scale-95' 
          : 'opacity-100 scale-100'
      }`}>
        {isRefreshing && loadingStage === 'actions' ? (
          // Loading skeleton for quick actions
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600/50 rounded mb-8 max-w-md mx-auto"></div>
            <div className="flex flex-wrap gap-4 justify-center">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`action-skeleton-${index}`} className="h-10 bg-gray-600/50 rounded w-32"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-white mb-8">Quick Actions</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { href: "/experiments/new", label: "Create Experiment" },
                { href: "/analytics", label: "📊 Analytics & Trends" },
                { href: "/rubrics", label: "Manage Rubrics" },
                { href: "/dashboard", label: "View Dashboard" }
              ].map((action, index) => (
                <div
                  key={action.href}
                  className={`transition-all duration-500 ${
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
                  <Link href={action.href}>
                    <Button variant="outline" className="border-gray-600/50 bg-gray-800/30 hover:bg-gray-700/50 text-gray-200 hover:text-white hover:border-gray-500 transition-all duration-300 hover:scale-105">
                      {action.label}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
