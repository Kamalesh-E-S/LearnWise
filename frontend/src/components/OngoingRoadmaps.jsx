import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import { Sidebar } from './Sidebar';
import { RoadmapViewer } from './RoadmapViewer';
import { useRoadmapStore } from '../store/roadmapStore';

export function OngoingRoadmaps() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const setRoadmaps = useRoadmapStore((state) => state.setRoadmaps);
  const setCurrentRoadmap = useRoadmapStore((state) => state.setCurrentRoadmap);

  useEffect(() => {
    fetchOngoingRoadmaps();
  }, []);

  // Add effect to handle roadmap selection when ID changes
  useEffect(() => {
    if (id) {
      // Convert URL id to number for comparison
      const numericId = parseInt(id, 10);
      const roadmap = useRoadmapStore.getState().roadmaps.find(r => r.id === numericId);
      if (roadmap) {
        const roadmapWithDefaults = {
          ...roadmap,
          nodes: roadmap.nodes || [],
          edges: roadmap.edges || [],
          marked_nodes: roadmap.marked_nodes || [],
          descriptions: roadmap.descriptions || {},
          markmap: roadmap.markmap || ''
        };
        setCurrentRoadmap(roadmapWithDefaults);
      }
    }
  }, [id, setCurrentRoadmap]);

  const fetchOngoingRoadmaps = async () => {
    try {
      const response = await api.get('/roadmap/ongoing');
      if (response.data.roadmaps) {
        // Ensure each roadmap has the required fields
        const processedRoadmaps = response.data.roadmaps.map(roadmap => ({
          ...roadmap,
          nodes: roadmap.nodes || [],
          marked_nodes: roadmap.marked_nodes || [],
          edges: roadmap.edges || [],
          descriptions: roadmap.descriptions || {}
        }));
        setRoadmaps(processedRoadmaps);

        // If we have an ID in the URL, set the current roadmap
        if (id) {
          // Convert URL id to number for comparison
          const numericId = parseInt(id, 10);
          const currentRoadmap = processedRoadmaps.find(r => r.id === numericId);
          if (currentRoadmap) {
            setCurrentRoadmap(currentRoadmap);
          }
        }
      } else {
        setError('No roadmaps data in response');
      }
    } catch (error) {
      console.error('Error fetching ongoing roadmaps:', error);
      setError(error.message || 'Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-lg shadow-md">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // If we have a specific roadmap ID, show the roadmap viewer with sidebar
  if (id) {
    return (
      <div className="flex gap-6 p-6">
        <Sidebar />
        <div className="flex-1">
          <RoadmapViewer />
        </div>
      </div>
    );
  }

  // Otherwise show the grid of roadmaps
  return (
    <div className="flex gap-6 p-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Ongoing Roadmaps</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useRoadmapStore.getState().roadmaps.length === 0 ? (
            <div className="col-span-2 flex items-center justify-center h-[400px] bg-white rounded-lg shadow-md">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">No ongoing skills</h2>
                <p className="text-gray-500">Create a new roadmap to get started.</p>
              </div>
            </div>
          ) : (
            useRoadmapStore.getState().roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  const roadmapWithDefaults = {
                    ...roadmap,
                    nodes: roadmap.nodes || [],
                    edges: roadmap.edges || [],
                    marked_nodes: roadmap.marked_nodes || [],
                    descriptions: roadmap.descriptions || {}, // Ensure descriptions is an object
                    markmap: roadmap.markmap || ''
                  };
                  useRoadmapStore.getState().setCurrentRoadmap(roadmapWithDefaults);
                  navigate(`/ongoing/${roadmap.id}`);
                }}
              >
                <h3 className="text-xl font-semibold mb-2">{roadmap.skill}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Timeframe: {roadmap.timeframe}</p>
                  <p>Target: {roadmap.target_level}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {(roadmap.nodes?.filter(n => n.completed)?.length || 0)} / {(roadmap.nodes?.length || 0)} completed
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
