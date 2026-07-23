interface Props {
  title: string;
  value: string | number;
  color: string;
}

export default function StatCard({
  title,
  value,
  color,
}: Props) {
  return (
    <div
      className="stat-card"
      style={{
        borderLeft: `6px solid ${color}`,
      }}
    >
      <h4>{title}</h4>

      <h2>{value}</h2>
    </div>
  );
}