function parseMarkmap(markmapCode) {
  if (!markmapCode || typeof markmapCode !== 'string') {
    throw new Error('Invalid markmap code: must be a non-empty string');
  }

  const lines = markmapCode.split('\n').filter(line => line.trim());
  const nodes = [];
  const edges = [];
  let lastNodeAtLevel = {};
  const varNameRegex = /\[(.*?)\]/;

  lines.forEach((line, index) => {
    // Count the number of # at the start to determine level
    const level = (line.match(/^#+/)?.[0].length || 0) - 1;
    if (level < 0) return; // Skip invalid lines

    const varMatch = line.match(varNameRegex);
    const varName = varMatch ? varMatch[1] : `node-${index}`;
    const text = line.replace(/^#+\s*/, '').replace(/\[.*?\]\s*/, '').trim();
    const id = varName;
    
    // Add node
    nodes.push({ 
      id, 
      text, 
      varName, 
      completed: false, 
      description: '',
      level // Store level information with node
    });
    
    // If not root level, connect to parent
    if (level > 0 && lastNodeAtLevel[level - 1]) {
      edges.push({
        id: `edge-${lastNodeAtLevel[level - 1]}-${id}`,
        source: lastNodeAtLevel[level - 1],
        target: id
      });
    }
    
    // Update last node at this level
    lastNodeAtLevel[level] = id;
  });

  return { nodes, edges };
}

export function parseNodeDescriptions(descriptionsText) {
  if (!descriptionsText || typeof descriptionsText !== 'string') {
    return new Map();
  }

  const descriptions = new Map();
  descriptionsText.split('\n').forEach(line => {
    const match = line.match(/^(.*?),\((.*?)\)$/);
    if (match) descriptions.set(match[1].trim(), match[2].trim());
  });
  return descriptions;
}

export function parseMarkmapToFlow(markmapCode, existingNodes = [], descriptionsText = '') {
  try {
    if (!markmapCode || typeof markmapCode !== 'string') {
      throw new Error('Invalid markmap code: must be a non-empty string');
    }

    const { nodes: parsedNodes, edges } = parseMarkmap(markmapCode);
    const descriptions = parseNodeDescriptions(descriptionsText);
    
    // Build tree structure for better positioning
    const nodeMap = new Map();
    const rootNodes = [];
    
    // Get max depth (level) of the tree for relative scaling
    const maxLevel = parsedNodes.reduce((max, node) => Math.max(max, node.level || 0), 0);
    
    // Calculate relative spacing based on tree depth and size
    const BASE_NODE_WIDTH = 200; // Base width of each node
    const nodeCount = parsedNodes.length;
    
    // Calculate relative spacings that adapt to graph size
    const HORIZONTAL_SPACING_FACTOR = 1.5; // Multiplier for horizontal spacing
    const VERTICAL_SPACING_FACTOR = 1.2;   // Multiplier for vertical spacing
    
    const HORIZONTAL_SPACING = BASE_NODE_WIDTH * HORIZONTAL_SPACING_FACTOR;
    const VERTICAL_SPACING = Math.max(40, Math.min(80, 600 / (nodeCount || 1))); // Adaptive vertical spacing
    
    // Create node map
    parsedNodes.forEach(node => {
      nodeMap.set(node.id, {
        ...node,
        children: [],
        width: BASE_NODE_WIDTH, // Default node width
        height: 40,  // Default node height
      });
    });
    
    // Build parent-child relationships
    edges.forEach(edge => {
      const parentNode = nodeMap.get(edge.source);
      const childNode = nodeMap.get(edge.target);
      if (parentNode && childNode) {
        parentNode.children.push(childNode.id);
      }
    });
    
    // Find root nodes (nodes with no parents)
    parsedNodes.forEach(node => {
      const isChild = edges.some(edge => edge.target === node.id);
      if (!isChild) {
        rootNodes.push(node.id);
      }
    });
    
    // Function to calculate subtree height and size
    function calculateSubtreeSize(nodeId) {
      const node = nodeMap.get(nodeId);
      if (!node) return { height: 0, count: 0 };
      
      if (node.children.length === 0) {
        return { height: node.height, count: 1 };
      }
      
      // Calculate size of children
      let totalHeight = 0;
      let totalCount = 1; // Include this node in count
      
      node.children.forEach(childId => {
        const { height, count } = calculateSubtreeSize(childId);
        totalHeight += height + VERTICAL_SPACING;
        totalCount += count;
      });
      
      // Remove extra spacing from last child
      if (node.children.length > 0) {
        totalHeight -= VERTICAL_SPACING;
      }
      
      // If only one child, ensure minimum height
      if (totalHeight < node.height) {
        totalHeight = node.height;
      }
      
      return { height: totalHeight, count: totalCount };
    }
    
    // Recursively position nodes with improved spacing
    function positionNode(nodeId, x, y, horizontalScale = 1) {
      const node = nodeMap.get(nodeId);
      if (!node) return { width: 0, height: 0 };
      
      // Store position
      node.position = { x, y };
      
      if (node.children.length === 0) {
        return { width: node.width, height: node.height };
      }
      
      // Calculate sizes for each child subtree
      const childrenSizes = node.children.map(childId => calculateSubtreeSize(childId));
      
      // Sum of all children heights plus spacing
      const totalHeight = childrenSizes.reduce((sum, size, i) => 
        sum + size.height + (i < childrenSizes.length - 1 ? VERTICAL_SPACING : 0), 0);
      
      // Position children
      let currentY = y - totalHeight / 2;
      let maxChildWidth = 0;
      
      // Calculate horizontal progression with level-based scaling
      // This creates more space between deeper levels
      const levelFactor = 1 + (node.level / (maxLevel + 1)) * 0.5;
      const nextX = x + HORIZONTAL_SPACING * horizontalScale * levelFactor;
      
      node.children.forEach((childId, index) => {
        const childNode = nodeMap.get(childId);
        if (!childNode) return;
        
        const childSize = childrenSizes[index];
        
        // Calculate childY with centering
        const childY = currentY + childSize.height / 2;
        
        // Position child with calculated scale
        const childScale = horizontalScale * (1 - 0.05 * node.level); // Slightly decrease scale with depth
        const childResult = positionNode(childId, nextX, childY, childScale);
        
        // Update for next child positioning
        currentY += childSize.height + VERTICAL_SPACING;
        maxChildWidth = Math.max(maxChildWidth, childResult.width);
      });
      
      return { 
        width: node.width + HORIZONTAL_SPACING * horizontalScale + maxChildWidth, 
        height: totalHeight 
      };
    }
    
    // Position root nodes with proper spacing
    let currentY = 0;
    rootNodes.forEach(rootId => {
      const rootSize = calculateSubtreeSize(rootId);
      positionNode(rootId, 0, currentY + rootSize.height / 2, 1);
      currentY += rootSize.height + VERTICAL_SPACING * 2; // Extra spacing between root trees
    });
    
    // Create flow nodes with calculated positions
    const flowNodes = parsedNodes.map(node => {
      const nodeWithPos = nodeMap.get(node.id);
      const existingNode = existingNodes?.find(n => n.id === node.id);
      const description = descriptions.get(node.varName) || '';
      
      return {
        id: node.id,
        type: 'custom',
        data: { 
          label: node.text || 'Untitled Node', 
          completed: existingNode?.completed || false, 
          level: node.level, 
          varName: node.varName, 
          description 
        },
        position: nodeWithPos.position || { x: 0, y: 0 }
      };
    });
    
    // Create curved edges with step curve type
    const flowEdges = edges.map(edge => ({
      ...edge,
      type: 'default', // 'default' type with custom properties for curved edges
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 2 },
      sourceHandle: null,
      targetHandle: null,
      markerEnd: { type: 'arrowclosed', color: '#64748b', width: 20, height: 20 },
      // Add curve properties for nice curves
      curvature: 0.5, // Higher values make the curve more pronounced
    }));
    
    return { nodes: flowNodes, edges: flowEdges };
  } catch (error) {
    console.error('Error in parseMarkmapToFlow:', error);
    throw new Error('Failed to parse roadmap structure: ' + error.message);
  }
}