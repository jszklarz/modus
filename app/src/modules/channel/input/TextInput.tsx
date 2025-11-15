import { useSelector } from "@xstate/store/react";
import { HTMLAttributes } from "react";
import { inputStore } from "../../store/input.store";

type TextInputProps = {
  onSendMessage: () => void;
} & HTMLAttributes<HTMLDivElement>;

export default function TextInput({ onSendMessage, ...props }: TextInputProps) {
  const { transcription } = useSelector(inputStore, (state) => state.context);

  return (
    <div {...props}>
      <textarea
        className="w-full h-full bg-transparent text-foreground outline-none resize-none text-xs"
        value={transcription}
        onChange={(e) =>
          inputStore.send({ type: "setTranscription", transcription: e.target.value })
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
          // Shift+Enter allows new line (default textarea behavior)

          if (e.key === "Escape") {
            e.currentTarget.blur();
          }
        }}
        placeholder="Type a message or use the microphone..."
        autoFocus
      />
    </div>
  );
}
