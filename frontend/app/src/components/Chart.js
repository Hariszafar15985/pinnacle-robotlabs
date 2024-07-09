import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import HighchartsBoost from "highcharts/modules/boost";
import { cloneDeep } from "lodash";
import { useEffect, useRef, useState } from "react";

import { formatFloatWithDollarSign } from "helpers/number";

HighchartsBoost(Highcharts);

const month = [];
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sept";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";

const options = {
    chart: {
        height: 250,
        backgroundColor: '#263850',
        type: "column",
        zoomType: 'x',
    },
    title: {
        text: "",
    },
    yAxis: {
        title: "",
        gridLineDashStyle: "ShortDash",
        style: {
            fontSize: "0.5rem",
            color: "rgba(255, 255, 255, 0.5)"
        },
        labels: {
            formatter: function () {
                return formatFloatWithDollarSign(this.value, 0);
            },
            style: {
                fontSize: "0.5rem",
                color: "rgba(255, 255, 255, 0.5)"
            }
        },
    },
    xAxis: {
        lineWidth: 0,
        type: "datetime",
        labels: {
            step: 12,
            formatter: function () {
                return this.value;
            },
            style: {
                fontSize: "0.5rem",
                color: "rgba(255, 255, 255, 0.5)"
            }
        },
    },
    credits: {
        enabled: false,
    },
    tooltip: {
        // pointFormat: 'Net Profit: <b>{point.y:,.2f}</b><br/>',
        pointFormatter: function () {
            let tooltipText = 'Net Profit: ';
            return (tooltipText + '<b>' + formatFloatWithDollarSign(this.y) + '</b>');
        },
        share: false
    },
    plotOptions: {
        series: {
            marker: {
                enabled: false,
            },
            enableMouseTracking: true,
            // boostThreshold: 1000,
            // turboThreshold: 0,
            showInLegend: false,
            label: {
                connectorAllowed: false
            },
        },
    },
    // boost: {
    //     useGPUTranslations: true,
    //     // Chart-level boost when there are more than 5 series in the chart
    //     seriesThreshold: 5
    // },
    series: [
        {
            name: 'Value',
            showInLegend: false,
            color: "#85C3EA96",
            negativeColor: "#ff0000",
            borderWidth: 0,
            // borderRadius: '0.5%',
            // fillColor: {
            //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            //     stops: [
            //         [0, "rgba(133, 195, 234, 0.59)"],
            //         [0.6, "rgba(133, 195, 234, 0)"],
            //     ],
            // },
            // negativeFillColor: {
            //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            //     stops: [
            //         [0, "rgba(255, 18, 0, 1)"],
            //         [1, "rgba(255, 18, 0, 0)"],
            //     ],
            // },
            // lineWidth: 1
            data: [],
        },
    ],
};

const placeholderData = [
    [
        "01/01/2022",
        null
    ],
    [
        "02/01/2022",
        null
    ],
    [
        "03/01/2022",
        null
    ],
    [
        "04/01/2022",
        null
    ],
    [
        "05/01/2022",
        null
    ],
    [
        "06/01/2022",
        null
    ],
    [
        "07/01/2022",
        null
    ],
    [
        "08/01/2022",
        null
    ],
    [
        "09/01/2022",
        null
    ],
    [
        "10/01/2022",
        null
    ],
    [
        "11/01/2022",
        null
    ],
    [
        "12/01/2022",
        null
    ]
];

