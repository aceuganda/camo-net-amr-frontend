import RefereeResponseForm from "@/components/referenceForm";
import React from "react";

export default function Referee({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return (
    <RefereeResponseForm id={id} />
  );
}
