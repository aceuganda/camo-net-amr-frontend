import DatasetDetails from "@/components/dataDetails";


export default function Catalog({ params }: { params: { id: string } }) {
    
  return (
      <DatasetDetails id={params.id} />
  );
}
