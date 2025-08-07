"use client"
import DatasetDetails from "@/components/dataDetails/index";
import React, {useEffect} from "react";


export default function Catalog({ params }: { params: { id: string } }) {

  return (
      <DatasetDetails id={params.id} />
  );
}
