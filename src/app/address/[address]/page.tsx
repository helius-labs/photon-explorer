export default function Page({ params }: { params: { address: string } }) {
  return <div>Address: {params.address}</div>;
}
