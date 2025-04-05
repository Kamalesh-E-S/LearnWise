import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react'; // Added CheckCircle icon
import api from '../lib/axios';
import { Sidebar } from './Sidebar';
import { RoadmapViewer } from './RoadmapViewer';
import { useRoadmapStore } from '../store/roadmapStore';

export function CompletedRoadmaps() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const setRoadmaps = useRoadmapStore((state) => state.setRoadmaps);
  const setCurrentRoadmap = useRoadmapStore((state) => state.setCurrentRoadmap);
  const roadmaps = useRoadmapStore((state) => state.roadmaps);

  useEffect(() => {
    fetchCompletedRoadmaps();
  }, []);

  useEffect(() => {
    if (id) {
      fetchSingleRoadmap(id);
    }
  }, [id]);

  const fetchSingleRoadmap = async (roadmapId) => {
    try {
      const response = await api.get(`/roadmap/${roadmapId}`);
      if (response.data.success && response.data.roadmap) {
        const roadmap = response.data.roadmap;
        const processedRoadmap = {
          ...roadmap,
          nodes: roadmap.nodes || [],
          edges: roadmap.edges || [],
          marked_nodes: roadmap.marked_nodes || [],
          descriptions: roadmap.descriptions || {},
          markmap: roadmap.markmap || '',
          node_desc: roadmap.node_desc || {},
        };
        setCurrentRoadmap(processedRoadmap);
      } else {
        setError('Failed to fetch roadmap details');
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setError(error.message || 'Failed to fetch roadmap');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedRoadmaps = async () => {
    try {
      const response = await api.get('/roadmap/completed');
      if (response.data.roadmaps) {
        const processedRoadmaps = response.data.roadmaps.map((roadmap) => ({
          ...roadmap,
          nodes: roadmap.nodes || [],
          marked_nodes: roadmap.marked_nodes || [],
          edges: roadmap.edges || [],
          descriptions: roadmap.descriptions || {},
          node_desc: roadmap.node_desc || {},
        }));
        setRoadmaps(processedRoadmaps);
      } else {
        setError('No roadmaps data in response');
      }
    } catch (error) {
      console.error('Error fetching completed roadmaps:', error);
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

  if (id) {
    return (
      <div className="flex gap-6 p-6">
        <Sidebar showCompleted={true} />
        <div className="flex-1">
          <RoadmapViewer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-6">
      <div className="flex-1">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
  🏆 Your Achievements
</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmaps.length === 0 ? (
            <div className="col-span-2 flex items-center justify-center h-[400px] bg-white rounded-lg shadow-md">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">No completed skills</h2>
                <p className="text-gray-500">Complete a roadmap to see it here.</p>
              </div>
            </div>
          ) : (
            roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-green-50"
                onClick={() => {
                  const roadmapWithDefaults = {
                    ...roadmap,
                    nodes: roadmap.nodes || [],
                    edges: roadmap.edges || [],
                    marked_nodes: roadmap.marked_nodes || [],
                    descriptions: roadmap.descriptions || {},
                    markmap: roadmap.markmap || '',
                    node_desc: roadmap.node_desc || {},
                  };
                  setCurrentRoadmap(roadmapWithDefaults);
                  navigate(`/completed/${roadmap.id}`);
                }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 flex items-center">
                    {roadmap.skill} <span className="ml-2 text-green-600">🎉</span>
                  </h3>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Timeframe: {roadmap.timeframe}</p>
                  <p>Target: {roadmap.target_level}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Completed on: {new Date(roadmap.completed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {(roadmap.nodes?.filter((n) => n.completed)?.length || 0)} /{' '}
                    {(roadmap.nodes?.length || 0)} completed
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
