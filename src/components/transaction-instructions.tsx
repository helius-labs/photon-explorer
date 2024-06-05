import { Result } from "@/schemas/getTransaction";

import Instruction from "@/components/instruction";

export default function TransactionInstructions({
  result,
}: {
  result: Result;
}) {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Instructions</h2>
      </div>

      {result.transaction.message.instructions.map(
        (instruction: any, index: number) => (
          <Instruction
            key={`instruction-${index}`}
            index={index}
            instruction={instruction}
            innerInstructions={result.meta.innerInstructions}
          />
        ),
      )}
    </>
  );
}
