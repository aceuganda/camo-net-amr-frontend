
import React from 'react';

const colorScale = [
    { range: 'No data', color: '#CCCCCC' },      // Very Light Red (0 cases)
    { range: '1 - 50', color: '#FF6969' }, // Light Red
    { range: '51 - 100', color: '#FF3333' }, // Moderate Red
    { range: '101 - 500', color: '#CC0000' }, // Medium Red
    { range: '501 - 1000', color: '#990000' }, // High Red
    { range: '1001+', color: '#660000' }    // Dark Red (Very High)
];


const Legend: React.FC = () => {
    return (
        <div className="md:ml-4 mt-4 md:mt-0 p-[10px] bg-white z-[10]"  >
            <h4>Resistance Cases Legend</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {colorScale.map((item, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: item.color,
                            width: '20px',
                            height: '20px',
                            marginRight: '5px',
                            borderRadius: '3px'
                        }} />
                        <span>{item.range}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Legend;