import BlockHistory from "@/components/block/block-history";

type Props = Readonly<{
  params: {
    slot: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Block ${params.slot} - XRAY`,
    description: `Block overview and details for block ${params.slot}`,
  };
}

export default function Page({ params }: Props) {
  return (
    <div className="grid gap-3">
      <BlockHistory slot={params.slot} />
    </div>
  );
}
