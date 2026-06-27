const COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500",
  "bg-yellow-500", "bg-pink-500", "bg-indigo-500",
];

interface Props {
  count: number;
  seed: string;
  max?: number;
}

export default function AvatarStack({ count, seed, max = 3 }: Props) {
  const show = Math.min(count, max);
  const extra = count - show;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {Array.from({ length: show }, (_, i) => {
          const colorIndex = (seed.charCodeAt(i % seed.length) + i) % COLORS.length;
          return (
            <div
              key={i}
              className={`h-6 w-6 rounded-full ${COLORS[colorIndex]} ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white`}
            >
              {String.fromCharCode(65 + colorIndex)}
            </div>
          );
        })}
      </div>
      {extra > 0 && (
        <span className="ml-1.5 text-xs text-gray-400 font-medium">+{extra}</span>
      )}
    </div>
  );
}
