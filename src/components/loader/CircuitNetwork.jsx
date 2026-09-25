import { memo } from 'react';

// Renders the generated circuit as layered SVG. Each trace is drawn four times:
// a dormant base, a "lit" copy (brightness set per frame), and a glowing pulse head with a
// soft halo (moved along the trace with stroke-dashoffset). Refs go into `els` for the
// pulse system to drive.

function CircuitNetwork({ circuit, tail, els }) {
  const { width, height, edges, nodes, components } = circuit;
  const dash = (e) => `${tail} ${e.len + tail * 2}`;
  const line = (e) => ({ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 });

  return (
    <svg className="loader__circuit" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
      <g className="c-base">
        {edges.map((e, i) => (
          <line key={i} {...line(e)} />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.type === 'via' ? 2.2 : 2.8} />
        ))}
        {components.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx="2" />
        ))}
      </g>

      <g className="c-lit">
        {edges.map((e, i) => (
          <line key={i} {...line(e)} ref={(el) => (els.lit[i] = el)} />
        ))}
      </g>

      <g className="c-halo">
        {edges.map((e, i) => (
          <line key={i} {...line(e)} strokeDasharray={dash(e)} ref={(el) => (els.halo[i] = el)} />
        ))}
      </g>
      <g className="c-pulse">
        {edges.map((e, i) => (
          <line key={i} {...line(e)} strokeDasharray={dash(e)} ref={(el) => (els.pulse[i] = el)} />
        ))}
      </g>

      <g className="c-nodes">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.type === 'via' ? 2.2 : 2.8} ref={(el) => (els.nodes[i] = el)} />
        ))}
      </g>
      <g className="c-components">
        {components.map((c, i) => (
          <g key={i} ref={(el) => (els.components[i] = el)}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="2" />
            {/* pins along the long sides */}
            {[0.25, 0.5, 0.75].map((f) =>
              c.horizontal ? (
                <g key={f}>
                  <line x1={c.x + c.w * f} y1={c.y} x2={c.x + c.w * f} y2={c.y - 4} />
                  <line x1={c.x + c.w * f} y1={c.y + c.h} x2={c.x + c.w * f} y2={c.y + c.h + 4} />
                </g>
              ) : (
                <g key={f}>
                  <line x1={c.x} y1={c.y + c.h * f} x2={c.x - 4} y2={c.y + c.h * f} />
                  <line x1={c.x + c.w} y1={c.y + c.h * f} x2={c.x + c.w + 4} y2={c.y + c.h * f} />
                </g>
              )
            )}
          </g>
        ))}
      </g>

      <circle className="c-ring" cx={width / 2} cy={height / 2} r="0" ref={(el) => (els.ring = el)} />
    </svg>
  );
}

export default memo(CircuitNetwork);
