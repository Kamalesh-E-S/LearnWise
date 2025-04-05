import React from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import { GitBranch, CheckSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Sidebar({ showCompleted = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const roadmaps = useRoadmapStore((state) => state.roadmaps);
  const setCurrentRoadmap = useRoadmapStore((state) => state.setCurrentRoadmap);
  const currentRoadmap = useRoadmapStore((state) => state.currentRoadmap);

  const filteredRoadmaps = roadmaps.filter(roadmap => 
    showCompleted ? roadmap.is_completed : !roadmap.is_completed
  );

  const calculateProgress = (roadmap) => {
    if (!roadmap.nodes || !roadmap.marked_nodes) return 0;
    const totalNodes = roadmap.nodes.length;
    const completedNodes = roadmap.marked_nodes.length;
    return totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;
  };

  const handleRoadmapClick = (roadmap) => {
    const latestRoadmap = roadmaps.find(r => r.id === roadmap.id) || roadmap;
    setCurrentRoadmap(latestRoadmap);
    const basePath = showCompleted ? '/completed' : '/ongoing';
    navigate(`${basePath}/${roadmap.id}`);
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium flex items-center gap-2">
          {showCompleted ? (
            <>
              <CheckSquare className="h-5 w-5 text-green-600" />
              Completed Roadmaps
            </>
          ) : (
            <>
              <GitBranch className="h-5 w-5 text-blue-600" />
              Ongoing Roadmaps
            </>
          )}
        </h2>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 #F1F5F9',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F1F5F9',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E1',
            borderRadius: '4px',
            '&:hover': {
              background: '#94A3B8',
            },
          },
        }}
      >
        {filteredRoadmaps.length > 0 ? (
          <div className="space-y-2">
            {filteredRoadmaps.map((roadmap) => {
              const progress = calculateProgress(roadmap);
              const isCompleted = roadmap.is_completed || progress === 100;
              
              return (
                <button
                  key={roadmap.id}
                  onClick={() => handleRoadmapClick(roadmap)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    currentRoadmap?.id === roadmap.id
                      ? showCompleted
                        ? 'bg-green-50 text-green-700'
                        : 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium">{roadmap.skill}</h3>
                  <p className="text-sm text-gray-600 mt-1">{roadmap.target_level}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${progress}%`
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No {showCompleted ? 'completed' : 'ongoing'} roadmaps</p>
            <p className="text-sm mt-1">
              {showCompleted
                ? 'Complete a roadmap to see it here'
                : 'Create a new roadmap to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}