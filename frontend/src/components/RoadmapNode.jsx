import { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useRoadmapStore } from '../store/roadmapStore';

const RoadmapNode = memo(({ id, data }) => {
  const updateProgress = useRoadmapStore(state => state.updateProgress);
  const currentRoadmap = useRoadmapStore(state => state.currentRoadmap);
  const [isCompleted, setIsCompleted] = useState(data?.completed || false);
  
  // Sync local state with prop updates and marked_nodes
  useEffect(() => {
    const isNodeMarked = currentRoadmap?.marked_nodes?.includes(id) || false;
    setIsCompleted(isNodeMarked);
  }, [currentRoadmap?.marked_nodes, id]);

  if (!data) {
    return (
      <div className="px-4 py-2 shadow-lg rounded-lg border-2 border-red-300 bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Invalid node data</span>
        </div>
      </div>
    );
  }

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent node selection when clicking checkbox
    
    // Update the global state
    if (id) {
      updateProgress(id, !isCompleted);
    }
  };

  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 min-w-[150px] transition-colors duration-200 ${
      isCompleted ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-gray-400" 
      />
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleClick}
          className={`transition-colors ${isCompleted ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-blue-600'}`}
        >
          {isCompleted ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
        <span className="font-medium text-sm">{data.label || 'Untitled'}</span>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-gray-400" 
      />
    </div>
  );
});

RoadmapNode.displayName = 'RoadmapNode';

export default RoadmapNode;