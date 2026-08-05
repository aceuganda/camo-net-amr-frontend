// Range of collection years held in the warehouse. Bump MAX as new years land.
export const MIN_DATA_YEAR = 2020;
export const MAX_DATA_YEAR = 2025;

export const DATA_YEARS = Array.from(
    { length: MAX_DATA_YEAR - MIN_DATA_YEAR + 1 },
    (_, i) => MIN_DATA_YEAR + i
);

export const organisms = [
    { value: 'ecoli', name: 'E. coli' },
    { value: 'aureus', name: 'S. aureus' },
    { value: 'k.pneumoniae', name: 'K. pneumoniae' },
];

export const antibiotics = [
    { value: 'ampicillin', name: 'ampicillin' },
    { value: 'ciprofloxacin', name: 'ciprofloxacin' },
    { value: 'chloramphenicol', name: 'chloramphenicol' },
    { value: 'ceftriaxone', name: 'ceftriaxone' },
    { value: 'imipenem', name: 'imipenem' },
];