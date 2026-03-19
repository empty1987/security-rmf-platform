// ============================================================
// CampusMap — SVG-based campus map with robot positions
// Design: Tactical grid map with pulsing robot markers
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { robots, type Robot } from '@/lib/mockData';

interface CampusMapProps {
  selectedRobot: string | null;
  onRobotClick: (id: string) => void;
  className?: string;
}

const robotColors: Record<string, string> = {
  online: '#34d399',
  patrolling: '#38bdf8',
  responding: '#fb923c',
  charging: '#a78bfa',
  offline: '#64748b',
  warning: '#fbbf24',
};

const buildings = [
  { id: 'A', x: 8, y: 15, w: 28, h: 40, label: 'A栋', color: 'rgba(56,189,248,0.06)' },
  { id: 'B', x: 42, y: 10, w: 25, h: 35, label: 'B栋', color: 'rgba(56,189,248,0.06)' },
  { id: 'C', x: 72, y: 15, w: 22, h: 30, label: 'C栋', color: 'rgba(56,189,248,0.06)' },
  { id: 'D', x: 42, y: 55, w: 30, h: 30, label: 'D栋', color: 'rgba(56,189,248,0.06)' },
  { id: 'E', x: 8, y: 65, w: 28, h: 25, label: 'E栋', color: 'rgba(56,189,248,0.06)' },
  { id: 'P', x: 72, y: 55, w: 22, h: 30, label: '停车场', color: 'rgba(100,116,139,0.08)' },
];

const roads = [
  { x1: 36, y1: 0, x2: 36, y2: 100 },
  { x1: 68, y1: 0, x2: 68, y2: 100 },
  { x1: 0, y1: 50, x2: 100, y2: 50 },
];

function RobotMarker({ robot, selected, onClick }: { robot: Robot; selected: boolean; onClick: () => void }) {
  const color = robotColors[robot.status] || '#64748b';
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (robot.status === 'responding' || robot.status === 'warning') {
      const t = setInterval(() => setPulse(p => (p + 1) % 3), 800);
      return () => clearInterval(t);
    }
  }, [robot.status]);

  return (
    <g
      transform={`translate(${robot.x}, ${robot.y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Pulse rings for active/alert robots */}
      {(robot.status === 'patrolling' || robot.status === 'responding' || robot.status === 'warning') && (
        <>
          <circle r="6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3">
            <animate attributeName="r" from="4" to="10" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="4" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2">
            <animate attributeName="r" from="3" to="8" dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Selection ring */}
      {selected && (
        <circle r="5.5" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2,1" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Robot body */}
      <circle r="3.5" fill={color} opacity="0.9" />
      <circle r="2" fill="rgba(0,0,0,0.4)" />
      <circle r="1" fill={color} />

      {/* Robot ID label */}
      <text
        x="5"
        y="-4"
        fill={color}
        fontSize="2.8"
        fontFamily="JetBrains Mono, monospace"
        opacity={selected ? 1 : 0.7}
      >
        {robot.id}
      </text>
    </g>
  );
}

export default function CampusMap({ selectedRobot, onRobotClick, className = '' }: CampusMapProps) {
  const [floor, setFloor] = useState(1);
  const [animFrame, setAnimFrame] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAnimFrame(f => f + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const floorRobots = robots.filter(r => r.floor === floor);

  return (
    <div className={`relative flex flex-col ${className}`} style={{ background: 'oklch(0.10 0.025 240)' }}>
      {/* Floor selector */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {[3, 2, 1, -1].map(f => (
          <button
            key={f}
            onClick={() => setFloor(f)}
            className={`w-9 h-7 rounded-lg text-xs font-mono-data border transition-all ${
              floor === f
                ? 'bg-sky-500/30 border-sky-500/50 text-sky-300'
                : 'bg-black/40 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {f === -1 ? 'B1' : `${f}F`}
          </button>
        ))}
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 100 100"
        className="flex-1 w-full h-full"
        style={{ minHeight: 0 }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(56,189,248,0.04)" strokeWidth="0.2"/>
          </pattern>
          <pattern id="grid-major" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="url(#grid)" />
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="0.3"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid-major)" />

        {/* Roads */}
        {roads.map((road, i) => (
          <line
            key={i}
            x1={road.x1} y1={road.y1}
            x2={road.x2} y2={road.y2}
            stroke="rgba(56,189,248,0.08)"
            strokeWidth="4"
          />
        ))}

        {/* Buildings */}
        {buildings.map(b => (
          <g key={b.id}>
            <rect
              x={b.x} y={b.y}
              width={b.w} height={b.h}
              fill={b.color}
              stroke="rgba(56,189,248,0.15)"
              strokeWidth="0.4"
              rx="0.5"
            />
            <text
              x={b.x + b.w / 2}
              y={b.y + b.h / 2 + 1}
              textAnchor="middle"
              fill="rgba(56,189,248,0.3)"
              fontSize="4"
              fontFamily="Noto Sans SC, sans-serif"
              fontWeight="600"
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* Patrol path animation for patrolling robots */}
        {floorRobots.filter(r => r.status === 'patrolling').map(robot => (
          <circle
            key={`trail-${robot.id}`}
            cx={robot.x}
            cy={robot.y}
            r="1.5"
            fill="none"
            stroke={robotColors[robot.status]}
            strokeWidth="0.3"
            opacity="0.2"
          />
        ))}

        {/* Robots */}
        {floorRobots.map(robot => (
          <RobotMarker
            key={robot.id}
            robot={robot}
            selected={selectedRobot === robot.id}
            onClick={() => onRobotClick(robot.id)}
          />
        ))}

        {/* Floor label */}
        <text x="2" y="5" fill="rgba(56,189,248,0.4)" fontSize="3" fontFamily="JetBrains Mono, monospace">
          {floor === -1 ? 'B1F' : `${floor}F`}
        </text>

        {/* Compass */}
        <g transform="translate(95, 95)">
          <circle r="3" fill="rgba(0,0,0,0.5)" stroke="rgba(56,189,248,0.2)" strokeWidth="0.3" />
          <text textAnchor="middle" y="-1.5" fill="rgba(56,189,248,0.6)" fontSize="2" fontFamily="JetBrains Mono, monospace">N</text>
          <line x1="0" y1="-1" x2="0" y2="1" stroke="rgba(56,189,248,0.4)" strokeWidth="0.3" />
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1">
        {[
          { color: '#38bdf8', label: '巡逻中' },
          { color: '#fb923c', label: '响应中' },
          { color: '#34d399', label: '待命' },
          { color: '#fbbf24', label: '异常' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* No robots on this floor */}
      {floorRobots.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-slate-600 bg-black/40 px-3 py-1.5 rounded-lg">
            此楼层暂无机器人
          </div>
        </div>
      )}
    </div>
  );
}
