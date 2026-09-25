// A simplified system-architecture diagram rendered as an ordered list, so it reads
// correctly to screen readers and reflows naturally on small screens.
export default function FlowDiagram({ nodes, caption, label = 'system.map' }) {
  return (
    <figure className="flow">
      <div className="flow__frame">
        <div className="flow__header mono" aria-hidden="true">
          <span>{label}</span>
          <span>{nodes.length} nodes</span>
        </div>
        <ol className="flow__list">
          {nodes.map((n, i) => (
            <li key={n.label} className="flow__node" style={{ '--i': i }}>
              <span className="flow__tag mono">{n.tag}</span>
              <span className="flow__label">{n.label}</span>
              <span className="flow__detail mono">{n.detail}</span>
            </li>
          ))}
        </ol>
      </div>
      {caption && <figcaption className="flow__caption mono">{caption}</figcaption>}
    </figure>
  );
}