function Chart(props) {
    const { chartData, chartType, chartSubtype, selectedRobots } = props;
    const ref = useRef(null);

    const [chartOptions, setChartOptions] = useState(options);

    // calculate additional options for chart
    useEffect(() => {
        let DATA = chartData && chartData.length > 0 ? chartData : placeholderData;
        // let optionTemp = { ...options };
        let optionTemp = cloneDeep(options);

        if ((chartType === 'cumulative-net-profit' || chartType === 'cumulative-drawdown') && chartSubtype === 'individual' && !Array.isArray(chartData)) {
            let formattedData = [];
            for (const key in chartData) {
                formattedData.push({
                    name: key,
                    data: chartData[key],
                    tooltip: {
                        pointFormatter: function () {
                            const foundRobot = selectedRobots.find(robot => String(robot.id) === key);
                            let tooltipText = '</b><br/>Value: ';
                            switch (chartType) {
                                case 'cumulative-net-profit':
                                    tooltipText = '</b><br/>Net Profit: ';
                                    break;
                                case 'cumulative-drawdown':
                                    tooltipText = '</b><br/>Max Drawdown: ';
                                    break;
                                default:
                                    break;
                            }
                            return ('<b>' + (foundRobot.name || this.series?.name) + tooltipText + '<b>' + formatFloatWithDollarSign(this.y) + '</b>');
                        }
                    }
                })
            }
            optionTemp.series = formattedData;

            // format x-axis label
            optionTemp.xAxis.categories = formattedData[0].data.map((row) => {
                let d = new Date(row[0]);
                return month[d.getMonth()] + " " + d.getFullYear();
            });

            //Set DATA to a part of formattedData in order to be used below for other calculations
            DATA = formattedData[0].data;
        }
        else {
            optionTemp.series[0].data = DATA;

            // format x-axis label
            optionTemp.xAxis.categories = DATA.map((row) => {
                let d = new Date(row[0]);
                return month[d.getMonth()] + " " + d.getFullYear();
            });
        }

        // set plot lines and labels options
        let width = ref.current ? ref.current.offsetWidth : 0;
        if (width >= 0) {
            let gridWidth = Math.round(width / 12);
            let step = Math.round(DATA.length / 12);
            let plotLines = [];
            for (let i = 0; i < 12; i++) {
                if (i % 2 === 1) {
                    let data = {
                        color: "rgba(255,255,255, 0.1)",
                        width: gridWidth,
                        value: i * step,
                    };
                    plotLines.push(data);
                }
            }
            optionTemp.xAxis.plotLines = plotLines;
            optionTemp.xAxis.labels.step = step;
            // optionTemp.xAxis.categories.splice(0, DATA.length % 12);
        }

        switch (chartType) {
            case 'drawdown':
                // optionTemp.tooltip.pointFormat = 'Max Drawdown: <b>{point.y:,.2f}</b><br/>';
                optionTemp.tooltip.pointFormatter = function () {
                    let tooltipText = 'Max Drawdown: ';
                    return (tooltipText + '<b>' + formatFloatWithDollarSign(this.y) + '</b>');
                }
                break;
            case 'cumulative-drawdown':
                optionTemp.chart.type = chartSubtype === 'portfolio' ? 'area' : 'line';
                if (chartSubtype === 'portfolio') optionTemp.tooltip.pointFormatter = function () {
                    let tooltipText = 'Max Drawdown: ';
                    return (tooltipText + '<b>' + formatFloatWithDollarSign(this.y) + '</b>');
                }
                if (chartSubtype === 'individual') {
                    optionTemp.plotOptions.series.opacity = 2;
                    optionTemp.plotOptions.series.lineWidth = 2;
                    optionTemp.plotOptions.series.marker.enabled = true;
                    optionTemp.plotOptions.series.states = {
                        inactive: {
                            opacity: 0.5
                        }
                    };
                }
                break;
            case 'cumulative-net-profit':
                optionTemp.chart.type = chartSubtype === 'portfolio' ? 'area' : 'line';
                if (chartSubtype === 'individual') {
                    optionTemp.plotOptions.series.opacity = 2;
                    optionTemp.plotOptions.series.lineWidth = 2;
                    optionTemp.plotOptions.series.marker.enabled = true;
                    optionTemp.plotOptions.series.states = {
                        inactive: {
                            opacity: 0.5
                        }
                    };
                    // optionTemp.tooltip.formatter = function () {
                    //     const foundRobot = selectedRobots.find(robot => robot.id === this.name);
                    //     return [this.key, ('<br/><b>' + foundRobot ? foundRobot.name : this.series.name + '</b><br/>'), 'Net Profit: ' + formatFloatWithDollarSign(this.y)];
                    // }
                }
                break;
            default:
                break;
        }

        // console.log("///optionTemp", optionTemp);
        setChartOptions(optionTemp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartData, chartType, chartSubtype]);

    return (
        <div className="chart-container mt-[1rem]" ref={ref}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
    );
}

export default Chart;
