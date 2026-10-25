import React, { useState } from 'react';

interface TimelinePoint {
  time: string;
  total: number;
  errors: number;
  warnings: number;
}

interface LogVolumeChartProps {
  data: TimelinePoint[];
  title?: string;
  height?: number;
}

export const LogVolumeChart: React.FC<LogVolumeChartProps> = ({
  data,
  title = 'Ingestion Volume & Error Rates',
  height = 180,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Calculate scales
  const maxTotal = Math.max(...data.map((d) => d.total), 10);
  // Round maxTotal up to a nice number
  const yMax = Math.ceil(maxTotal / 10) * 10;
  const yMid = Math.round(yMax / 2);

  // SVG coordinate system
  const svgWidth = 860;
  const chartLeft = 45;
  const chartRight = 835;
  const chartTop = 20;
  const chartBottom = 135;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  const barWidth = 14;
  const numBars = data.length;
  const step = chartWidth / (numBars > 1 ? numBars - 1 : 1);

  // Pick only 4-5 evenly spaced time labels to avoid any collision
  const labelIndices = [
    0,
    Math.floor((numBars - 1) * 0.25),
    Math.floor((numBars - 1) * 0.5),
    Math.floor((numBars - 1) * 0.75),
    numBars - 1,
  ];

  // Clean time format: remove ' pm' or ' am' and format cleanly as HH:MM
  const formatTimeLabel = (timeStr: string) => {
    return timeStr.replace(/\s*[apAP][mM]/, '');
  };

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px 24px',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
      }}
    >
      {/* Top Header & Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '14px',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-bright)',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Events ingested per 5-minute bucket across active forwarders
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '2px',
                backgroundColor: 'var(--accent)',
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Normal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '2px',
                backgroundColor: 'var(--warn)',
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Warnings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '2px',
                backgroundColor: 'var(--error)',
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Errors</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div style={{ width: '100%', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Y-Axis Grid Lines & Tick Labels */}
          {/* Top Line */}
          <line
            x1={chartLeft}
            y1={chartTop}
            x2={chartRight}
            y2={chartTop}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <text
            x={chartLeft - 8}
            y={chartTop + 4}
            textAnchor="end"
            fontSize="10"
            fontFamily="var(--mono)"
            fill="var(--text-muted)"
          >
            {yMax}
          </text>

          {/* Middle Line */}
          <line
            x1={chartLeft}
            y1={chartTop + chartHeight / 2}
            x2={chartRight}
            y2={chartTop + chartHeight / 2}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <text
            x={chartLeft - 8}
            y={chartTop + chartHeight / 2 + 4}
            textAnchor="end"
            fontSize="10"
            fontFamily="var(--mono)"
            fill="var(--text-muted)"
          >
            {yMid}
          </text>

          {/* Bottom Baseline */}
          <line
            x1={chartLeft}
            y1={chartBottom}
            x2={chartRight}
            y2={chartBottom}
            stroke="var(--border)"
          />
          <text
            x={chartLeft - 8}
            y={chartBottom + 3}
            textAnchor="end"
            fontSize="10"
            fontFamily="var(--mono)"
            fill="var(--text-muted)"
          >
            0
          </text>

          {/* Hover Column Guideline */}
          {hoverIndex !== null && (
            <line
              x1={chartLeft + hoverIndex * step}
              y1={chartTop}
              x2={chartLeft + hoverIndex * step}
              y2={chartBottom}
              stroke="var(--accent)"
              strokeDasharray="2 2"
              strokeWidth="1"
              opacity="0.8"
            />
          )}

          {/* Slender Bars */}
          {data.map((point, i) => {
            const xCenter = chartLeft + i * step;
            const x = xCenter - barWidth / 2;

            const totalHeight = (point.total / yMax) * chartHeight;
            const errorHeight = (point.errors / yMax) * chartHeight;
            const warnHeight = (point.warnings / yMax) * chartHeight;
            const normalHeight = Math.max(0, totalHeight - errorHeight - warnHeight);

            const yTotal = chartBottom - totalHeight;
            const yWarn = chartBottom - errorHeight - warnHeight;
            const yError = chartBottom - errorHeight;

            const isHovered = hoverIndex === i;

            return (
              <g
                key={point.time + i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Full-height hit target for easy mouse hover */}
                <rect
                  x={xCenter - step / 2}
                  y={chartTop}
                  width={step}
                  height={chartHeight + 25}
                  fill="transparent"
                />

                {/* Normal Segment */}
                <rect
                  x={x}
                  y={yTotal}
                  width={barWidth}
                  height={normalHeight}
                  fill="var(--accent)"
                  opacity={isHovered ? 1 : 0.75}
                  rx="1.5"
                />

                {/* Warning Segment */}
                {warnHeight > 0 && (
                  <rect
                    x={x}
                    y={yWarn}
                    width={barWidth}
                    height={warnHeight}
                    fill="var(--warn)"
                    opacity={isHovered ? 1 : 0.85}
                  />
                )}

                {/* Error Segment */}
                {errorHeight > 0 && (
                  <rect
                    x={x}
                    y={yError}
                    width={barWidth}
                    height={errorHeight}
                    fill="var(--error)"
                    opacity={isHovered ? 1 : 0.9}
                  />
                )}
              </g>
            );
          })}

          {/* Clean, Non-colliding X-Axis Labels (Only 4 or 5 clean ticks) */}
          {labelIndices.map((idx) => {
            if (!data[idx]) return null;
            const x = chartLeft + idx * step;
            return (
              <text
                key={idx}
                x={x}
                y={chartBottom + 18}
                textAnchor="middle"
                fontSize="11"
                fontFamily="var(--mono)"
                fill="var(--text-muted)"
              >
                {formatTimeLabel(data[idx].time)}
              </text>
            );
          })}
        </svg>

        {/* Clean Enterprise Hover Tooltip */}
        {hoveredPoint && hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: `${Math.min(Math.max(chartLeft + hoverIndex * (100 / (numBars - 1)), 15), 85)}%`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--surface-input)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--card-shadow)',
              pointerEvents: 'none',
              zIndex: 10,
              fontFamily: 'var(--mono)',
              whiteSpace: 'nowrap',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Time: </span>
              <strong style={{ color: 'var(--text-bright)' }}>{hoveredPoint.time}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--accent)' }}>Total: </span>
              <strong style={{ color: 'var(--text-bright)' }}>{hoveredPoint.total}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--warn-text)' }}>Warn: </span>
              <strong style={{ color: 'var(--text-bright)' }}>{hoveredPoint.warnings}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--error-text)' }}>Err: </span>
              <strong style={{ color: 'var(--text-bright)' }}>{hoveredPoint.errors}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
