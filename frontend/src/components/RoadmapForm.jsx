import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmapStore } from '../store/roadmapStore';
import { Brain, Clock, BookOpen, Target, Check, X, Loader } from 'lucide-react';
import api from '../lib/axios';

const LEVELS = ['Get Started', 'Beginner', 'Intermediate', 'Advanced', 'Master'];

export function RoadmapForm() {
  const navigate = useNavigate();
  const [skill, setSkill] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [currentKnowledge, setCurrentKnowledge] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const roadmaps = useRoadmapStore((state) => state.roadmaps);
  const setRoadmaps = useRoadmapStore((state) => state.setRoadmaps);
  const setCurrentRoadmap = useRoadmapStore((state) => state.setCurrentRoadmap);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for duplicate roadmap with same skill
    const isDuplicate = roadmaps.some(roadmap => 
      roadmap.skill.toLowerCase() === skill.toLowerCase()
    );

    if (isDuplicate) {
      setError('A roadmap for this skill already exists');
      setLoading(false);
      return;
    }
    console.log('=== Starting Roadmap Creation ===');
    console.log('Form Data:', {
      skill,
      timeframe,
      current_knowledge: currentKnowledge,
      target_level: targetLevel
    });
    
    // Create new roadmap with default content
    console.log('Sending request to create roadmap...');
    
    // Set a longer timeout for the API call
    const createResponse = await api.post('/roadmap/create', {
      skill,
      timeframe,
      current_knowledge: currentKnowledge,
      target_level: targetLevel
    }, {
      timeout: 60000 // 60 second timeout
    });
    
    // Ensure response was successful
    if (!createResponse.data.success) {
      console.error(createResponse.data.error || 'Failed to create roadmap');
      return;
    }
    
    // Update local state
    console.log('Roadmap created successfully:', createResponse.data);
    const newRoadmap = createResponse.data.roadmap;
    
    // Check for duplicates before updating state
    const isDuplicateAfterCreation = roadmaps.some(roadmap => roadmap.id === newRoadmap.id);
    
    if (!isDuplicateAfterCreation) {
      console.log('Updating local state...');
      const processedRoadmap = {
        ...newRoadmap,
        nodes: newRoadmap.nodes || [],
        edges: newRoadmap.edges || [],
        marked_nodes: newRoadmap.marked_nodes || [],
        descriptions: newRoadmap.descriptions || {},
        markmap: newRoadmap.markmap || ''
      };
      
      // Update state
      setRoadmaps([...roadmaps, processedRoadmap]);
      setCurrentRoadmap(processedRoadmap);
    
      // Add debugging for navigation
      console.log('Navigation Debug:', {
        roadmapId: newRoadmap?.id,
        roadmapIdType: typeof newRoadmap?.id,
        fullRoadmap: newRoadmap,
        processedRoadmap
      });

      // Try navigation with string conversion
      if (newRoadmap?.id) {
        const roadmapId = String(newRoadmap.id);
        console.log('Attempting navigation to:', `/ongoing/${roadmapId}`);
        navigate(`/ongoing/${roadmapId}`, { replace: true });
      } else {
        console.error("Roadmap ID missing or invalid:", newRoadmap);
      }
    } else {
      console.log('Roadmap already exists, skipping state update');
    }
    
    console.log('=== Roadmap Creation Completed ===');
    
    

  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2">
          <X className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Skill to Learn
          </label>
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., React Development"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Timeframe
          </label>
          <input
            type="text"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 6 months"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Current Knowledge
          </label>
          <textarea
            value={currentKnowledge}
            onChange={(e) => setCurrentKnowledge(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Describe your current knowledge level..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Target Level
          </label>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a level</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Generating Roadmap...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              Generate Roadmap
            </>
          )}
        </button>
      </form>
    </div>
  );
}