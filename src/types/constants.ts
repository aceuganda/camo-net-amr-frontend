export type DatasetType = {
    id: string;
    name: string;
    category: string;
    type: string;
    size: number;
    countries: string[];
    project_status: string;
  
    title: string;
    thematic_area: string;
    study_design: string;
    data_format: string;
    source: string;
    in_warehouse: boolean;
    start_date: string;
    end_date: string;
    protocol_id: string;
    country_protocol_id: string;
    on_hold_reason: string;
    data_collection_methods: string;
    entries_count: string;
  
    citation_info: string;
  
    project_type: string;
    main_project_name: string;
    data_capture_method: string;
  
    amr_category: string;
    acronym: string;
    description: string;
  };