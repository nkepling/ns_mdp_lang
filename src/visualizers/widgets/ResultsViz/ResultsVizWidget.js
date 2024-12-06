/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Tue Dec 03 2024 17:04:59 GMT-0600 (Central Standard Time).
 */

define(['plotly',
<<<<<<< HEAD
    'css!./styles/ResultsVizWidget.css'], function (plotly) {
=======
    'blob/BlobClient',
    'css!./styles/ResultsVizWidget.css'], function (Plotly,BlobClient) {
>>>>>>> ff577babacc0aa6fdde7d36b20b2c4b7dd5d5ba0
    'use strict';

    var WIDGET_CLASS = 'results-viz';

    function ResultsVizWidget(logger, container, client) {
        this._logger = logger.fork('Widget');

        this._el = container;
        
        this._client = client;

        this.nodes = {};
        this._initialize();

        this._blobClient = new BlobClient({ logger: this._logger.fork('BlobClient') });

        this._logger.debug('ctor finished');
    }

    ResultsVizWidget.prototype._initialize = function () {
        var width = this._el.width(),
            height = this._el.height(),
            self = this;

        // set widget class
        this._el.addClass(WIDGET_CLASS);

        // Create a dummy header
<<<<<<< HEAD
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
=======
        this._el.append('<h3>NS-MDP Experiment Results Visualization</h3>');

        this._el.append('<div id="plot-container" style="width:100%; height:400px;"></div>');
        
        this.activeId = null;
        this.datas = {};
        this.logs = {};

        
>>>>>>> ff577babacc0aa6fdde7d36b20b2c4b7dd5d5ba0


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
            
            // Place holder log function... 

     
            // Fetch node data asynchronously
            this.loadNodeData(desc)
            .then((data) => {
                console.log('Loaded data for node:', desc.id, data);
                // Pass the loaded data to plotLogs
                this.plotLogs(data, desc);
            })
            .catch((error) => {
                console.error('Error loading data for node:', desc.id, error);
            });

            
            
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

    /***************************** Data Load */
    
    ResultsVizWidget.prototype.loadNodeData = function (desc) {
        //Load JSON experiment data from the node a
        var node_obj = this._client.getNode(desc.id);

        var results_hash = node_obj.getAttribute('exp_result');

        console.log('Node:', node_obj);
        console.log('Results Hash:', results_hash);

        if (results_hash) {
        
            return this._blobClient.getObjectAsJSON(results_hash)
            .then((jsonData) => {
                console.log('Fetched JSON Data:', jsonData);
                return jsonData; // Return the resolved JSON data
            })
            .catch((error) => {
                console.error('Error fetching JSON data:', error);
                throw error; // Re-throw the error for the caller to handle
            });
    
        }

    };

    /***************************** PLOT! */
    ResultsVizWidget.prototype.plotLogs = function (data,desc) {
        var self = this;
    
        self.clearPlot();
    
        // Define sample data for the line graph
        var data = [
            {
                x: [1, 2, 3, 4, 5], // X-axis values
                y: [10, 14, 18, 22, 26], // Y-axis values
                type: 'bar', // Plot type (scatter for line plot)
                mode: 'lines+markers', // Line plot with markers
                name: 'Sample Reward Plot'
            }
        ];
    
        // Define layout for the plot
        var layout = {
            title: 'Sample Reward Plot (Dummy values): ' + desc.name,
            xaxis: { title: 'Episode Number' },
            yaxis: { title: 'Cummulative Episode Reward' },
            showlegend: false
        };
    
        // Render the plot using Plotly
        Plotly.newPlot('plot-container', data, layout);
    };
    

    ResultsVizWidget.prototype.clearPlot = function () {
        if (this._el) {
            // Clear the plot container
            this._el.find('#plot-container').empty();
            // Add back the plot div
            this._el.find('#plot-container').append('<div id="plot"></div>');
        };
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
