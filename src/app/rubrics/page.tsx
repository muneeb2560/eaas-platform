"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RubricCard } from '@/components/ui/RubricCard';
import { 
  rubricsService, 
  type Rubric, 
  type RubricCategory
} from '@/lib/services/rubricsService';

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [filteredRubrics, setFilteredRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'stats' | 'filters' | 'cards' | 'complete'>('stats');
  const [selectedCategory, setSelectedCategory] = useState<RubricCategory | 'All'>('All');
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (RubricCategory | 'All')[] = [
    'All',
    'Q&A Accuracy',
    'Text Generation',
    'Code Generation',
    'Creative Writing',
    'Reasoning',
    'Language Translation',
    'Summarization',
    'Custom'
  ];

  useEffect(() => {
    const loadRubrics = async () => {
      try {
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const loadedRubrics = rubricsService.getRubrics();
        setRubrics(loadedRubrics);
        
        console.log(`📋 Loaded ${loadedRubrics.length} rubrics`);
      } catch (error) {
        console.error('Error loading rubrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRubrics();
  }, []);

  // Filter rubrics based on selected filters
  useEffect(() => {
    let filtered = [...rubrics];

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(rubric => rubric.category === selectedCategory);
    }

    // Templates filter
    if (showTemplatesOnly) {
      filtered = filtered.filter(rubric => rubric.isTemplate);
    }

    // Active filter
    if (showActiveOnly) {
      filtered = filtered.filter(rubric => rubric.isActive);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rubric => 
        rubric.name.toLowerCase().includes(query) ||
        rubric.description.toLowerCase().includes(query) ||
        rubric.category.toLowerCase().includes(query)
      );
    }

    setFilteredRubrics(filtered);
  }, [rubrics, selectedCategory, showTemplatesOnly, showActiveOnly, searchQuery]);

  const refreshRubrics = async () => {
    try {
      setIsRefreshing(true);
      setLoadingStage('stats');
      
      // Stage 1: Load stats (400ms)
      await new Promise(resolve => setTimeout(resolve, 400));
      const updated = rubricsService.getRubrics();
      setRubrics(updated);
      
      // Stage 2: Load filters (300ms)
      setLoadingStage('filters');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stage 3: Load cards (500ms)
      setLoadingStage('cards');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 4: Complete
      setLoadingStage('complete');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('🔄 Refreshed rubrics - loaded', updated.length, 'rubrics');
    } catch (error) {
      console.error('Error refreshing rubrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditRubric = (id: string) => {
    // Navigate to edit page (to be implemented)
    console.log('Edit rubric:', id);
    // TODO: Implement navigation to edit page
  };

  const handleDeleteRubric = async (id: string) => {
    const rubric = rubricsService.getRubric(id);
    if (rubric && confirm(`Are you sure you want to delete "${rubric.name}"?`)) {
      const success = rubricsService.deleteRubric(id);
      if (success) {
        await refreshRubrics();
        console.log('🗑️ Deleted rubric:', rubric.name);
      }
    }
  };

  const handleCloneRubric = async (id: string) => {
    const rubric = rubricsService.getRubric(id);
    if (rubric) {
      const cloned = rubricsService.cloneRubric(id);
      if (cloned) {
        await refreshRubrics();
        console.log('📋 Cloned rubric:', cloned.name);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const rubric = rubricsService.getRubric(id);
    if (rubric) {
      rubricsService.updateRubric(id, { isActive: !rubric.isActive });
      await refreshRubrics();
      console.log(`${rubric.isActive ? '⏸️' : '▶️'} Toggled rubric status:`, rubric.name);
    }
  };

  const handleExportRubrics = () => {
    const data = rubricsService.exportRubrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rubrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatsCards = () => {
    const totalRubrics = rubrics.length;
    const activeRubrics = rubrics.filter(r => r.isActive).length;
    const templateRubrics = rubrics.filter(r => r.isTemplate).length;
    const totalUsage = rubrics.reduce((sum, r) => sum + r.usageCount, 0);

    return [
      { label: 'Total Rubrics', value: totalRubrics, icon: '📋' },
      { label: 'Active', value: activeRubrics, icon: '✅' },
      { label: 'Templates', value: templateRubrics, icon: '📄' },
      { label: 'Total Usage', value: totalUsage, icon: '📊' }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rubrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Development Mode Banner */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-md text-sm">
        <span className="font-medium">📋 Development Mode:</span> Rubrics are stored locally in your browser. 
        <button 
          onClick={async () => {
            if (confirm('This will clear all rubrics. Are you sure?')) {
              rubricsService.clearAll();
              await refreshRubrics();
            }
          }}
          className="underline hover:text-yellow-200 ml-2"
        >
          Clear All Data
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Rubrics</h1>
          <p className="text-gray-300 mt-2">
            Create, edit, and manage evaluation rubrics for your AI model assessments
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/analytics">
            <Button variant="outline">
              📊 Analytics
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportRubrics}>
            💾 Export Rubrics
          </Button>
          <Link href="/rubrics/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              + New Rubric
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(isRefreshing && (loadingStage === 'stats')) ? (
          // Loading skeleton for stats
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="p-4 bg-gray-800/50 border-gray-700 text-center animate-pulse">
              <div className="text-2xl mb-2 opacity-50">📄</div>
              <div className="h-8 bg-gray-600/50 rounded mb-2"></div>
              <div className="h-4 bg-gray-600/30 rounded"></div>
            </Card>
          ))
        ) : (
          getStatsCards().map((stat, index) => (
            <Card 
              key={index} 
              className={`p-4 bg-gray-800/50 border-gray-700 text-center transition-all duration-500 ${
                isRefreshing && loadingStage !== 'complete' 
                  ? 'opacity-0 translate-y-4' 
                  : 'opacity-100 translate-y-0'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: !isRefreshing || loadingStage === 'complete' 
                  ? `fadeInUp 0.6s ease-out ${index * 100}ms both` 
                  : 'none'
              }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </Card>
          ))
        )}
      </div>

      {/* Filters and Search */}
      <Card className={`p-6 bg-gray-800/50 border-gray-700 transition-all duration-700 ${
        isRefreshing && (loadingStage === 'stats' || loadingStage === 'filters') 
          ? 'opacity-50 scale-95' 
          : 'opacity-100 scale-100'
      }`}>
        {isRefreshing && loadingStage === 'filters' ? (
          // Loading skeleton for filters
          <div className="animate-pulse">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-2">
                <div className="h-4 bg-gray-600/50 rounded w-20"></div>
                <div className="h-8 bg-gray-600/50 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-600/50 rounded w-16"></div>
                <div className="h-8 bg-gray-600/50 rounded w-64"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-600/50 rounded w-24"></div>
                <div className="h-4 bg-gray-600/50 rounded w-20"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rubrics..."
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showTemplatesOnly}
                  onChange={(e) => setShowTemplatesOnly(e.target.checked)}
                  className="mr-2 rounded"
                />
                Templates Only
              </label>
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="mr-2 rounded"
                />
                Active Only
              </label>
            </div>

            <div className="ml-auto">
              <Button 
                variant="outline" 
                onClick={refreshRubrics}
                disabled={isRefreshing}
                className="text-sm"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                    {loadingStage === 'stats' && 'Loading stats...'}
                    {loadingStage === 'filters' && 'Loading filters...'}
                    {loadingStage === 'cards' && 'Loading rubrics...'}
                    {loadingStage === 'complete' && 'Finalizing...'}
                  </>
                ) : (
                  '🔄 Refresh'
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredRubrics.length} of {rubrics.length} rubrics
        </div>
      </Card>

      {/* Rubrics Grid */}
      <div className={`transition-all duration-700 ${
        isRefreshing && loadingStage === 'cards' 
          ? 'opacity-50 scale-95' 
          : 'opacity-100 scale-100'
      }`}>
        {isRefreshing && loadingStage === 'cards' ? (
          // Loading skeleton for rubrics grid
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={`card-skeleton-${index}`} className="p-6 bg-gray-800/50 border-gray-700 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-600/50 rounded w-3/4"></div>
                  <div className="h-4 w-4 bg-gray-600/50 rounded"></div>
                </div>
                <div className="h-4 bg-gray-600/30 rounded mb-2"></div>
                <div className="h-4 bg-gray-600/30 rounded mb-4 w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-600/50 rounded w-16"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-600/50 rounded"></div>
                    <div className="h-8 w-8 bg-gray-600/50 rounded"></div>
                    <div className="h-8 w-8 bg-gray-600/50 rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredRubrics.length === 0 ? (
          <Card className="p-12 bg-gray-800/50 border-gray-700 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {rubrics.length === 0 ? 'No rubrics created yet' : 'No rubrics match your filters'}
            </h3>
            <p className="text-gray-400 mb-4">
              {rubrics.length === 0 
                ? 'Create your first evaluation rubric to get started' 
                : 'Try adjusting your search criteria or filters'}
            </p>
            {rubrics.length === 0 && (
              <Link href="/rubrics/new">
                <Button>Create Your First Rubric</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRubrics.map((rubric, index) => (
              <div
                key={rubric.id}
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
                <RubricCard
                  rubric={rubric}
                  onEdit={handleEditRubric}
                  onDelete={handleDeleteRubric}
                  onClone={handleCloneRubric}
                  onToggleActive={handleToggleActive}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}