// Rubrics management service for EaaS platform
// Handles creation, storage, and management of evaluation rubrics

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100 percentage
  scale: {
    min: number;
    max: number;
    labels?: { [key: number]: string };
  };
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  category: string;
  criteria: RubricCriterion[];
  isActive: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  createdBy?: string;
}

export type RubricCategory = 
  | 'Q&A Accuracy'
  | 'Text Generation'
  | 'Code Generation'
  | 'Creative Writing'
  | 'Reasoning'
  | 'Language Translation'
  | 'Summarization'
  | 'Custom';

class RubricsService {
  private storageKey = 'eaas_rubrics';

  // Get all rubrics from localStorage
  getRubrics(): Rubric[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        // Initialize with default rubrics
        const defaultRubrics = this.getDefaultRubrics();
        this.saveRubrics(defaultRubrics);
        return defaultRubrics;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading rubrics:', error);
      return this.getDefaultRubrics();
    }
  }

  // Save rubrics to localStorage
  saveRubrics(rubrics: Rubric[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(rubrics));
    } catch (error) {
      console.error('Error saving rubrics:', error);
    }
  }

  // Create a new rubric
  createRubric(data: Omit<Rubric, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Rubric {
    const newRubric: Rubric = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };

    const rubrics = this.getRubrics();
    rubrics.push(newRubric);
    this.saveRubrics(rubrics);
    
    return newRubric;
  }

  // Get a single rubric by ID
  getRubric(id: string): Rubric | null {
    const rubrics = this.getRubrics();
    return rubrics.find(rubric => rubric.id === id) || null;
  }

  // Update an existing rubric
  updateRubric(id: string, updates: Partial<Rubric>): Rubric | null {
    const rubrics = this.getRubrics();
    const index = rubrics.findIndex(rubric => rubric.id === id);
    
    if (index === -1) return null;
    
    rubrics[index] = {
      ...rubrics[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveRubrics(rubrics);
    return rubrics[index];
  }

  // Delete a rubric
  deleteRubric(id: string): boolean {
    const rubrics = this.getRubrics();
    const filtered = rubrics.filter(rubric => rubric.id !== id);
    
    if (filtered.length === rubrics.length) return false;
    
    this.saveRubrics(filtered);
    return true;
  }

  // Clone a rubric (useful for creating templates)
  cloneRubric(id: string, newName?: string): Rubric | null {
    const original = this.getRubric(id);
    if (!original) return null;

    const cloned = {
      ...original,
      name: newName || `${original.name} (Copy)`,
      isTemplate: false,
      usageCount: 0
    };

    return this.createRubric(cloned);
  }

  // Get rubrics by category
  getRubricsByCategory(category: RubricCategory): Rubric[] {
    return this.getRubrics().filter(rubric => rubric.category === category);
  }

  // Get template rubrics
  getTemplateRubrics(): Rubric[] {
    return this.getRubrics().filter(rubric => rubric.isTemplate);
  }

  // Get active rubrics
  getActiveRubrics(): Rubric[] {
    return this.getRubrics().filter(rubric => rubric.isActive);
  }

  // Increment usage count
  incrementUsage(id: string): void {
    const rubric = this.getRubric(id);
    if (rubric) {
      this.updateRubric(id, {
        usageCount: rubric.usageCount + 1
      });
    }
  }

  // Generate a unique ID
  private generateId(): string {
    return 'rubric_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get default rubrics for initial setup
  private getDefaultRubrics(): Rubric[] {
    return [
      {
        id: 'rubric_qa_accuracy',
        name: 'Q&A Accuracy Rubric',
        description: 'Comprehensive evaluation rubric for question-answering accuracy and relevance',
        category: 'Q&A Accuracy',
        isActive: true,
        isTemplate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 15,
        criteria: [
          {
            id: 'accuracy',
            name: 'Factual Accuracy',
            description: 'How factually correct is the answer?',
            weight: 40,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Completely incorrect',
                2: 'Mostly incorrect',
                3: 'Partially correct',
                4: 'Mostly correct',
                5: 'Completely correct'
              }
            }
          },
          {
            id: 'relevance',
            name: 'Relevance',
            description: 'How well does the answer address the question?',
            weight: 30,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Not relevant',
                2: 'Slightly relevant',
                3: 'Moderately relevant',
                4: 'Highly relevant',
                5: 'Perfectly relevant'
              }
            }
          },
          {
            id: 'completeness',
            name: 'Completeness',
            description: 'Does the answer fully address all aspects of the question?',
            weight: 20,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Incomplete',
                2: 'Mostly incomplete',
                3: 'Partially complete',
                4: 'Mostly complete',
                5: 'Fully complete'
              }
            }
          },
          {
            id: 'clarity',
            name: 'Clarity',
            description: 'How clear and understandable is the answer?',
            weight: 10,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Very unclear',
                2: 'Unclear',
                3: 'Somewhat clear',
                4: 'Clear',
                5: 'Very clear'
              }
            }
          }
        ]
      },
      {
        id: 'rubric_text_generation',
        name: 'Text Generation Quality',
        description: 'Evaluation rubric for text generation coherence, creativity, and quality',
        category: 'Text Generation',
        isActive: true,
        isTemplate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 8,
        criteria: [
          {
            id: 'coherence',
            name: 'Coherence',
            description: 'How well does the text flow and make logical sense?',
            weight: 35,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Incoherent',
                2: 'Poor coherence',
                3: 'Moderate coherence',
                4: 'Good coherence',
                5: 'Excellent coherence'
              }
            }
          },
          {
            id: 'creativity',
            name: 'Creativity',
            description: 'How original and creative is the generated text?',
            weight: 25,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Not creative',
                2: 'Slightly creative',
                3: 'Moderately creative',
                4: 'Very creative',
                5: 'Highly creative'
              }
            }
          },
          {
            id: 'grammar',
            name: 'Grammar & Style',
            description: 'How correct is the grammar and writing style?',
            weight: 25,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Poor grammar',
                2: 'Below average',
                3: 'Average',
                4: 'Good grammar',
                5: 'Excellent grammar'
              }
            }
          },
          {
            id: 'engagement',
            name: 'Engagement',
            description: 'How engaging and interesting is the text?',
            weight: 15,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Not engaging',
                2: 'Slightly engaging',
                3: 'Moderately engaging',
                4: 'Very engaging',
                5: 'Highly engaging'
              }
            }
          }
        ]
      },
      {
        id: 'rubric_code_generation',
        name: 'Code Generation Assessment',
        description: 'Evaluation rubric for code generation quality, functionality, and best practices',
        category: 'Code Generation',
        isActive: true,
        isTemplate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 12,
        criteria: [
          {
            id: 'functionality',
            name: 'Functionality',
            description: 'Does the code work as expected?',
            weight: 40,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Does not work',
                2: 'Partially works',
                3: 'Works with issues',
                4: 'Works well',
                5: 'Works perfectly'
              }
            }
          },
          {
            id: 'readability',
            name: 'Code Readability',
            description: 'How readable and well-structured is the code?',
            weight: 25,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Very hard to read',
                2: 'Hard to read',
                3: 'Moderately readable',
                4: 'Easy to read',
                5: 'Very easy to read'
              }
            }
          },
          {
            id: 'efficiency',
            name: 'Efficiency',
            description: 'How efficient is the code in terms of performance?',
            weight: 20,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Very inefficient',
                2: 'Inefficient',
                3: 'Moderate efficiency',
                4: 'Efficient',
                5: 'Highly efficient'
              }
            }
          },
          {
            id: 'best_practices',
            name: 'Best Practices',
            description: 'Does the code follow coding best practices?',
            weight: 15,
            scale: {
              min: 1,
              max: 5,
              labels: {
                1: 'Poor practices',
                2: 'Below average',
                3: 'Average practices',
                4: 'Good practices',
                5: 'Excellent practices'
              }
            }
          }
        ]
      }
    ];
  }

  // Export rubrics
  exportRubrics(): string {
    return JSON.stringify(this.getRubrics(), null, 2);
  }

  // Import rubrics
  importRubrics(json: string): boolean {
    try {
      const rubrics = JSON.parse(json);
      if (Array.isArray(rubrics)) {
        this.saveRubrics(rubrics);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing rubrics:', error);
      return false;
    }
  }

  // Clear all rubrics (for testing)
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export const rubricsService = new RubricsService();