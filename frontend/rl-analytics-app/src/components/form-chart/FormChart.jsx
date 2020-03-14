import React from 'react';

import { Line } from 'react-chartjs-2';

const COLOURS = [
    ['#1E90FF', '#00BFFF', '#87CEFA'],
    ['#FFA500', '#CD853F', '#A0522D']
];

const interpolateValue = (pointBefore, pointAfter, date) => {
    const fraction = (date.getTime() - pointBefore.date.getTime()) / (pointAfter.date.getTime() - pointBefore.date.getTime());
    const mmrDifference = pointAfter.value - pointBefore.value;
    return Math.round(pointBefore.value + (fraction * mmrDifference));
}

const FormChart = ({ players }) => {
    const playerData = players.map((teamPlayers, teamIndex) => teamPlayers.filter(player => !player.loading && !player.error && player.mmrOverTime && player.mmrOverTime.length > 0).map((player, playerIndex) => ({name: player.name, data: player.mmrOverTime.map(point => ({date: new Date(point.date), value: point.value})), colour: COLOURS[teamIndex][playerIndex]}))).flat();

    const labels = playerData.map(player => player.data.map(point => point.date)).flat().map(date => date.getTime()).filter((date, index, array) => array.indexOf(date) === index).map(time => new Date(time)).sort((a, b) => a-b);
    
    const datasets = playerData.map(player => {
        var i = 0;
        const data = labels.map(date => {
            if(date.getTime() < player.data[i].date.getTime()) {
                if(i === 0) {
                    return player.data[i].value;
                }
                return interpolateValue(player.data[i-1], player.data[i], date);
            } else if (date.getTime() === player.data[i].date.getTime()) {
                if(i < player.data.length - 1) {
                    i++;
                }
                return player.data[i-1].value;
            } else {
                return player.data[i].value;
            }
        });
        return {
            data,
            label: player.name,
            borderColor: player.colour,
            fill: false,
            lineTension: 0,
            pointRadius: 0
        };
    });
    
    const data = {labels: labels.map(date => `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear().toString().slice(2)}`), datasets};
    
    return (
        <Line
            data={data}
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
                            labelString: 'MMR', 
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

export default FormChart;