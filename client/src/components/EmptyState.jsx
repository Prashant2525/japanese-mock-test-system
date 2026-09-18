export default function EmptyState({ title = 'Nothing here yet', description = 'New learning activity will appear here as you progress.' }) {
  return <div className="state-card"><div className="state-icon state-icon-soft">○</div><h3>{title}</h3><p>{description}</p></div>;
}

