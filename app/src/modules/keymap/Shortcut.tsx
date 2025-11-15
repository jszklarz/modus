// Renders a keyboard shortcut combo with keys separated by an escaped plus (\+) delimiter
export default function Shortcut({ shortcut }: { shortcut: string }) {
  const keyParts = shortcut.split("+").map((part) => {
    switch (part) {
      case "cmd":
        return "⌘";
      case "ctrl":
        return "⌃";
      case "alt":
        return "⌥";
      case "shift":
        return "⇧";
      default:
        return part.toUpperCase();
    }
  });

  return (
    <div className="text-muted-foreground font-mono flex items-center gap-1">
      {keyParts.map((key) => (
        <span
          key={key}
          className="text-xs py-px px-1.5 rounded-md bg-muted border border-muted-foreground/30"
        >
          {key}
        </span>
      ))}
    </div>
  );
}
