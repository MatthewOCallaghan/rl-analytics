import React from 'react';

import './Table.css';

const Table = ({ title, headings, rows, caption, responsive, colour }) => {
    return (
        <>
            { title && <h2 style={{color: colour, fontFamily: `'Bourgeois Book', monospace`, fontSize: '2.5rem'}}>{title}</h2> }
            <table className={`scoreboard-table${responsive ? ' table-responsive' : ''}`} >
                { caption && <caption>{caption}</caption> }
                {
                    headings.length > 0 &&
                    <thead>
                        <tr>
                            {
                                headings.map((heading, index) => 
                                    <th key={'table-heading:' + heading + index}>
                                        {
                                            heading && heading.includes(`\n`)
                                                ?   heading.split(`\n`).reduce((acc, h, index, arr) => acc.concat(index === arr.length - 1 ? h : [h, <br/>]), [])
                                                :   heading
                                        }
                                    </th>
                                )
                            }
                        </tr>
                    </thead>
                }
                {
                    rows.length > 0 &&
                    <tbody>
                        {
                            rows.map((row, index) => 
                                <tr key={'table-row:' + row + index} style={{backgroundColor: colour === 'orange' ? '#964000' : colour}}>
                                    {
                                        row.map((value, index) => 
                                            <td key={'table-value:' + value + index}>{value}</td>
                                        )
                                    }
                                </tr>    
                            )
                        }
                    </tbody>
                }
            </table>
        </>
    );
}

export default Table;