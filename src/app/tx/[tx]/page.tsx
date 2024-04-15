export default function Page({ params }: { params: { tx: string } }) {
  return <div>Transaction: {params.tx}</div>;
}
