"use client"
import DatasetDetails from "@/components/dataDetails/index";
import React from "react";


export default function Catalog({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
      <DatasetDetails id={id} />
  );
}
