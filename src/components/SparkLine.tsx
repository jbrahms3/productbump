interface Props {
  seed: string;
  color?: string;
  width?: number;
  height?: number;
}

function seededRandom(str: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const x = Math.sin(hash + index) * 10000;
  return x - Math.floor(x);
}

export default function SparkLine({ seed, color = "#f97316", width = 80, height = 28 }: Props) {
  const points = Array.from({ length: 7 }, (_, i) => ({
    x: (i / 6) * width,
    y: height - seededRandom(seed, i) * height * 0.75 - height * 0.1,
  }));

  const d = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = points[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 3;
      const cp1y = prev.y;
      const cp2x = prev.x + (2 * (p.x - prev.x)) / 3;
      const cp2y = p.y;
      return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
