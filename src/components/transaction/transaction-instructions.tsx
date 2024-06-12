import Instruction from "@/components/transaction/instruction";

export default function TransactionInstructions({ data }: { data: any }) {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Instructions</h2>
      </div>

      {data.transaction.message.instructions.map(
        (instruction: any, index: number) => (
          <Instruction
            key={`instruction-${index}`}
            index={index}
            instruction={instruction}
            innerInstructions={data.meta.innerInstructions}
          />
        ),
      )}
    </>
  );
}
