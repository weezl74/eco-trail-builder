import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, Users, Building2, Handshake, Eye, Volume2, Brain, Heart, Lightbulb, Target, TrendingUp, Zap, Shield, Network, FileText, BarChart3, BookOpen, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DecisionNode {
  id: string;
  title: string;
  description?: string;
  type: 'decision' | 'action' | 'outcome';
  color: string;
  children?: string[];
  category?: 'residents' | 'authority' | 'collaboration';
}

const DecisionToolkit = () => {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState('start');
  const [learningPreferences, setLearningPreferences] = useState<any>(null);

  useEffect(() => {
    // Load learning preferences from localStorage
    const preferences = localStorage.getItem('learningPreferences');
    console.log('🔍 Loading learning preferences from localStorage:', preferences);
    if (preferences) {
      const parsedPreferences = JSON.parse(preferences);
      console.log('✅ Parsed learning preferences:', parsedPreferences);
      setLearningPreferences(parsedPreferences);
    } else {
      console.log('❌ No learning preferences found in localStorage');
    }
  }, []);

  const decisionNodes: Record<string, DecisionNode> = {
    start: {
      id: 'start',
      title: 'Decision Making Toolkit',
      description: 'Choose your pathway',
      type: 'decision',
      color: 'wfg-blue',
      children: ['residents', 'authority', 'collaboration']
    },
    residents: {
      id: 'residents',
      title: 'Caerphilly Residents',
      description: 'Community-focused decisions',
      type: 'decision',
      color: 'wfg-blue',
      category: 'residents',
      children: ['local-benefits', 'employment', 'social-understanding']
    },
    authority: {
      id: 'authority',
      title: 'Internally (the local authority)',
      description: 'Internal decision processes',
      type: 'decision',
      color: 'wfg-purple',
      category: 'authority',
      children: ['internal-processes', 'whole-system', 'data-management']
    },
    collaboration: {
      id: 'collaboration',
      title: 'Collaboration Across Organisations',
      description: 'Cross-organisational partnerships',
      type: 'decision',
      color: 'wfg-green',
      category: 'collaboration',
      children: ['partnerships', 'shared-goals', 'joint-delivery']
    },
    'local-benefits': {
      id: 'local-benefits',
      title: 'Local Benefits',
      description: 'Focus on community advantages',
      type: 'decision',
      color: 'wfg-yellow',
      category: 'residents',
      children: ['economic-growth', 'quality-of-life', 'community-resilience']
    },
    employment: {
      id: 'employment',
      title: 'Employment',
      description: 'Job creation and skills development',
      type: 'decision',
      color: 'wfg-orange',
      category: 'residents',
      children: ['green-jobs', 'skills-training', 'local-workforce']
    },
    'social-understanding': {
      id: 'social-understanding',
      title: 'Public engagement and understanding',
      description: 'Community awareness and participation',
      type: 'decision',
      color: 'wfg-red',
      category: 'residents',
      children: ['education-outreach', 'stakeholder-engagement', 'behavioural-change']
    },
    'internal-processes': {
      id: 'internal-processes',
      title: 'Internal processes for change',
      description: 'Organisational transformation',
      type: 'decision',
      color: 'wfg-blue',
      category: 'authority',
      children: ['governance-structure', 'decision-frameworks', 'change-management']
    },
    'whole-system': {
      id: 'whole-system',
      title: 'Take a whole-systems approach',
      description: 'Holistic decision making',
      type: 'decision',
      color: 'wfg-purple',
      category: 'authority',
      children: ['integrated-planning', 'cross-department', 'long-term-strategy']
    },
    'data-management': {
      id: 'data-management',
      title: 'Ensure data consistency and quality',
      description: 'Information governance',
      type: 'decision',
      color: 'wfg-green',
      category: 'authority',
      children: ['data-standards', 'monitoring-systems', 'evidence-base']
    },
    partnerships: {
      id: 'partnerships',
      title: 'Strategic partnerships',
      description: 'Building collaborative relationships',
      type: 'decision',
      color: 'wfg-yellow',
      category: 'collaboration',
      children: ['partnership-development', 'resource-sharing', 'joint-planning']
    },
    'shared-goals': {
      id: 'shared-goals',
      title: 'Shared goals and objectives',
      description: 'Aligned organisational priorities',
      type: 'decision',
      color: 'wfg-orange',
      category: 'collaboration',
      children: ['vision-alignment', 'target-setting', 'success-metrics']
    },
    'joint-delivery': {
      id: 'joint-delivery',
      title: 'Joint service delivery',
      description: 'Collaborative implementation',
      type: 'decision',
      color: 'wfg-red',
      category: 'collaboration',
      children: ['service-integration', 'shared-resources', 'coordinated-action']
    },
    
    // Local Benefits - Next Level
    'economic-growth': {
      id: 'economic-growth',
      title: 'Economic Growth',
      description: 'Local economic development and prosperity',
      type: 'action',
      color: 'wfg-yellow',
      category: 'residents'
    },
    'quality-of-life': {
      id: 'quality-of-life',
      title: 'Quality of Life',
      description: 'Improving community wellbeing and living standards',
      type: 'action',
      color: 'wfg-green',
      category: 'residents'
    },
    'community-resilience': {
      id: 'community-resilience',
      title: 'Community Resilience',
      description: 'Building adaptive capacity and preparedness',
      type: 'action',
      color: 'wfg-blue',
      category: 'residents'
    },
    
    // Employment - Next Level
    'green-jobs': {
      id: 'green-jobs',
      title: 'Green Jobs Creation',
      description: 'Developing sustainable employment opportunities',
      type: 'action',
      color: 'wfg-green',
      category: 'residents'
    },
    'skills-training': {
      id: 'skills-training',
      title: 'Skills Training',
      description: 'Building capabilities for future workforce',
      type: 'action',
      color: 'wfg-orange',
      category: 'residents'
    },
    'local-workforce': {
      id: 'local-workforce',
      title: 'Local Workforce Development',
      description: 'Supporting community employment growth',
      type: 'action',
      color: 'wfg-purple',
      category: 'residents'
    },
    
    // Social Understanding - Next Level
    'education-outreach': {
      id: 'education-outreach',
      title: 'Education & Outreach',
      description: 'Informing and educating the community',
      type: 'action',
      color: 'wfg-yellow',
      category: 'residents'
    },
    'stakeholder-engagement': {
      id: 'stakeholder-engagement',
      title: 'Stakeholder Engagement',
      description: 'Active participation and consultation',
      type: 'action',
      color: 'wfg-red',
      category: 'residents'
    },
    'behavioural-change': {
      id: 'behavioural-change',
      title: 'Behavioural Change',
      description: 'Encouraging sustainable practices',
      type: 'action',
      color: 'wfg-blue',
      category: 'residents'
    },
    
    // Internal Processes - Next Level
    'governance-structure': {
      id: 'governance-structure',
      title: 'Governance Structure',
      description: 'Organisational frameworks and accountability',
      type: 'action',
      color: 'wfg-blue',
      category: 'authority'
    },
    'decision-frameworks': {
      id: 'decision-frameworks',
      title: 'Decision Frameworks',
      description: 'Structured approaches to decision making',
      type: 'action',
      color: 'wfg-purple',
      category: 'authority'
    },
    'change-management': {
      id: 'change-management',
      title: 'Change Management',
      description: 'Managing organisational transformation',
      type: 'action',
      color: 'wfg-green',
      category: 'authority'
    },
    
    // Whole System - Next Level
    'integrated-planning': {
      id: 'integrated-planning',
      title: 'Integrated Planning',
      description: 'Coordinated cross-sector planning approaches',
      type: 'action',
      color: 'wfg-purple',
      category: 'authority'
    },
    'cross-department': {
      id: 'cross-department',
      title: 'Cross-Department Collaboration',
      description: 'Breaking down silos for effective delivery',
      type: 'action',
      color: 'wfg-orange',
      category: 'authority'
    },
    'long-term-strategy': {
      id: 'long-term-strategy',
      title: 'Long-term Strategy',
      description: 'Strategic planning for sustainable futures',
      type: 'action',
      color: 'wfg-red',
      category: 'authority'
    },
    
    // Data Management - Next Level
    'data-standards': {
      id: 'data-standards',
      title: 'Data Standards',
      description: 'Establishing consistent data protocols',
      type: 'action',
      color: 'wfg-green',
      category: 'authority'
    },
    'monitoring-systems': {
      id: 'monitoring-systems',
      title: 'Monitoring Systems',
      description: 'Tracking progress and performance',
      type: 'action',
      color: 'wfg-yellow',
      category: 'authority'
    },
    'evidence-base': {
      id: 'evidence-base',
      title: 'Evidence Base',
      description: 'Building robust information foundations',
      type: 'action',
      color: 'wfg-blue',
      category: 'authority'
    },
    
    // Partnerships - Next Level
    'partnership-development': {
      id: 'partnership-development',
      title: 'Partnership Development',
      description: 'Creating and nurturing collaborative relationships',
      type: 'action',
      color: 'wfg-yellow',
      category: 'collaboration'
    },
    'resource-sharing': {
      id: 'resource-sharing',
      title: 'Resource Sharing',
      description: 'Optimising collective capabilities and assets',
      type: 'action',
      color: 'wfg-green',
      category: 'collaboration'
    },
    'joint-planning': {
      id: 'joint-planning',
      title: 'Joint Planning',
      description: 'Collaborative strategic planning processes',
      type: 'action',
      color: 'wfg-purple',
      category: 'collaboration'
    },
    
    // Shared Goals - Next Level
    'vision-alignment': {
      id: 'vision-alignment',
      title: 'Vision Alignment',
      description: 'Creating shared understanding and direction',
      type: 'action',
      color: 'wfg-orange',
      category: 'collaboration'
    },
    'target-setting': {
      id: 'target-setting',
      title: 'Target Setting',
      description: 'Establishing measurable objectives',
      type: 'action',
      color: 'wfg-red',
      category: 'collaboration'
    },
    'success-metrics': {
      id: 'success-metrics',
      title: 'Success Metrics',
      description: 'Defining indicators of achievement',
      type: 'action',
      color: 'wfg-blue',
      category: 'collaboration'
    },
    
    // Joint Delivery - Next Level
    'service-integration': {
      id: 'service-integration',
      title: 'Service Integration',
      description: 'Seamless multi-agency service delivery',
      type: 'action',
      color: 'wfg-red',
      category: 'collaboration'
    },
    'shared-resources': {
      id: 'shared-resources',
      title: 'Shared Resources',
      description: 'Pooling assets and capabilities',
      type: 'action',
      color: 'wfg-yellow',
      category: 'collaboration'
    },
    'coordinated-action': {
      id: 'coordinated-action',
      title: 'Coordinated Action',
      description: 'Synchronized implementation activities',
      type: 'action',
      color: 'wfg-green',
      category: 'collaboration'
    }
  };

  const currentNode = decisionNodes[selectedPath];

  const getIcon = (category?: string) => {
    switch (category) {
      case 'residents':
        return <Users className="h-8 w-8" />;
      case 'authority':
        return <Building2 className="h-8 w-8" />;
      case 'collaboration':
        return <Handshake className="h-8 w-8" />;
      default:
        return <Home className="h-8 w-8" />;
    }
  };

  const getBackgroundColor = (color: string) => {
    switch (color) {
      case 'wfg-blue':
        return 'bg-wfg-blue';
      case 'wfg-purple':
        return 'bg-wfg-purple';
      case 'wfg-green':
        return 'bg-wfg-green';
      case 'wfg-yellow':
        return 'bg-wfg-yellow';
      case 'wfg-orange':
        return 'bg-wfg-orange';
      case 'wfg-red':
        return 'bg-wfg-red';
      default:
        return 'bg-wfg-blue';
    }
  };

  const renderDecisionNode = (nodeId: string) => {
    const node = decisionNodes[nodeId];
    if (!node) return null;

    return (
      <Card
        key={nodeId}
        className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${getBackgroundColor(node.color)} text-white border-0`}
        onClick={() => setSelectedPath(nodeId)}
      >
        <div className="flex items-center space-x-3">
          {getIcon(node.category)}
          <div>
            <h3 className="text-xl font-helvetica font-bold">{node.title}</h3>
            {node.description && (
              <p className="text-white/80 font-helvetica mt-2">{node.description}</p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderLearningPreferencesBar = () => {
    console.log('🎨 Rendering learning preferences bar. Preferences:', learningPreferences);
    if (!learningPreferences) {
      console.log('❌ No learning preferences found, not showing bar');
      return null;
    }
    console.log('✅ Learning preferences found, showing bar');

    const getPreferenceIcon = () => {
      switch (learningPreferences.learningStyle) {
        case 'visual':
          return <Eye className="h-6 w-6 opacity-60" />;
        case 'auditory':
          return <Volume2 className="h-6 w-6 opacity-60" />;
        case 'mixed':
          return <Brain className="h-6 w-6 opacity-60" />;
        default:
          return <Lightbulb className="h-6 w-6 opacity-60" />;
      }
    };

    const getComplexityIcon = () => {
      switch (learningPreferences.complexityLevel) {
        case 'simple':
          return <Heart className="h-5 w-5 opacity-60" />;
        case 'detailed':
          return <Target className="h-5 w-5 opacity-60" />;
        case 'comprehensive':
          return <FileText className="h-5 w-5 opacity-60" />;
        default:
          return null;
      }
    };

    const getKnowledgeIcon = () => {
      switch (learningPreferences.priorKnowledge) {
        case 'new':
          return <Lightbulb className="h-5 w-5 opacity-60" />;
        case 'some':
          return <TrendingUp className="h-5 w-5 opacity-60" />;
        case 'experienced':
          return <Shield className="h-5 w-5 opacity-60" />;
        default:
          return null;
      }
    };

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-wfg-blue/20 py-2 shadow-lg" style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-center space-x-2 max-w-lg mx-auto">
          <div className="bg-white/10 rounded-lg p-2 hover:bg-white/15 transition-colors cursor-pointer" title={`${learningPreferences.learningStyle === 'visual' ? 'Visual' : learningPreferences.learningStyle === 'auditory' ? 'Auditory' : 'Mixed'} Learner`}>
            {getPreferenceIcon()}
          </div>
          
          <div className="bg-white/10 rounded-lg p-2 hover:bg-white/15 transition-colors cursor-pointer" title={`${learningPreferences.complexityLevel === 'simple' ? 'Simple' : learningPreferences.complexityLevel === 'detailed' ? 'Detailed' : 'Comprehensive'} Level`}>
            {getComplexityIcon()}
          </div>
          
          <div className="bg-white/10 rounded-lg p-2 hover:bg-white/15 transition-colors cursor-pointer" title={`${learningPreferences.priorKnowledge === 'new' ? 'Beginner' : learningPreferences.priorKnowledge === 'some' ? 'Intermediate' : 'Advanced'} Knowledge`}>
            {getKnowledgeIcon()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24"> {/* Added extra bottom padding for fixed bar */}
      {/* Header */}
      <div className="bg-wfg-blue p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/learning-assessment')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Main App
            </Button>
          </div>
          <h1 className="text-2xl font-helvetica font-bold text-white">
            Decision Making Toolkit
          </h1>
          <div /> {/* Spacer */}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span 
              className="cursor-pointer hover:text-wfg-blue"
              onClick={() => setSelectedPath('start')}
            >
              Home
            </span>
            {selectedPath !== 'start' && (
              <>
                <span>/</span>
                <span className="text-wfg-blue font-semibold">
                  {currentNode.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Current Node */}
        <div className="mb-8">
          <Card className={`p-8 ${getBackgroundColor(currentNode.color)} text-white border-0`}>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {getIcon(currentNode.category)}
              </div>
              <h2 className="text-3xl font-helvetica font-bold mb-4">
                {currentNode.title}
              </h2>
              {currentNode.description && (
                <p className="text-xl text-white/90 font-helvetica">
                  {currentNode.description}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Child Nodes */}
        {currentNode.children && currentNode.children.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentNode.children.map(childId => renderDecisionNode(childId))}
          </div>
        )}

        {/* Tools and Resources Section */}
        {selectedPath !== 'start' && (
          <div className="mt-12">
            <h3 className="text-2xl font-helvetica font-bold text-gray-800 mb-6">
              Tools and Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                className="p-4 bg-wfg-yellow text-white border-0 cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
                onClick={() => navigate('/dashboard')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-5 w-5" />
                  <h4 className="font-helvetica font-bold">Data & Analytics</h4>
                </div>
                <p className="text-sm">Access data insights and analytics tools</p>
              </Card>
              <Card 
                className="p-4 bg-wfg-orange text-white border-0 cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
                onClick={() => navigate('/knowledge')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <h4 className="font-helvetica font-bold">Best Practice</h4>
                </div>
                <p className="text-sm">Learn from successful implementations</p>
              </Card>
              <Card 
                className="p-4 bg-wfg-green text-white border-0 cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
                onClick={() => navigate('/sprints')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5" />
                  <h4 className="font-helvetica font-bold">Planning Tools</h4>
                </div>
                <p className="text-sm">Strategic planning and decision frameworks</p>
              </Card>
              <Card 
                className="p-4 bg-wfg-red text-white border-0 cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
                onClick={() => navigate('/community')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <HelpCircle className="h-5 w-5" />
                  <h4 className="font-helvetica font-bold">Guidance</h4>
                </div>
                <p className="text-sm">Step-by-step implementation guidance</p>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {/* Learning Preferences Reminder Bar */}
      {renderLearningPreferencesBar()}
    </div>
  );
};

export default DecisionToolkit;