import RefereeResponseForm from "@/components/referenceForm";

export default function Referee({ params }: { params: { id: string } }) {
  return (
    <RefereeResponseForm id={params.id} />
  );
}
