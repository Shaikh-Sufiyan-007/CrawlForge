import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import { useCrawl } from '../context/CrawlContext';
import { Globe, ExternalLink, Link2, Eye, X } from 'lucide-react';

// Custom Page Node Component
const CustomPageNode = ({ data, selected }) => {
  const isSuccess = data.statusCode >= 200 && data.statusCode < 400;
  const isRoot = data.depth === 0;

  return (
    <div
      className={`px-3 py-2 rounded-lg text-left border text-xs shadow-xs transition-shadow w-56 ${selected
        ? 'ring-2 ring-emerald-500 border-emerald-500'
        : ''
        } ${isRoot
          ? 'bg-emerald-700 text-white border-emerald-800'
          : isSuccess
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
        }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-500" />

      <div className="flex items-center justify-between mb-1 text-[10px]">
        <span
          className={`font-semibold uppercase tracking-wider ${isRoot ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
            }`}
        >
          {isRoot ? 'START URL' : `DEPTH ${data.depth}`}
        </span>

        {data.statusCode > 0 && (
          <span
            className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] ${isRoot
              ? 'bg-emerald-800 text-white'
              : isSuccess
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
          >
            {data.statusCode}
          </span>
        )}
      </div>

      <div className="font-medium truncate text-xs" title={data.label}>
        {data.label || 'Page'}
      </div>

      <div
        className={`font-mono text-[10px] truncate mt-0.5 ${isRoot ? 'text-emerald-100/80' : 'text-slate-400 dark:text-slate-500'
          }`}
        title={data.url}
      >
        {data.url}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
    </div>
  );
};

const nodeTypes = {
  customPage: CustomPageNode,
};

export const GraphView = ({ graphData }) => {
  const { theme } = useCrawl();
  const [selectedNode, setSelectedNode] = useState(null);

  // Position nodes hierarchically using a wrapped multi-column layout per depth level
  const initialNodes = useMemo(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return [];

    // Group nodes by depth
    const depthGroups = {};
    graphData.nodes.forEach((node) => {
      const depth = node.depth || 0;
      if (!depthGroups[depth]) depthGroups[depth] = [];
      depthGroups[depth].push(node);
    });

    const calculatedNodes = [];
    const COLS_PER_ROW = 4;
    const NODE_WIDTH = 240;
    const NODE_HEIGHT = 80;
    const GAP_X = 40;
    const GAP_Y = 30;
    const DEPTH_SPACING_Y = 60;

    let currentY = 0;

    // Process depths sequentially (0, 1, 2, ...)
    const sortedDepths = Object.keys(depthGroups)
      .map(Number)
      .sort((a, b) => a - b);

    sortedDepths.forEach((depth) => {
      const group = depthGroups[depth];
      const rowCount = Math.ceil(group.length / COLS_PER_ROW);

      group.forEach((node, index) => {
        const col = index % COLS_PER_ROW;
        const row = Math.floor(index / COLS_PER_ROW);

        // Center the columns around x = 0
        const totalCols = Math.min(group.length, COLS_PER_ROW);
        const startX = -((totalCols * (NODE_WIDTH + GAP_X)) / 2) + NODE_WIDTH / 2;

        const posX = startX + col * (NODE_WIDTH + GAP_X);
        const posY = currentY + row * (NODE_HEIGHT + GAP_Y);

        calculatedNodes.push({
          id: node.id,
          type: 'customPage',
          position: { x: posX, y: posY },
          data: {
            url: node.id,
            label: node.label,
            statusCode: node.statusCode,
            depth: node.depth,
          },
        });
      });

      currentY += rowCount * (NODE_HEIGHT + GAP_Y) + DEPTH_SPACING_Y;
    });

    return calculatedNodes;
  }, [graphData]);

  // Edges styled cleanly
  const initialEdges = useMemo(() => {
    if (!graphData || !graphData.edges) return [];

    return graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.internal,
      style: {
        stroke: edge.internal ? '#10b981' : '#94a3b8',
        strokeWidth: 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.internal ? '#10b981' : '#94a3b8',
        width: 12,
        height: 12,
      },
    }));
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state properly when graphData updates
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data);
  }, []);

  const hasGraph = nodes && nodes.length > 0;

  return (
    <div className="relative w-full h-[580px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-xs">
      {!hasGraph ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
          <Link2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            No graph nodes discovered yet
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Discovered pages and link connections will render automatically as the crawler extracts internal URLs.
          </p>
        </div>
      ) : (
        <>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.15}
            maxZoom={2}
          >
            <Background
              color={theme === 'dark' ? '#334155' : '#cbd5e1'}
              gap={16}
              size={1}
            />
            <Controls className="!border-slate-200 dark:!border-slate-700 !rounded-lg" />
            <MiniMap
              nodeStrokeColor={theme === 'dark' ? '#475569' : '#cbd5e1'}
              nodeColor={(node) => (node.data.depth === 0 ? '#10b981' : '#64748b')}
              maskColor={theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.7)'}
              className="!border-slate-200 dark:!border-slate-800 !rounded-lg"
            />
          </ReactFlow>

          {/* Simple Legend */}
          <div className="absolute top-3 left-3 p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
              Legend
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
              <span>Start URL (Depth 0)</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 inline-block" />
              <span>Internal Page</span>
            </div>
          </div>

          {/* Selected Node Details Drawer */}
          {selectedNode && (
            <div className="absolute top-3 right-3 w-72 p-3.5 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-2.5 z-10">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1 text-xs">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Page Node</span>
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Title
                </span>
                <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {selectedNode.label || 'Untitled Page'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  URL
                </span>
                <div className="font-mono text-slate-600 dark:text-slate-300 break-all text-[11px] mt-0.5">
                  {selectedNode.url}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Depth</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedNode.depth}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedNode.statusCode || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href={selectedNode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-1.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GraphView;

