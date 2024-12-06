/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Tue Dec 03 2024 17:04:59 GMT-0600 (Central Standard Time).
 */

define(['plotly',
    'css!./styles/ResultsVizWidget.css'], function (plotly) {
    'use strict';

    var WIDGET_CLASS = 'results-viz';

    function ResultsVizWidget(logger, container) {
        this._logger = logger.fork('Widget');

        this._el = container;

        this.nodes = {};
        this._initialize();

        this._logger.debug('ctor finished');
    }

    ResultsVizWidget.prototype._initialize = function () {
        var width = this._el.width(),
            height = this._el.height(),
            self = this;

        // set widget class
        this._el.addClass(WIDGET_CLASS);

        // Create a dummy header
        this._el.append('<h3>Experiment Results Visualization:</h3>');

        this._el.append('<div id="plot-container" style="width:100%; height:400px;"></div>');
        
            // Render a Plotly line plot
        // var data = [
        //     {
        //         x: [1, 2, 3, 4, 5],
        //         y: [10, 14, 18, 22, 26],
        //         type: 'scatter',
        //         mode: 'lines+markers',
        //         name: 'Sample Line Plot'
        //     }
        // ];

        // var layout = {
        //     title: 'Line Plot Example',
        //     xaxis: { title: 'X Axis' },
        //     yaxis: { title: 'Y Axis' }
        // };

        // Plotly.newPlot('plot-container', data, layout);


        // Registering to events can be done with jQuery (as normal)
        this._el.on('dblclick', function (event) {
            event.stopPropagation();
            event.preventDefault();
            self.onBackgroundDblClick();
        });
    };

    ResultsVizWidget.prototype.onWidgetContainerResize = function (width, height) {
        this._logger.debug('Widget is resizing...');
    };

    // Adding/Removing/Updating items
    ResultsVizWidget.prototype.addNode = function (desc) {
        if (desc) {
            // Add node to a table of nodes
            var node = document.createElement('div'),
                label = 'children';

            if (desc.childrenIds.length === 1) {
                label = 'child';
            }

            this.nodes[desc.id] = desc;
            node.innerHTML = 'Adding node "' + desc.name + '" (click to view). It has ' +
                desc.childrenIds.length + ' ' + label + '.';

            this._el.append(node);
            node.onclick = this.onNodeClick.bind(this, desc.id);
        }
    };

    ResultsVizWidget.prototype.removeNode = function (gmeId) {
        var desc = this.nodes[gmeId];
        this._el.append('<div>Removing node "' + desc.name + '"</div>');
        delete this.nodes[gmeId];
    };

    ResultsVizWidget.prototype.updateNode = function (desc) {
        if (desc) {
            this._logger.debug('Updating node:', desc);
            this._el.append('<div>Updating node "' + desc.name + '"</div>');
        }
    };

    /* * * * * * * * Visualizer event handlers * * * * * * * */

    ResultsVizWidget.prototype.onNodeClick = function (/*id*/) {
        // This currently changes the active node to the given id and
        // this is overridden in the controller.
    };

    ResultsVizWidget.prototype.onBackgroundDblClick = function () {
        this._el.append('<div>Background was double-clicked!!</div>');
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    ResultsVizWidget.prototype.destroy = function () {
    };

    ResultsVizWidget.prototype.onActivate = function () {
        this._logger.debug('ResultsVizWidget has been activated');
    };

    ResultsVizWidget.prototype.onDeactivate = function () {
        this._logger.debug('ResultsVizWidget has been deactivated');
    };

    return ResultsVizWidget;
});
