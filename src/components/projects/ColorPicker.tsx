const COLOR_OPTIONS = [
  "e0953f",
  "d34a2d",
  "c4272e",
  "c7295f",
  "ce00f1",
  "4a5ed4",
  "6275f6",
  "64a9f8",
  "6ebed7",
  "589686",
  "67b057",
  "5e9a3b",
  "696773",
  "212121",
];

export default function ColorPicker({
  color,
  setColor,
}: {
  color: string;
  setColor: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {COLOR_OPTIONS.map((c) => (
        <div
          key={c}
          onClick={() => setColor(c)}
          className={`p-[1px] rounded-lg cursor-pointer border-2 ${
            c === color ? " border-black" : "border-transparent"
          }`}
        >
          <div className="w-8 h-8 rounded-md" style={{ backgroundColor: `#${c}` }} />
        </div>
      ))}
    </div>
  );
}

export function randomColor() {
  return COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
}
