"use client";

import { type Rubric } from '@/lib/services/rubricsService';
import { Button } from './Button';
import { Card } from './Card';

interface RubricCardProps {
  rubric: Rubric;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
  onToggleActive: (id: string) => void;
  className?: string;
}

export function RubricCard({ 
  rubric, 
  onEdit, 
  onDelete, 
  onClone, 
  onToggleActive,
  className = "" 
}: RubricCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalWeight = () => {
    return rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  };

  const getStatusColor = () => {
    if (!rubric.isActive) return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    return 'bg-green-500/20 text-green-400 border border-green-500/30';
  };

  const getTypeColor = () => {
    if (rubric.isTemplate) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  };

  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow bg-gray-800/50 border-gray-700 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {rubric.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {rubric.isActive ? 'Active' : 'Inactive'}
            </span>
            {rubric.isTemplate && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
                Template
              </span>
            )}
          </div>
          
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {rubric.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              📊 <span>{rubric.criteria.length} criteria</span>
            </span>
            <span className="flex items-center gap-1">
              ⚖️ <span>{getTotalWeight()}% total weight</span>
            </span>
            <span className="flex items-center gap-1">
              🏷️ <span>{rubric.category}</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
        <span>Created: {formatDate(rubric.createdAt)}</span>
        <span>Used {rubric.usageCount} times</span>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 text-sm"
          onClick={() => onEdit(rubric.id)}
        >
          ✏️ Edit
        </Button>
        
        <Button 
          variant="outline" 
          className="text-sm"
          onClick={() => onClone(rubric.id)}
        >
          📋 Clone
        </Button>
        
        <Button 
          variant="outline" 
          className={`text-sm ${rubric.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
          onClick={() => onToggleActive(rubric.id)}
        >
          {rubric.isActive ? '⏸️' : '▶️'}
        </Button>
        
        <Button 
          variant="outline" 
          className="text-sm text-red-400 hover:text-red-300 hover:border-red-400"
          onClick={() => onDelete(rubric.id)}
        >
          🗑️
        </Button>
      </div>
      
      {/* Criteria Preview */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Criteria Preview:</h4>
        <div className="space-y-1">
          {rubric.criteria.slice(0, 3).map((criterion) => (
            <div key={criterion.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{criterion.name}</span>
              <span className="text-gray-500">{criterion.weight}%</span>
            </div>
          ))}
          {rubric.criteria.length > 3 && (
            <div className="text-xs text-gray-500">
              +{rubric.criteria.length - 3} more criteria...
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}