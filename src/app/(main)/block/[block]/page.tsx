import BlockHistory from "@/components/block/block-history";

type Props = Readonly<{
  params: {
    block: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Block ${params.block} - XRAY`,
    description: `Block overview and details for block ${params.block}`,
  };
}

export default function Page({ params }: Props) {
  return (
    <div className="grid gap-3">
      <BlockHistory block={params.block} />
    </div>
  );
}
