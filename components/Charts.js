'use client';

// Simple Chart Component - No external dependencies
export function LineChart({ data, dataKeys, colors, height = 300 }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                No data available
            </div>
        );
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = 100; // Percentage
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate max values
    const maxValues = {};
    dataKeys.forEach(key => {
        maxValues[key] = Math.max(...data.map(d => d[key] || 0), 1);
    });
    const overallMax = Math.max(...Object.values(maxValues));

    // Generate SVG paths
    const generatePath = (key, color) => {
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d[key] || 0) / overallMax) * 100;
            return `${x},${y}`;
        }).join(' ');

        return (
            <g key={key}>
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                />
                {/* Area fill */}
                <polygon
                    fill={`${color}20`}
                    points={`0,100 ${points} 100,100`}
                />
            </g>
        );
    };

    return (
        <div style={{ width: '100%', height }}>
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ width: '100%', height: chartHeight }}
            >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--border-subtle)" strokeWidth="0.2" />
                ))}

                {/* Data lines */}
                {dataKeys.map((key, i) => generatePath(key, colors[i]))}
            </svg>

            {/* X-axis labels */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
            }}>
                {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d, i) => (
                    <span key={i}>{d.label}</span>
                ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                {dataKeys.map((key, i) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <span style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: colors[i]
                        }}></span>
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function BarChart({ data, labelKey, valueKey, color = 'var(--accent-primary)', height = 200 }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                No data available
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d[valueKey] || 0), 1);

    return (
        <div style={{ height }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', justifyContent: 'center' }}>
                {data.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                            width: '80px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}>
                            {item[labelKey]}
                        </span>
                        <div style={{ flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${(item[valueKey] / maxValue) * 100}%`,
                                    background: typeof color === 'function' ? color(item, i) : color,
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease',
                                    minWidth: '2px'
                                }}
                            />
                        </div>
                        <span style={{
                            width: '40px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textAlign: 'right',
                            color: 'var(--text-primary)'
                        }}>
                            {item[valueKey]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DonutChart({ data, colors, size = 150 }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                No data
            </div>
        );
    }

    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (total === 0) {
        return (
            <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                No data
            </div>
        );
    }

    const entries = Object.entries(data);
    let currentAngle = -90;

    const segments = entries.map(([key, value], i) => {
        const percentage = (value / total) * 100;
        const angle = (value / total) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        // Calculate arc
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = ((startAngle + angle) * Math.PI) / 180;
        const radius = 40;
        const innerRadius = 25;

        const x1 = 50 + radius * Math.cos(startRad);
        const y1 = 50 + radius * Math.sin(startRad);
        const x2 = 50 + radius * Math.cos(endRad);
        const y2 = 50 + radius * Math.sin(endRad);
        const x3 = 50 + innerRadius * Math.cos(endRad);
        const y3 = 50 + innerRadius * Math.sin(endRad);
        const x4 = 50 + innerRadius * Math.cos(startRad);
        const y4 = 50 + innerRadius * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

        return { key, value, percentage, path, color: colors[i % colors.length] };
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <svg width={size} height={size} viewBox="0 0 100 100">
                {segments.map((seg, i) => (
                    <path key={i} d={seg.path} fill={seg.color} />
                ))}
                <text x="50" y="50" textAnchor="middle" dy="0.35em" fontSize="12" fill="var(--text-primary)" fontWeight="700">
                    {total}
                </text>
                <text x="50" y="62" textAnchor="middle" fontSize="6" fill="var(--text-muted)">
                    total
                </text>
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            background: seg.color,
                            flexShrink: 0
                        }}></span>
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{seg.key}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{seg.percentage.toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
