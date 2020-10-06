import { defineWidget } from 'widget-base-helpers/helpers/define-widget';
import Core from 'Core';
import on from 'dojo/on';
import { hitch } from 'dojo/_base/lang';

import '../../ChartJS.scss';

export default defineWidget('RadarChart.widget.RadarChart', null, {

    _chartType: 'radar',

    _chartClass: 'chartjs-radar-chart',

    _processData() {
        logger.debug(this.id + '._processData');

        let points = null;
        let set = {
            points: [],
        };
        const xlabels = [];
        let xlabelsSet = false;
        let color = '';
        let highlightcolor = '';
        let label = '';
        let j = null;
        let i = null;
        let k = null;
        let _set = null;
        let maxpoints = 0;

        this._chartData.datasets = [];
        this._chartData.labels = [];

        const sets = this._data.datasets = this._sortArrayObj(this._data.datasets);

        for (j = 0; j < sets.length; j++) {
            set = sets[ j ];
            if (set.points.length > maxpoints) {
                maxpoints = set.points.length;
            }
        }

        for (j = 0; j < sets.length; j++) {
            set = sets[ j ];

            points = [];

            if (0 === set.points.length) {
                for (k = 0; k < maxpoints; k++) {
                    points.push(0);
                }
                logger.warn(this.id + ' - empty dataset');
                continue;
            }

            set.points = this._sortArrayMx(set.points, this.sortingxvalue);
            color = set.dataset.get(this.seriescolor);
            highlightcolor = this.serieshighlightcolor ? set.dataset.get(this.serieshighlightcolor) : color;

            label = set.dataset.get(this.datasetlabel);

            for (i = 0; i < set.points.length; i++) {
                if (!xlabelsSet) {
                    xlabels.push(set.points[ i ].get(this.seriesxlabel));
                }

                points.push(+set.points[ i ].get(this.seriesylabel)); // Convert to integer, so the stackedbar doesnt break!
            }

            if (!xlabelsSet) {
                xlabelsSet = true;
            }

            _set = {
                label: label,
                backgroundColor: this.seriesColorReduceOpacity ? this._hexToRgb(color, '0.5') : color,
                borderColor: this.seriesColorReduceOpacity ? this._hexToRgb(color, '0.5') : color,
                pointColor: this.seriesColorReduceOpacity ? this._hexToRgb(color, '0.8') : color,
                hoverBackgroundColor: this.seriesColorReduceOpacity ? this._hexToRgb(color, '0.75') : highlightcolor,
                hoverBorderColor: this.seriesColorReduceOpacity ? this._hexToRgb(highlightcolor, '1') : highlightcolor,
                data: points,
            };
            this._chartData.datasets.push(_set);
            this._activeDatasets.push({
                dataset: _set,
                idx: j,
                active: true,
            });
        }
        this._chartData.labels = xlabels;

        this._createChart(this._chartData);

        this._createLegend(false);
    },

    _createChart(data) {
        logger.debug(this.id + '._createChart');

        if (this._chart) {
            this._restartChart(data);
        } else {

            const chartProperties = {
                type: this._chartType,
                data: data,
                options: this._chartOptions({

                    scale: {
                        ticks: {
                            yAxes: [{
                                ticks: {
                                    fontFamily: this._font,
                                    beginAtZero: this.scaleBeginAtZero,
                                },
                            }],
                        },
                    },

                    //Boolean - Whether to show lines for each scale point
                    scaleShowLine: this.scaleShowLine,

                    //Boolean - Whether we show the angle lines out of the radar
                    angleShowLineOut: this.angleShowLineOut,

                    //Boolean - Whether to show labels on the scale
                    scaleShowLabels: this.scaleShowLabels,

                    //String - Colour of the angle line
                    angleLineColor: this.angleLineColor,

                    //Number - Pixel width of the angle line
                    angleLineWidth: this.angleLineWidth,

                    //String - Point label font declaration
                    pointLabelFontFamily: this.pointLabelFontFamily,

                    //String - Point label font weight
                    pointLabelFontStyle: this.pointLabelFontStyle,

                    //Number - Point label font size in pixels
                    pointLabelFontSize: this.pointLabelFontSize,

                    //String - Point label font colour
                    pointLabelFontColor: this.pointLabelFontColor,

                    //Boolean - Whether to show a dot for each point
                    pointDot: this.pointDot,

                    //Number - Radius of each point dot in pixels
                    pointDotRadius: this.pointDotRadius,

                    //Number - Pixel width of point dot stroke
                    pointDotStrokeWidth: this.pointDotStrokeWidth,

                    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
                    pointHitDetectionRadius: this.pointHitDetectionRadius,

                    //Boolean - Whether to show a stroke for datasets
                    datasetStroke: this.datasetStroke,

                    //Number - Pixel width of dataset stroke
                    datasetStrokeWidth: this.datasetStrokeWidth,

                    //Boolean - Whether to fill the dataset with a colour
                    datasetFill: this.datasetFill,

                    legendCallback: this._legendCallback.bind(this),

                    animation: {
                        onComplete: hitch(this, this._animationComplete),
                    },
                }),
            };

            this._chart = new this._chartJS(this._ctx, chartProperties);

            // Add class to determain chart type
            this._addChartClass(this._chartClass);

            on(this._chart.chart.canvas, 'click', hitch(this, this._onClickChart));
        }
    },

}, Core);
