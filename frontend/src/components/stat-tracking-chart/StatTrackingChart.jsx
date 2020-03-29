import React from 'react';

import { Line } from 'react-chartjs-2'; 

// data should be in form [{ name: *player username*, colours: [*dark colour*, *light colour*], data: [{ date: *date*, games: *number of games*, stat: *value of stat* }]}]
const StatTrackingChart = ({ data, statName }) => {

    const labels = [];
    data.forEach(playerData => playerData.data.forEach(datum => {
        if (!labels.includes(datum.date)) {
            labels.push(datum.date);
        }
    }));
    labels.sort((a,b) => new Date(a) - new Date(b));

    const datasets = [];
    data.forEach(playerData => {
        // var i = 0;
        const data = playerData.data.length === 0
                        ?   []
                        :   labels.map(date => {
                                const point = playerData.data.filter(datum => datum.date === date)[0];
                                return {
                                    games: point ? point.games : undefined,
                                    stat: point ? point.stat : undefined
                                }
                            });
        
        const gamesDataset = {
            data: data.map(datum => datum.games),
            label: `${playerData.name} - Games`,
            borderColor: playerData.colours[0],
            fill: false,
            lineTension: 0,
            // pointRadius: 0
        };

        const statDataset = {
            data: data.map(datum => datum.stat),
            label: `${playerData.name} - ${statName}`,
            borderColor: playerData.colours[1],
            fill: false,
            lineTension: 0,
            // pointRadius: 0
        };

        datasets.push(gamesDataset, statDataset);
    })


    const chartData = {
        labels: labels.map(label => new Date(label)).map(date => `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear().toString().slice(2)}`),
        datasets
    };

    return (
        <Line
            data={chartData}
            options={{
                // tooltips: {
                //     enabled: false
                // },
                // hover: {
                //     mode: null
                // },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true, 
                            labelString: 'Frequency', 
                            fontSize: 15
                        },
                        ticks: {
                            precision: 0
                        }
                    }]
                }
            }} />
    );
}

export default StatTrackingChart;