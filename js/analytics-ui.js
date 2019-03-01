'use strict';

var analysisObjects = analysisObjects || {};

analysisObjects.miners = {

	neuralNTree: null,
	neuralNTreeSettings: null,
	decisionTree: null,
	decisionTreeSettings: null,
	anomaly: null,
	anomalySettings: null,
	charts: null,
	chartsSettings: null,
	settings: null,
	dataSet: null,
	curDataSet: null,
	groupDataSet: null,
	neuralNTreeHeaders: null,
	neuralNTreeNotes: null,
	apriori: null,
	ignoredAttributes: { 
	
		'id': true, 
		'wellPerformed': true, 
		'hiddenId': true, 
		'vector_id': true, 
		'session_id': true, 
		'users': true, 
		'timestamp': true,
		'anomaly': true 

	},
	classificationWellPerformed: {},
	minTime: null,
	maxTime: null,
	reducedTimeDataSet: null,
	resetDatasets: function() {

		analysisObjects.miners.dataSet = [];
		analysisObjects.miners.curDataSet = null;
		analysisObjects.miners.groupDataSet = null;
		analysisObjects.miners.reducedTimeDataSet = null;
		analysisObjects.miners.classificationWellPerformed = {};

	}

};

analysisObjects.uiConstants = {

	wrapper: '#analysis-content',

	settings: '#analysis-settings',

	removeContent: function() {

		if (tinymce.activeEditor)
			tinymce.activeEditor.remove();

		$(this.wrapper).html('');

		var $settingsContainer = $(this.settings);

		$settingsContainer.hide();

	}


};

analysisObjects.urls = {

	templateUrl: window.location.href.replace('index.html', '') + 'templates/',
	baseUrl: location.protocol === 'https:' ? 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/' : 'http://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/'

};

analysisObjects.dataFetchUrls = {

	snap: analysisObjects.urls.baseUrl + 'get_programming_vectors_pilot_2.php',
	uui: analysisObjects.urls.baseUrl + 'get_uui_vectors_pilot_2.php',
    	print: analysisObjects.urls.baseUrl + 'get_search_vectors_pilot_2.php',
    	brainstorm: analysisObjects.urls.baseUrl + 'get_brainstorm_vectors_pilot_2.php',
	todo: analysisObjects.urls.baseUrl + 'get_todo_vectors_pilot_2.php'
};

analysisObjects.notifyUrls = {

	snap: analysisObjects.urls.baseUrl + 'notify_programming.php',
	uui: analysisObjects.urls.baseUrl + 'notify_uui.php',
	print: analysisObjects.urls.baseUrl + 'notify_print.php',
	brainstorm: analysisObjects.urls.baseUrl + 'notify_brainstorm.php'

};

var Settings = function() {

};

Settings.prototype.reset = function() {

	analysisObjects.miners.settings = null;

	this.settings = null;

};

Settings.prototype.save = function() {

	analysisObjects.miners.settings = this;

};

var Association = function(confidence, support, debug, iterations) {

	var trainingSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	var inputArray = [];

	for (var i = 0; i < trainingSet.length; i++)
		inputArray.push(getInputVectorTextKey(trainingSet[i]));

	this.trainingSet = inputArray;

	this.apriori = new Apriori.Algorithm(confidence, support, debug, iterations).showAnalysisResultFromFile(this.trainingSet);

	this.save();

};

Association.prototype.save = function() {

	analysisObjects.miners.apriori = this;

};

Association.prototype.reset = function() {

	analysisObjects.miners.apriori = null;

	this.apriori = null;

};

var NeuralNTree = function(clusters, min, max, learningRate, dimensions, merge) {

	if (! analysisObjects.miners.neuralNTree) {

		var opt = {};

		opt.size = clusters * 2 + - 1;
		opt.dimensions = dimensions;
		opt.learningRate = learningRate;
		opt.scaleMin = min;
		opt.scaleMax = max;

		this.neuralNTree = new NNTFunctions.NeuralNTree(opt);

		this.save();

	} else {

		this.neuralNTree = analysisObjects.miners.neuralNTree.neuralNTree;

	}

};

NeuralNTree.prototype.save = function() {

	analysisObjects.miners.neuralNTree = this;

};

NeuralNTree.prototype.reset = function() {

	analysisObjects.miners.neuralNTree = null;

	analysisObjects.miners.neuralNTreeSettings = null;

	this.neuralNTree = null;

};

var DecisionTree = function() {

	this.data = JSON.parse(JSON.stringify(analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet));

	var data = [];

	for (var i = this.data.length - 1; i >= 0; i--) {

		if (typeof this.data[i]['wellPerformed'] === 'undefined'|| this.data[i]['wellPerformed'] == -2) {
			this.data.splice(i, 1);
		} else {
			this.data[i]['wellPerformed'] = parseInt(this.data[i]['wellPerformed']);
		}
	}

	for (var i = 0; i < this.data.length; i++) {

		var obj = {};

		for (var key in this.data[i]) {

			if (! (key in analysisObjects.miners.ignoredAttributes) || key === 'wellPerformed') {

				if (! isNaN(this.data[i][key]))
					obj[key] = parseFloat(this.data[i][key]);
				else
					obj[key] = this.data[i][key];

			}

		}

		data.push(obj);

	}

	this.data = data;

	this.config = {

		trainingSet: this.data,
		categoryAttr: 'wellPerformed',

	};

	this.decisionTree = new dt.DecisionTree(this.config);

	this.save();

};

DecisionTree.prototype.save = function() {

	analysisObjects.miners.decisionTree = this;

};

DecisionTree.prototype.reset = function() {

	analysisObjects.miners.decisionTree = null;

	this.decisionTree = null;

};

var Anomaly = function() {

	this.data = JSON.parse(JSON.stringify(analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet));

	var data = [];


	for (var i = this.data.length - 1; i >= 0; i--) {

		if (this.data[i]['anomaly'] == -1) {

			this.data[i]['anomaly'] = -1;

		} else if (this.data[i]['anomaly'] == 0) {

			this.data[i]['anomaly'] = 0;

		} else
			this.data[i]['anomaly'] = 1;

	}

	for (var i = 0; i < this.data.length; i++) {

		var obj = {};

		for (var key in this.data[i]) {

			if (! (key in analysisObjects.miners.ignoredAttributes) || key === 'anomaly') {

				if (! isNaN(this.data[i][key]))
					obj[key] = parseFloat(this.data[i][key]);
				else
					obj[key] = this.data[i][key];

			}

		}

		data.push(obj);

	}

	for (var i = data.length - 1; i >= 0; i--)
		if (data[i]['anomaly'] == 0)
			data.splice(i, 1);

	this.data = data;

	this.config = {

		trainingSet: this.data,
		categoryAttr: 'anomaly',

	};

	this.anomaly = new dt.DecisionTree(this.config);

	this.save();
};

Anomaly.prototype.save = function() {

	analysisObjects.miners.anomaly = this;

};

Anomaly.prototype.reset = function() {

	this.outlier = null;
	analysisObjects.miners.anomaly = null;

};

var Charts = function() {

};

function initSettings() {

	analysisObjects.uiConstants.removeContent();

	this.settings = analysisObjects.miners.settings || new Settings();

	this.createUI();

    logSettings();

};

initSettings.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.settings);

	$container.show();

	if ($container.html() === '')
		$container.load('templates/settings.html', function() {



		});

};

function initCluster() {

	analysisObjects.uiConstants.removeContent();

	initNeuralNTreeSettings();

	this.settings = analysisObjects.miners.neuralNTreeSettings || null;

	this.neuralNTree = analysisObjects.miners.neuralNTree || null;

	this.createUI();


};

function isChrome() {

	return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

};

initCluster.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.wrapper);

	var self = this;

	showLoader();

	var uri = isChrome() ? analysisObjects.urls.templateUrl + 'cluster.html' : 'templates/cluster.html';

	$container.load(uri, function() {

		if (self.settings) {

			if (self.settings.size)
				$('#max-clusters').val(self.settings.size);
			if (self.settings.alpha)
				$('#alpha').val(self.settings.alpha);
			//$('#alpha').val(self.settings.alpha);
			$('#dimensions').val(self.settings.dimensions);
			$('#min').val(self.settings.min);
			$('#max').val(self.settings.max);

		}

		if (self.neuralNTree) {

			self.visualiseNeuralNTree();

		}

		$('#forward').on('click', function(event) {

			showLoader();

			if (! self.neuralNTree) {

				try {

					var size 		= parseInt($('#max-clusters').val()),
						alpha 		= parseFloat($('#alpha').val()),
						dimensions 	= parseInt($('#dimensions').val()),
						min 		= parseFloat($('#min').val()),
						max 		= parseFloat($('#max').val());

					if (min == 0)
						min = 0.0000001;

					if (max == 0)
						max = 0.0000001;

				} catch (e) {

					alert('Not a valid Neural N-Tree parameter');

					return;

				}

				self.neuralNTree = new NeuralNTree(size, min, max, alpha, dimensions);

				self.settings = {};

				self.settings.size = size;
				self.settings.alpha = alpha;
				self.settings.dimensions = dimensions;
				self.settings.min = min;
				self.settings.max = max;

				analysisObjects.miners.neuralNTreeSettings = self.settings;

			}

			if (analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet) {

				var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

				for (var i = 0; i < dataSet.length; i++)
					self.neuralNTree.neuralNTree.forwardTrain(getInputVector(dataSet[i]));

				self.visualiseNeuralNTree();

			} else {

				alert('No data set specified');

			}

			hideLoader();

		});

		$('#backward').on('click', function(event) {

			showLoader();

			if (! self.neuralNTree) {

				try {

					var size 		= parseInt($('#max-clusters').val()),
						alpha 		= parseFloat($('#alpha').val()),
						dimensions 	= parseInt($('#dimensions').val()),
						min 		= parseFloat($('#min').val()),
						max 		= parseFloat($('#max').val());

					if (min == 0)
						min = 0.0000001;

					if (max == 0)
						max = 0.0000001;

				} catch (e) {

					alert('Not a valid Neural N-Tree parameter');

					return;

				}

				self.neuralNTree = new NeuralNTree(size, min, max, alpha, dimensions);

				self.settings = {};

				self.settings.size = size;
				self.settings.alpha = alpha;
				self.settings.dimensions = dimensions;
				self.settings.min = min;
				self.settings.max = max;

				analysisObjects.miners.neuralNTreeSettings = self.settings;

			}

			if (analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet) {

				var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

				for (var i = 0; i < dataSet.length; i++)
					self.neuralNTree.neuralNTree.backwardTrain(getInputVector(dataSet[i]));

				self.visualiseNeuralNTree();

			} else {

				alert('No data set specified');

			}

			hideLoader();

		});

		$('#cluster').on('click', function(event) {

			showLoader();

			if (! self.neuralNTree) {

				try {

					var size 		= parseInt($('#max-clusters').val()),
						alpha 		= parseFloat($('#alpha').val()),
						dimensions 	= parseInt($('#dimensions').val()),
						min 		= parseFloat($('#min').val()),
						max 		= parseFloat($('#max').val());

					if (min == 0)
						min = 0.0000001;

					if (max == 0)
						max = 0.0000001;

				} catch (e) {

					alert('Not a valid Neural N-Tree parameter');

					return;

				}

				self.neuralNTree = new NeuralNTree(size, min, max, alpha, dimensions);

				self.settings = {};

				self.settings.size = size;
				self.settings.alpha = alpha;
				self.settings.dimensions = dimensions;
				self.settings.min = min;
				self.settings.max = max;

				analysisObjects.miners.neuralNTreeSettings = self.settings;

			}

			if (analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet) {

				var clusters = [];

				var temp = Object.assign([], self.lastNodes);

				self.nodes.update(temp);

				var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

				for (var i = 0; i < dataSet.length; i++) {

					var out = self.neuralNTree.neuralNTree.cluster(getInputVector(dataSet[i])).index;

					if (! clusters[out])
						clusters[out] = [];

					clusters[out].push(getInputVector(dataSet[i]));

					var input = dataSet[i];

					var str = '';

					for (var j = 0, len = dataSet[i].length; j < len; j++)
						str += j < len - 1 ? dataSet[i][j].toFixed(4) +
							', ' : dataSet[i][j].toFixed(4);

					var size = self.nodes.get(out).size;
					var label = self.nodes.get(out).info;
					var featureCount = self.nodes.get(out).featureCount;
					var clusterLabel = self.nodes.get(out).label + '';

					featureCount++;

					if ($(label).prop('tagName') === 'INPUT') {

						label = $(label).val();

						label = '[' + label + ']';
						label = JSON.parse(label);


						var tableStr = '<table class=\'table\' style=\'width: 100%;\'><tr>';

						var headers = getHeaders(dataSet[i]);

						for (var j = 0, len = label.length; j < len; j++)
							tableStr += '<th>' + headers[j] + '</th>';

						tableStr += '<th>Users</th>';
						tableStr += '</tr><tr>';

						input = getInputVector(input);

						for (var j = 0; j < input.length; j++) {

							tableStr += '<td>' + +input[j].toFixed(4)  + '</td>';

						}

						if (analysisObjects.miners.neuralNTreeNotes && analysisObjects.miners.neuralNTreeNotes[i]) {

							tableStr += '<td>' + analysisObjects.miners.neuralNTreeNotes[i] + '</td>';

						} else if (dataSet[i]['users']) {

							tableStr += '<td>' + dataSet[i]['users'] + '</td>';

						} else if (dataSet[i]['id']) {

							tableStr += '<td>' + dataSet[i]['id'] + '</td>';

						} else {

							tableStr += '<td>No notes</td>';

						}

						tableStr += '</tr>';
						tableStr += '</table>';

					} else {

						var tempFirst = label.substring(0, label.length - 8);

						var newStr = '<tr>';

						input = getInputVector(input);

						for (var j = 0, len = input.length; j < len; j++)
							newStr += '<td>' + +input[j].toFixed(4) + '</td>';

						if (analysisObjects.miners.neuralNTreeNotes && analysisObjects.miners.neuralNTreeNotes[i]) {

							newStr += '<td>' + analysisObjects.miners.neuralNTreeNotes[i] + '</td>';

						} else if (dataSet[i]['users']) {

							newStr += '<td>' + dataSet[i]['users'] + '</td>';

						} else if (dataSet[i]['id']) {

							newStr += '<td>' + dataSet[i]['id'] + '</td>';

						} else {

							newStr += '<td>No notes</td>';

						}

						newStr += '</tr></table>';

						var tableStr = tempFirst + newStr;

					}

					label += '<br>' + JSON.stringify(input);
					clusterLabel = clusterLabel.split('\n')[0] + '\nn = ' + featureCount;
					size += 0.3;

					self.nodes.update({ id: out, size: size, points: self.nodes.get(out).currentPoints + '<hr>' + tableStr, info: tableStr, featureCount: featureCount, label: clusterLabel });

				}

				var silhouettes = [];

				for (var i = 0; i < clusters.length; i++)
					for (var j = 0; j < clusters.length; j++)
						if (i !== j) {

							if (clusters[i] && clusters[j] && clusters[i].length > 1 && clusters[j].length > 1) {

								var temp = self.silhouette(clusters[i], clusters[j]);

								silhouettes.push({ 'How similar the clusters are (-1 to 1)': temp, 'Cluster': i, 'Compared cluster': j });

							}

						}

				silhouettes.sort(function(a, b) {

					if (a['How similar the clusters are (-1 to 1)'] < b['How similar the clusters are (-1 to 1)'])
						return -1;
					else if (a['How similar the clusters are (-1 to 1)'] > b['How similar the clusters are (-1 to 1)'])
						return 1;
					else
						return 0;

				});

				self.createSilhouetteTable(silhouettes);

                logCluster();


			} else {

				alert('No data set specified');

			}

			hideLoader();

		});

    	$('#forward').click();
    	$('#cluster').click();

    	$('#reset-cluster').on('click', function(event) {

    		self.neuralNTree = null;

    		if (analysisObjects.miners.neuralNTree)
    			analysisObjects.miners.neuralNTree.reset();

    		setMessage('Neural N-Tree has been reseted');

    	});

		hideLoader();

	});

};

initCluster.prototype.createSilhouetteTable = function(array) {

	var str = '<table class=\'table\'><thead><tr>';

	for (var key in array[0])
		str += '<th>' + key + '</th>';

	str += '</tr><tbody>';

	for (var i = 0; i < array.length; i++) {

		str += array[i]['How similar the clusters are (-1 to 1)'] > 0 ? '<tr class=\'success\'>' : '<tr class=\'danger\'>';

		for (var key in array[i])
			str += '<td>' + +array[i][key].toFixed(2) + '</td>';

		str += '</tr>';

	}

	str += '</tbody></table>';

	$('#silhouettes').html(str);

};

initCluster.prototype.silhouette = function(codebook, feature) {

	this.euclidean = function(codebook, feature) {

		var sum = 0;

		for (var i = 0; i < codebook.length; i++) {

			sum += (codebook[i] - feature[i]) * (codebook[i] - feature[i]);

		}

		return Math.sqrt(sum);

	};

	var firstTotal = 0,
		divFirst = 0,
		secondTotal = 0,
		divSecond = 0;

		for (var i = 0; i < codebook.length; i++) {

			for (var j = 0; j < codebook.length; j++) {

					firstTotal += this.euclidean(codebook[i], codebook[j]);
					divFirst++;

			}

			for (var j = 0; j < feature.length; j++) {

				secondTotal += this.euclidean(codebook[i], feature[j]);
				divSecond++;

			}

		}

		firstTotal = firstTotal / divFirst;
		secondTotal = secondTotal / divSecond;

		return (secondTotal - firstTotal) / Math.max(firstTotal, secondTotal);

};

initCluster.prototype.visualHypertree = function() {

	var json = this.neuralNTree.neuralNTree.toJSON();

	var ht = new $jit.Hypertree({
    	injectInto: 'neural-n-tree-hyperbolic',
      	width: 800,
      	height: 800,
      	Node: {

         	 dim: 9,
          	color: "#f00"

      	},
      	Edge: {

         	lineWidth: 2,
          	color: "#088"

      	},
      	onBeforeCompute: function(node) {

      	},
      	onCreateLabel: function(domElement, node) {

    		domElement.innerHTML = node.name;

          	$jit.util.addEvent(domElement, 'click', function () {

              	ht.onClick(node.id, {

                  	onComplete: function() {

                  		var id = node.id.split('_')[0];

                  		var levels = self.neuralNTree.neuralNTree.levelOrder();

                  		for (var i = 0; i < levels.length; i++)
                  			for (var j = 0; j < levels[i].length; j++)
                  				if (id === levels[i][j].index) {

                  				}

		        		ht.controller.onComplete();

                  	}

              	});

          	});

      	},

      	onPlaceLabel: function(domElement, node){

          	var style = domElement.style;

          	style.display = '';
          	style.cursor = 'pointer';

          	if (node._depth <= 1) {

              	style.fontSize = "0.8em";
              	style.color = "#ddd";

          	} else if(node._depth == 2){

              	style.fontSize = "0.7em";
              	style.color = "#555";

          	} else {

              	style.display = 'none';

          	}

          	var left = parseInt(style.left);
          	var w = domElement.offsetWidth;
          	style.left = (left - w / 2) + 'px';

      	},

      	onComplete: function() {

      	}

    });
    ht.loadJSON(json);
    ht.refresh();
    ht.controller.onComplete();

    this.ht = ht;

};

initCluster.prototype.visualiseNeuralNTree = function() {

	var self = this;

	this.mergeIndices = {};

	this.nodes = new vis.DataSet();
	this.edges = new vis.DataSet();

	this.levelCount = 0;

	if (this.visual) {

		this.visual.destroy();

		this.visual = null;

	}

	this.lastNodes = [];

	var levels = this.neuralNTree.neuralNTree.levelOrder(this.neuralNTree.neuralNTree.rootNode);

	var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	for (var i = levels.length - 1; i >= 0; i--) {

		var flag = false;

		for (var j = 0, len = levels[i].length; j < len; j++)
			if (null !== levels[i][j])
				flag = true;

		if (! flag)
			levels.splice(i, 1);

	}

	var mins = [];

	for (var i = 0, len = levels[0][0].point.length; i < len; i++) {

		mins.push(levels[0][0].point[i]);

	}

	for (var i = 0, len = levels.length; i < len; i++)
		for (var j = 0, inLen = levels[i].length; j < inLen; j++) {

			if (levels[i][j] !== null)
				for (var k = 0, pointLen = levels[i][j].point.length; k < pointLen; k++) {

					if (mins[k] > levels[i][j].point[k])
						mins[k] = levels[i][j].point[k];

					if (mins[k] == 0)
						mins[k] = 0.00000001;

				}

			}

	var minRange = null,
		maxRange = null;

	for (var i = 0, outLen = levels.length; i < outLen; i++)
		for (var j = 0, inLen = levels[i].length; j < inLen; j++)
			if (levels[i][j] !== null && levels[i][j] !== this.neuralNTree.neuralNTree.rootNode &&
				levels[i][j] !== this.neuralNTree.neuralNTree.rootNode.left &&
				levels[i][j] !== this.neuralNTree.neuralNTree.rootNode.right) {

				var tempPoint = levels[i][j].point;

				var sim = NNTFunctions.util.similarity(tempPoint, mins);

				if (minRange === null)
					minRange = sim;
				if (maxRange === null)
					maxRange = sim;

				if (minRange < sim)
					minRange = sim;
				if (maxRange > sim)
					maxRange = sim;

			}


	this.levelCount = levels.length;

	var headers = getHeaders(dataSet[0]);

	for (var i = 0, len = levels.length; i < len; i++) {

		for (var j = 0, levLen = levels[i].length; j < levLen; j++) {

			if (null !== levels[i][j]) {

				var str = '<input type=\'text\' style=\'width: 290px;\' value=\'';

				var point = levels[i][j].point;

				var inputStr = '<div class=\'nnt-point-container\'>';

				for (var k = 0, pointLen = point.length; k < pointLen; k++) {

					str += k !== pointLen - 1 ? point[k].toFixed(4) + ', ' : point[k].toFixed(4);
					inputStr += '<div class=\'input-group\'><span class=\'input-group-addon\'>' + headers[k] + '</span>' + '<input type=\'text\' id=\'node-index_' + k + '_' + levels[i][j].index + '\' class=\'node-index\' onchange=\'pointChange(this)\'></div>';


				}

				inputStr += '</div>';

				str += '\' placeholder=\'point\' id=\'node-index_' + levels[i][j].index + '\' class=\'node-index\' onchange=\'pointChange(this)\'>';

				var sim = NNTFunctions.util.similarity(point, mins);


				sim = parseInt(NNTFunctions.util.convertRange([sim], [minRange, maxRange], [0, 255]));


				var nodeHeader = levels[i][j].isTerminal ? 'Terminal ' + levels[i][j].index : 'Node ' + levels[i][j].index;

				if (sim < 0)
					sim = 0;
				else if (sim > 255)
					sim = 255;

				var colRed = 255 - sim;
				var colGreen = sim;
				var colBlue = 255 - sim;

				var col = 'rgba(' + colRed + ',' + colGreen + ',' + colBlue +',1)';

				if (levels[i][j].mergeIndex) {

					this.mergeIndices[levels[i][j].mergeIndex] = true;

				}

				this.nodes.add({ id: levels[i][j].index, label: levels[i][j].index, level: i, info: str, points: inputStr, size: 25, shape: 'square', featureCount: 0,
					color: col, nodeHeader: nodeHeader, cid: levels[i][j].mergeIndex, currentPoints: inputStr });

				this.lastNodes.push({ id: levels[i][j].index, label: levels[i][j].index, level: i, info: str, points: inputStr, size: 25, shape: 'square', featureCount: 0,
					color: col, nodeHeader: nodeHeader, cid: levels[i][j].mergeIndex, currentPoints: inputStr });

				if (null !== levels[i][j].parent)
					this.edges.add({ from: levels[i][j].index, to: levels[i][j].parent.index });

			}

		}

	}

	var container = document.getElementById('neural-n-tree-visual');
	var data = {

		nodes: this.nodes,
		edges: this.edges

	};

	var options = {

		edges: {
        	smooth: {
        		type: 'cubicBezier',
                forceDirection: 'vertical',
                roundness: 0.4
            }
        },
        layout: {
            hierarchical: {
                direction: 'UD'
            }
        },
        physics: false

	};

	this.visual = new vis.Network(container, data, options);

	this.visual.on('click', function(properties) {

		var ids = properties.nodes;

		var clickNodes = self.nodes.get(ids);

		if (! clickNodes || ! clickNodes[0])
			return;

		if (clickNodes && clickNodes[0] && clickNodes[0].points) {

			var str = clickNodes[0].points;
			var header = clickNodes[0].nodeHeader;
			var $dialog = $('<div class=\'change-nnt-point\'></div>')
				.html(str)
					.dialog({
						width: 750,
						height: 600,
						closeOnEscape: false,
						title: header,
						close: function() {

							$(this).dialog('destroy').remove();

						}
					});


			var nodePoint = self.neuralNTree.neuralNTree.nodesByIndex([ids[0]]).point;

			for (var i = 0, len = nodePoint.length; i < len; i++)
				nodePoint[i] = parseFloat(nodePoint[i]);


			var nodes = $('.change-nnt-point .node-index');

			var arr = [];

			for (var key in nodes) {

				if (nodes.hasOwnProperty(key) && nodes[key].nodeName === 'INPUT') {
					arr.push(nodes[key]);
				}

			}

			for (var i = arr.length - 1; i >= 0; i--)
				if (arr[i].id.split('_')[2] != ids[0])
					arr.splice(i, 1);

			for (var i = 0; i < arr.length; i++) {
			
				arr[i].value = nodePoint[i] == 0 ? nodePoint[i] : nodePoint[i].toFixed(4);

			}
		}

	});
};

function initClassification() {

	analysisObjects.uiConstants.removeContent();

	this.classification = analysisObjects.miners.decisionTree || new DecisionTree();

	this.createUI();


};

initClassification.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.wrapper);

	var self = this;

	showLoader();

	var uri = isChrome() ? analysisObjects.urls.templateUrl + 'classification.html' : 'templates/classification.html';

	$container.load(uri, function() {

		self.tree = self.classification.decisionTree;

		self.nodes = new vis.DataSet();
		self.edges = new vis.DataSet();

		self.levelCount = 0;

		if (self.visual) {

			self.visual.destroy();

			self.visual = null;

		}

		var levels = getLevelOrder(self.tree.root);

		for (var i = 0, len = levels.length; i < len; i++) {

			self.levelCount++;

			for (var j = 0, levLen = levels[i].length; j < levLen; j++) {

				if (null !== levels[i][j] && 'undefined' !== typeof levels[i][j]) {

					var plus = 1;

					var cur = levels[i][j].parent;

					while (levels[i].indexOf(cur) > -1) {

						plus++;

						cur = cur.parent;

					}

					var predicateName = levels[i][j].predicateName;

					var predicateString = '';

					if (predicateName === '>=')
						predicateString = ' is greater than or equal to ';
					else if (predicateName === '<=')
						predicateString = ' is less than or equal to ';
					else if (predicateName === '==')
						predicateString = ' is equal to ';
					else
						predicateString = ' is not equal to ';

					var pivot = levels[i][j].pivot;

					if (! isNaN(pivot))
						pivot = parseFloat(pivot).toFixed(2);

					self.nodes.add({ label: ! levels[i][j].category ? levels[i][j].attribute + predicateString + pivot :
						levels[i][j].category == 1 ? 'well' : levels[i][j].category == 0 ? 'neurtral' : 'not well', level: self.levelCount + plus, id: levels[i][j].index, size: 25, shape: 'square', featureCount: 0,
						color: levels[i][j].category == 1 ? 'green' : levels[i][j].category == 0 ? 'blue' : levels[i][j].category ? 'red' : ! levels[i][j].noMatch ? 'yellow' : 'orange',
						info: levels[i][j].pivot, predicate: levels[i][j].predicateName, nodeId: levels[i][j].index, attribute: levels[i][j].attribute, category: levels[i][j].category });

					var edgeLabel = levels[i][j].noMatch ? 'no' : 'yes';

					if (null !== levels[i][j].parent && 'undefined' !== typeof levels[i][j].parent)
						self.edges.add({ from: levels[i][j].index, to: levels[i][j].parent.index, label: edgeLabel });

				}

			}

		}


		var container = document.getElementById('display-tree');

		var data = {

			nodes: self.nodes,
			edges: self.edges

		};

		var options = {

			edges: {

        		smooth: {

        			type: 'cubicBezier',
                	forceDirection: 'vertical',
                	roundness: 0.4

            	}

        	},

        	layout: {

            	hierarchical: {

                	direction: 'UD',
			nodeSpacing: 300			

            	}

        	},

        	physics: {
        	
        		enabled: false
        	
        	}

		};

		self.visual = new vis.Network(container, data, options);

        	self.visual.on('afterDrawing', function(canvas) {

            		logClassification();

        	});


		if (automatic) {

			var curDataset = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

			var data = [];


			for (var i = 0; i < curDataset.length; i++) {

				var obj = {};

				for (var key in curDataset[i]) {

					if (key === 'users' || ! (key in analysisObjects.miners.ignoredAttributes) &&
						key !== 'wellPerformed') {

						obj[key] = curDataset[i][key];

					}

				}

				data.push(obj);

			}

			var userList = [];

			for (var i = 0; i < data.length; i++) {

				var predict = analysisObjects.miners.decisionTree.decisionTree.predict(data[i]);

				$('#users').html('');

				var userObj = {};

				userObj['users'] = data[i]['users'];
				userObj['status'] = predict;

				userList.push(userObj);


			}

			generateUserList(userList);

		}

		self.visual.on('click', function(properties) {

			var ids = properties.nodes;
			var clickNodes = self.nodes.get(ids);

			if (! clickNodes || ! clickNodes[0])
				return;

			if (clickNodes && clickNodes[0] && clickNodes[0].info) {

				var featureValue = ! isNaN(clickNodes[0].info) ? parseFloat(clickNodes[0].info).toFixed(2) : clickNodes[0].info;	
				var str = 'Feature value <input class=\'pivot\' value=\'' + featureValue + '\' id=\'pivot_' + clickNodes[0].nodeId + '\'>' +
					'<br>';

				if (clickNodes[0].predicate === '==')
					str += 'How to compare <select id=\'predicate_' + clickNodes[0].nodeId + '\' class=\'predicate\'><option value=\'==\' selected=\'selected\'>equal</option><option value=\'!=\'>not equal</option><option value=\'>=\'>greater than or equal</option><option value=\'<=\'>less than or equal</option></select>';
				else if (clickNodes[0].predicate === '>=')
					str += 'How to compare <select id=\'predicate_' + clickNodes[0].nodeId + '\' class=\'predicate\'><option value=\'==\'>equal</option><option value=\'!=\'>not equal</option><option value=\'>=\' selected=\'selected\'>greater than or equal</option><option value=\'<=\'>less than or equal</option></select>';
				else if (clickNodes[0].predicate === '<=')
					str += 'How to compare <select id=\'predicate_' + clickNodes[0].nodeId + '\' class=\'predicate\'><option value=\'==\'>equal</option><option value=\'!=\'>not equal</option><option value=\'>=\'>greater than or equal</option><option value=\'<=\' selected=\'selected\'>less than or equal</option></select>';
				else
					str += 'How to compare <select id=\'predicate_' + clickNodes[0].nodeId + '\' class=\'predicate\'><option value=\'==\'>equal</option><option value=\'!=\' selected=\'selected\'>not equal</option><option value=\'>=\'>greater than or equal</option><option value=\'<=\'>less than or equal</option></select>';


				str += '<br>';

				str += 'Feature <select id=\'attribute_' + clickNodes[0].nodeId + '\' class=\'attribute\'>';

				for (var key in analysisObjects.miners.dataSet[0]) {

					if (! (key in analysisObjects.miners.ignoredAttributes))
						str += clickNodes[0].attribute == key ? '<option value=\'' + key + '\' selected=\'selected\'>' + key + '</option>' : '<option value=\'' + key + '\'>' + key + '</option>';

				}

				str += '</select>';


				var $dialog = $('<div></div>')
					.html(str)
						.dialog({
							width: 300,
							height: 400,
							closeOnEscape: false,
							close: function() {

								$(this).dialog('destroy').remove();

							}
						});

				$('.pivot').on('change', function(event) {

					var id = event.target.id;

					var nodeId = id.split('_')[1];

					var levels = getLevelOrder(self.tree.root);

					for (var i = 0; i < levels.length; i++) {

						for (var j = 0; j < levels[i].length; j++) {

							if (levels[i][j])
								if (levels[i][j].index == nodeId)
									levels[i][j].pivot = $('#' + id).val();


						}

					}

					self.createUI();

				});

				$('.predicate').on('change', function(event) {

					var id = event.target.id;

					var nodeId = id.split('_')[1];

					var levels = getLevelOrder(self.tree.root);

					for (var i = 0; i < levels.length; i++) {

						for (var j = 0; j < levels[i].length; j++) {

							if (levels[i][j] && levels[i][j].index == nodeId) {

								levels[i][j].predicateName = $('#' + id).val();

							}


						}

					}

					self.createUI();

				});

				$('.attribute').on('change', function(event) {

					var id = event.target.id;

					var nodeId = id.split('_')[1];

					var levels = getLevelOrder(self.tree.root);

					for (var i = 0; i < levels.length; i++) {

						for (var j = 0; j < levels[i].length; j++) {

							if (levels[i][j] && levels[i][j].index == nodeId)
								levels[i][j].attribute = $('#' + id).val();


						}

					}

					self.createUI();

				});

			} else {

				var str = clickNodes[0].category == 1 ? '<select id=\'category_' + clickNodes[0].nodeId + '\' class=\'category\'><option value=\'1\' selected=\'selected\'>Good</option><option value=\'0\' selected=\'selected\'>Medium</option><option value=\'-1\'>Bad<option></select>' :
					'<select id=\'category_' + clickNodes[0].nodeId + '\' class=\'category\'><option value=\'1\'>Good</option><option value=\'0\'>Medium</option><option value=\'-1\' selected=\'selected\'>Bad<option></select>' ;

				var $dialog = $('<div></div>')
					.html(str)
					.dialog({
						width: 300,
						height: 400,
						closeOnEscape: false,
						close: function() {

							$(this).dialog('destroy').remove();

						}
				});

				$('.category').on('change', function(event) {

					var id = event.target.id;

					var nodeId = id.split('_')[1];

					var levels = getLevelOrder(self.tree.root);

					for (var i = 0; i < levels.length; i++) {

						for (var j = 0; j < levels[i].length; j++) {

							if (levels[i][j] && levels[i][j].index == nodeId)
								levels[i][j].category = parseInt($('#' + id).val());


						}

					}

					self.createUI();

				});

			}

		});

		self.generateClassificationTable();

		hideLoader();

	});

};

initClassification.prototype.generateClassificationTable = function() {

	var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	var data = [];

	for (var i = 0; i < dataSet.length; i++) {

		var obj = {};

		for (var key in dataSet[i]) {

			if (key === 'users' || ! (key in analysisObjects.miners.ignoredAttributes) &&
				key !== 'wellPerformed') {

				obj[key] = dataSet[i][key];

			}

		}

		data.push(obj);

	}


	var str = '<table id=\'c-table\' class=\'table\'><thead><tr>';

	for (var key in data[0]) {

		str += '<th>' + key + '</th>';

	}

	str += '</tr><tbody>';

	for (var i = 0; i < data.length; i++) {

		var predict = this.tree.predict(data[i]);

		var obj = data[i];

		str += predict == 1 ? '<tr class=\'success\'>' : predict == 0 ? '<tr>' : '<tr class=\'danger\'>';

		for (var key in obj) {

			if (! (key in analysisObjects.miners.ignoredAttributes) || key === 'users') {
			
				var value = obj[key];
				
				// console.log(value);

				value = ! isNaN(value) && value ? +value.toFixed(2) : value;

				str += '<td>' + value + '</td>';

			}

		}

		str += '</tr>';

	}

	str += '</tbody></table>';

	$('#classification-table').html(str);

	$('#c-table').tablesorter();



};

function initAnomaly() {

	analysisObjects.uiConstants.removeContent();

	this.createUI();


};

initAnomaly.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.wrapper);

	var self = this;

	showLoader();

	var uri = isChrome() ? analysisObjects.urls.templateUrl + 'anomaly.html' : 'templates/anomaly.html';

	$container.load(uri, function() {

		if (! analysisObjects.miners.anomaly) {

			if (analysisObjects.miners.dataSet) {

				try {

					self.anomaly = new Anomaly();

				} catch (e) {

					hideLoader();

					return;

				}


			} else {

				alert('No data set loaded');

			}

		}

		$('#apply-anomaly').on('click', function(event) {

			showLoader();
			var curDataset = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

			var data = [];

			var str = '';

			for (var i = 0; i < curDataset.length; i++) {

				var obj = {};

				for (var key in curDataset[i]) {

					if (key === 'users' || ! (key in analysisObjects.miners.ignoredAttributes) &&
						key !== 'anomaly') {

						obj[key] = curDataset[i][key];

					}

				}

				data.push(obj);

			}

			var inputs = [];

			for (var i = 0; i < data.length; i++) {

				var status = self.anomaly.anomaly.predict(data[i]) == -1 ? true : false;

				inputs.push({ input: getInputVectorTextAllAttributes(curDataset[i]), status: status });

			}

			str = '<table id=\'a-table\' class=\'table\'><thead><tr>';

			var headers = getKeysAllAttributes(curDataset[0]);

			for (var i = 0; i < headers.length; i++)
				str += '<th>' + headers[i] + '</th>';

			str += '</tr></thead><tbody>';

			for (var i = 0; i < inputs.length; i++) {

				str += inputs[i].status ? '<tr class=\'danger\'>' : '<tr class=\'success\'>';

				for (var j = 0; j < inputs[i].input.length; j++) {
					if (inputs[i].input[j] == 0.000001)
						inputs[i].input[j] = 0;

					if (! isNaN(inputs[i].input[j]) && inputs[i].input[j])
						str += '<td>' + +inputs[i].input[j].toFixed(2) + '</td>';
					else
						str += '<td>' + inputs[i].input[j] + '</td>';
					

				}
				str += '</tr>';

			}

			str += '</tbody></table>';

			$('#anomaly-table').html(str);

			$('#a-table').tablesorter();

			hideLoader();

            logAnomaly();
			//	$('#apply-anomaly').click();

		});

		hideLoader();

		if (analysisObjects.miners.anomaly) {

			self.anomaly = analysisObjects.miners.anomaly;

			var th = analysisObjects.miners.anomaly.th || $('#anomaly-threshold').val();

			$('#anomaly-threshold').val(th);

			$('#apply-anomaly').click();

		}

	});

};

function initCharts() {

	this.createUI();

};

initCharts.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.wrapper);

	var self = this;

	showLoader();

	$('#charts-radar').remove();
  	$('#charts-line').remove();
	self.dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	self.curDataSet = [];

	var getRandomColor = function() {

		var red = Math.floor(Math.random() * 250);

		var green = Math.floor(Math.random() * 250);

		var blue = Math.floor(Math.random() * 250);

		return 'rgba(' + red + ',' + green + ',' + blue + ',0.3)';

	};

	for (var key in self.dataSet[0]) {

		var temp = [];

		if (isNaN(self.dataSet[0][key]) || key in analysisObjects.miners.ignoredAttributes)
			continue;

		for (var i = 0; i < self.dataSet.length; i++) {

			temp.push(self.dataSet[i][key]);

		}

		self.curDataSet.push({ label: key, data: temp, backgroundColor: getRandomColor() });

	}

	self.labels = [];

	for (var i = 0; i < self.dataSet.length; i++)
		self.labels.push(i + '');

	var obj = {

		type: 'radar',

		data: {
			labels: self.labels,
			datasets: self.curDataSet
		},
		options: {}

	};

	var objLine = {

		type: 'line',

		data: {

			labels: self.labels,
			datasets: self.curDataSet

		},

		options: {}


	};

	self.chartOptions = obj;
	self.radarChart = chart;
	self.lineChart = lineChart;

	hideLoader();
};

function initApriori() {

	analysisObjects.uiConstants.removeContent();

	this.createUI();

};

initApriori.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.wrapper);

	var self = this;

	var uri = isChrome() ? analysisObjects.urls.templateUrl + 'apriori.html' : 'templates/apriori.html';

	$container.load(uri, function() {

		$('#apriori-apply').on('click', function(event) {

			var minConfidence = $('#apriori-min-confidence').val();

			var minSupport = $('#apriori-min-support').val();

			var iterations = $('#apriori-iterations').val();

			try {

				minConfidence = parseFloat(minConfidence);
				minSupport = parseFloat(minSupport);
				iterations = parseInt(iterations);

			} catch (e) {

				alert('Not a proper apriori-value');
				return;

			}

			self.apriori = new Association(minConfidence, minSupport, false, iterations).apriori;

			self.buildUI();

		});

		if (analysisObjects.miners.apriori) {

			self.apriori = analysisObjects.miners.apriori.apriori;

			self.buildUI();

		}

		$('#apriori-apply').click();

	});


};

initApriori.prototype.buildUI = function() {

	var frequentItemSets = this.apriori.frequentItemSets;
	var associationRules = this.apriori.associationRules;

	var assoStr = '<table id=\'asso-table\' class=\'table\'><thead><tr><th>LHS</th><th>RHS</th><th>Confidence</th></tr></thead><tbody>';

	var nodes = [];
	var edges = [];

	var nodesObj = {};

	for (var i = 0; i < associationRules.length; i++) {

		var rule = associationRules[i];

		var lhs = {};
		lhs.id = rule.lhs.join();

		for (var j = 0; j < rule.lhs.length; j++)
			rule.lhs[j] = ! isNaN(rule.lhs[j]) ? +rule.lhs[j].toFixed(2) : rule.lhs[j];

		lhs.label = rule.lhs.join();

		var rhs = {};
		rhs.id = rule.rhs.join();

		for (var j = 0; j < rule.rhs.length; j++) 
                        rule.rhs[j] = ! isNaN(rule.rhs[j]) ? +rule.rhs[j].toFixed(2) : rule.rhs[j];

		rhs.label = rule.rhs.join();

		var edge = {};
		edge.from = lhs.id;
		edge.to = rhs.id;
		edge.arrows = 'from';

		if (! nodesObj[lhs.id])
			nodes.push(lhs);
		if (! nodesObj[rhs.id])
			nodes.push(rhs);
		edges.push(edge);

		nodesObj[lhs.id] = true;
		nodesObj[rhs.id] = true;

	}

	nodesObj = null;

	for (var key = 0; key < associationRules.length; key++) {

		var rule = associationRules[key];

		assoStr += '<tr><td>' + rule.lhs.join() + '</td><td>' + rule.rhs.join() + '</td><td>' + rule.confidence + '</td></tr>';

	}

	assoStr + '</tbody></table><br><br><br>';


	var freqStr = '<table id=\'freq-table\' class=\'table\'><thead><tr><th>Item</th><th>Support</th></tr></thead><tbody>';

	for (var key in frequentItemSets) {

		var freqArr = frequentItemSets[key];

		for (var item = 0; item < freqArr.length; item++) {

			var freqItem = freqArr[item];

			var itemStr = freqItem.itemSet.join();

			var support = freqItem.support;

			freqStr += '<tr><td>' + itemStr + '</td><td>' + support + '</td></tr>';

		}

	}

	freqStr += '</tbody></table>';

	var options = {};

	var data = { nodes: nodes, edges: edges };

	var container = document.getElementById('apriori-table');

	container.style.width = '900px';
	container.style.height = '900px';

	var network = new vis.Network(container, data, options);


	//$('#asso-table').tablesorter();

    network.on('afterDrawing', function(canvas) {

        logApriori();

    });

};

function parseTrainSet(event) {

	var file = event.target.files[0];

	if (file) {

		showLoader();

		var reader = new FileReader();

		reader.onload = function(e) {

			var fileContents = e.target.result;

			try {

				fileContents = fileContents.replace('\n', '');

				JSON.parseAsync(fileContents, function(json) {

					var obj = json;

					fetchDataSet(obj);
					initOptions(obj);

					$('.analysis-tools').show();
					$('#settings-div').fadeIn();

					hideLoader();

				});

			} catch (e) {

				alert('Not in a proper JSON-format.');


				return;

			}

		};

		reader.readAsText(file);

	} else {

		alert('Error while loading the input file.');

	}

};

function initOptions(obj) {

	showLoader();

	generateAttributeCheckboxes(obj[0]);
	generateGroupBySelect(obj);
	initTimePicker('#start-time', '#end-time');
	generateUserList(obj);

	hideLoader();

};

function initNeuralNTreeSettings() {

	var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	var minMax = getMinMax(dataSet);
	var dimensions = getInputVector(dataSet[0]).length;

	if (!analysisObjects.miners.neuralNTreeSettings)
		analysisObjects.miners.neuralNTreeSettings = {};

	analysisObjects.miners.neuralNTreeSettings.min = minMax.min;
	analysisObjects.miners.neuralNTreeSettings.max = minMax.max;
	analysisObjects.miners.neuralNTreeSettings.dimensions = dimensions;

};

function getHeaders(obj) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var headerArr = [];

	for (var key in obj) {

		if (! (key in ignoredAttributes) && ! isNaN(obj[key])) {

			headerArr.push(key);

		}

	}

	return headerArr;

};

function getHeadersText(obj) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var headerArr = [];

	for (var key in obj) {

		if (! (key in ignoredAttributes)) {

			headerArr.push(key);

		}

	}

	return headerArr;

};

function getMinMax(arr) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var minMax = {};

	var min,
		max;

	for (var i = 0; i < arr.length; i++) {

		var obj = arr[i];

		for (var key in obj) {

			if (! (key in ignoredAttributes) && ! isNaN(obj[key])) {

				if (! min)
					min = obj[key];

				if (! max)
					max = obj[key];

				if (min > obj[key])
					min = obj[key];

				if (max < obj[key])
					max = obj[key];

			}

		}

	}

	minMax.min = min;
	minMax.max = max;

	return minMax;

};

function getDimensions(obj) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var counter = 0;

	for (var key in obj) {

		if (! (key in ignoredAttributes) && ! isNaN(obj[key])) {

			counter++;

		}

	}

	return counter;

};

function getInputVector(obj) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var input = [];

	for (var key in obj) {

		if (! (key in ignoredAttributes) && ! isNaN(obj[key])) {

			//	obj[key] = 0.000001;

			input.push(parseFloat(obj[key]));



		}

	}

	return input;

};

function getInputVectorText(obj) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var input = [];

	for (var key in obj) {

		if (! (key in ignoredAttributes)) {

			input.push(obj[key]);

		}

	}

	return input;

};

function getInputVectorTextAllAttributes(obj) {

	var input = [];

	for (var key in obj) {

		if (key !== 'timestamp' && key !== 'hiddenId' && key !== 'wellPerformed' && key !== 'anomaly')
			input.push(obj[key]);
		else if (key === 'timestamp') {
			input.push(new Date(+obj[key]).toString());
		}
	}

	return input;

};

function getKeysAllAttributes(obj) {

	var keys = [];

	for (var key in obj) {

		if (key !== 'hiddenId' && key !== 'wellPerformed' && key !== 'anomaly')
			keys.push(key);

	}

	return keys;

};

function getInputVectorTextKey(obj) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var input = [];

	for (var key in obj) {

		if (! (key in ignoredAttributes)) {

			input.push(key + ': ' + obj[key]);

		}

	}

	return input;

};

function generateUserList(arr) {

	$('#users').html('');

	var userObj = {};

	for (var i = 0; i < arr.length; i++) {

		var obj = arr[i];

		if (obj['users']) {

			userObj[obj['users']] = obj['status'] ? obj['status'] : 0;

		}

	}

	var listStr = '<ul id=\'user-list\'>';

	var count = 0;

	for (var key in userObj) {

		var userClass = userObj[key] == 1 ? 'user-good' : userObj[key] == 0 ? 'user-medium' : 'user-bad';

		listStr += '<li onclick=\'sendMessage(this);\' class=\'ui-state-default ' + userClass + '\' id=\'user-list_' + key + '\'>' + key + '</li>';
		count++;

	}

	listStr += '</ul>';

	$('#users').html(listStr);

	$('#user-list').sortable();

	setMessage(count + ' users found');

};

function sendMessage(param) {

	var user = param.id.split('_')[1];

	bootbox.prompt({

		title: 'Send a message to ' + user, 
		inputType: 'textarea',
		callback: function(result) {

			var message = result;

			var sessionId = window.sessionStorage.getItem('sessionId');

			if (message) {

				$.ajax({

					type: 'POST',
					url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/put_student_message.php',
					data: 'user=' + user + '&message=' + message + '&sessionId=' + sessionId,
					success: function(data) { setMessage('Message has been sent to ' + user); },
					error: function(error) { alert('Error while sending a message.');  }

				});

			}

		}

	});

};

function initTimePicker() {
    $('#datetimepicker6').datetimepicker();
    $('#datetimepicker7').datetimepicker({
            useCurrent: false
    });

    $("#datetimepicker6").on("dp.change", function (e) {

        $('#datetimepicker7').data("DateTimePicker").minDate(e.date);

        var type = 'start-time';

        var dataset = reduceDataSetBasedOnTime(e.date._d, type);

        if (dataset) {

            analysisObjects.miners.reducedTimeDataSet = dataset;
            analysisObjects.miners.curDataSet = null;

            generateAttributeTable(analysisObjects.miners.reducedTimeDataSet);

        }


    });

    $("#datetimepicker7").on("dp.change", function (e) {

        $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);

        var type = 'end-time';

        var dataset = reduceDataSetBasedOnTime(e.date._d, type);

        if (dataset) {

            analysisObjects.miners.reducedTimeDataSet = dataset;
            analysisObjects.miners.curDataSet = null;

            generateAttributeTable(analysisObjects.miners.reducedTimeDataSet);

        }

    });


};

function generateAttributeCheckboxes(obj) {

	$('#attributes').html('');

	var str = '<h3>Features included</h3><div>';

	for (var key in obj) {

		if (key === 'hiddenId')
			continue;

		if (key !== 'id' && key !== 'vector_id' && key !== 'session_id' && key !== 'users' && key !== 'timestamp')
			str += '<br><input type=\'checkbox\' class=\'us-attribute-box\' id=\'us-attribute-box_' + key + '\' checked>' + key;
		else
			str += '<br><input type=\'checkbox\' class=\'us-attribute-box\' id=\'us-attribute-box_' + key + '\'>' + key;

	}

	str += '</div></div>';

	$('#attributes').html(str);

	$('.us-attribute-box').on('change', function(event) {

		var $checked = $('#' + event.target.id).is(':checked');

		var attr = event.target.id.split('_');

		var str = '';

		attr.shift();

		attr = attr.join('_');

		if (! $checked)
			analysisObjects.miners.ignoredAttributes[attr] = true;
		else
			delete analysisObjects.miners.ignoredAttributes[attr];

		initNeuralNTreeSettings();

	});

};

function resetMiners() {

	for (var key in analysisObjects.miners) {

		if (analysisObjects.miners[key] &&
			'undefined' !== typeof analysisObjects.miners[key].reset) {

			analysisObjects.miners[key].reset();

		}

	}

	analysisObjects.miners.classificationWellPerformed = {};

	setMessage('Miners have been reseted');

};

function generateAttributeTable(arr) {

	for (var i = 0; i < arr.length; i++) {

		arr[i]['hiddenId'] = i;
		arr[i]['anomaly'] = 0;
		arr[i]['wellPerformed'] = -2;

	}

	$('#data-set-table').html('');

	var dataSetStr = '<table id=\'attribute-table\' class=\'table\'><thead><tr>';

	for (var key in arr[0]) {

		if (key !== 'anomaly' && key !== 'hiddenId' && key !== 'wellPerformed')
			dataSetStr += '<th>' + key + '</th>';

	}

	dataSetStr += '<th>Predict</th>';
	dataSetStr += '<th>Anomaly</th>';

	dataSetStr += '</tr></thead><tbody>';

	for (var i = 0; i < arr.length; i++) {

		dataSetStr += '<tr class=\'well-performed\' id=\'' + arr[i]['hiddenId'] + '\'>';

		for (var key in arr[i]) {

			if (key !== 'users' && key !== 'anomaly' && key !== 'hiddenId' && key !== 'wellPerformed' && key !== 'timestamp' && key !== 'notes') {
		
	
				value = arr[i][key];

				if (! isNaN(value) && value !== null) {

					value = parseFloat(value);

					value = +value.toFixed(2);

					dataSetStr += '<td>' + value + '</td>';

				} else {

					dataSetStr += '<td>' + value + '</td>';

				}
			

			} else if (key === 'notes') {
				
				var value = arr[i]['notes'];
			
				if (! value)
					value = 0;
			
				dataSetStr += '<td><input style=\'width: 30px;\' type=\'text\' value=\'' + value + '\' id=\'notes-' + arr[i]['hiddenId'] + '\' class=\'notes\'></td>';
            		
			} else if (key === 'timestamp') {

                		var date = new Date(parseInt(arr[i][key]));
                		var dateStr = date.toString();
                		dataSetStr += '<td>' + dateStr + '</td>';

            		} else if (key === 'users') {

				dataSetStr += '<td><button class=\'btn btn-link\' onclick=\'generateTimeLine(this)\' id=\'timeline-' + arr[i]['hiddenId'] + '\'>' + arr[i][key] + '</button></td>';

			}

		}

		dataSetStr += '<td><select id=\'option-' + arr[i]['hiddenId'] + '\' onchange=\'selectPerformance(this);\'><option value=\'-2\' selected=\'selected\'>Not included</option><option value=\'-1\'>Not performing well</option><option value=\'0\'>' +
			'Neutral</option><option value=\'1\'>Performing well</option></select></td>';

		dataSetStr += '<td><select id=\'anomaly-' + arr[i]['hiddenId'] + '\' onchange=\'selectAnomaly(this);\'><option value=\'0\' selected=\'selected\'>Not included</option><option value=\'1\'>Not an anomaly</option><option value=\'-1\'>Anomaly</option>';

		dataSetStr += '</tr>';

	}



	dataSetStr += '</tbody></table>';

	$('#data-set-table').html(dataSetStr);

	$('#attribute-table').tablesorter();

	$('.notes').on('change', function(event) {

		var value = event.target.value;
		var id = event.target.id.split('-')[1];

		for (var i = 0; i < analysisObjects.miners.dataSet.length; i++)
			if (analysisObjects.miners.dataSet[i].hiddenId === parseInt(id)) {
				analysisObjects.miners.dataSet[i].notes = parseFloat(value);
				break;
			}


	});

};

function selectPerformance(element) {

	var hiddenId = element.id.split('-')[1];

	var value = element.value;

	var dataset = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	for (var i = 0; i < dataset.length; i++)
		if (dataset[i]['hiddenId'] == hiddenId) {

			dataset[i]['wellPerformed'] = value;
			break;

		}


};

function selectAnomaly(element) {

	var hiddenId = element.id.split('-')[1];

	var value = element.value;

	var dataset = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	for (var i = 0; i < dataset.length; i++)
		if (dataset[i]['hiddenId'] == hiddenId) {

			dataset[i]['anomaly'] = value;
			break;

		}

};

function groupBy(arr, key) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var groupedArr = [];

	var keyObj = {};

	for (var i = 0; i < arr.length; i++) {

		var curObj = arr[i];

		var val = curObj[key];

		if (! keyObj[val]) {

			keyObj[val] = {};

			for (var objKey in curObj) {

				if (objKey !== key) {

					keyObj[val][objKey] = [];
					keyObj[val][objKey].push(curObj[objKey]);

				} else {
					keyObj[val][objKey] = [];
					keyObj[val][objKey].push(val);
				}
			}

		} else {

			for (var objKey in curObj) {

				if (objKey !== key) {

					if (keyObj[val][objKey])
						keyObj[val][objKey].push(curObj[objKey]);

				}

			}

		}

	}

	for (var objKey in keyObj) {

		groupedArr.push(keyObj[objKey]);

	}

	for (var i = 0; i < groupedArr.length; i++) {

		var obj = groupedArr[i];

		for (var objKey in obj) {

			var sum = 0;

			for (var j = 0; j < obj[objKey].length; j++)
				if (! isNaN(obj[objKey][j]))
					sum += parseFloat(obj[objKey][j]);

			sum = obj[objKey].length > 0 ? sum / obj[objKey].length : 0;

			groupedArr[i][objKey] = (objKey === 'id' || objKey in ignoredAttributes || objKey === 'users') ? obj[objKey][0] : sum;

		}

	}

	return groupedArr;

};

function groupBySum(arr, key) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var groupedArr = [];

	var keyObj = {};

	for (var i = 0; i < arr.length; i++) {

		var curObj = arr[i];

		var val = curObj[key];

		if (! keyObj[val]) {

			keyObj[val] = {};

			for (var objKey in curObj) {

				if (objKey !== key) {

					keyObj[val][objKey] = [];
					keyObj[val][objKey].push(curObj[objKey]);

				}  else {
					keyObj[val][objKey] = [];
					keyObj[val][objKey].push(val);
				}

			}

		} else {

			for (var objKey in curObj) {

				if (objKey !== key) {

					if (keyObj[val][objKey])
						keyObj[val][objKey].push(curObj[objKey]);

				}

			}

		}

	}

	for (var objKey in keyObj) {

		groupedArr.push(keyObj[objKey]);

	}

	for (var i = 0; i < groupedArr.length; i++) {

		var obj = groupedArr[i];

		for (var objKey in obj) {

			var sum = 0;

			for (var j = 0; j < obj[objKey].length; j++)
				if (! isNaN(obj[objKey][j]))
					sum += parseFloat(obj[objKey][j]);

			groupedArr[i][objKey] = (objKey === 'id' || objKey in ignoredAttributes || objKey === 'users') ? obj[objKey][0] : sum;

		}

	}

	return groupedArr;

};

function normalize(arr, key) {

	var ignoredAttributes = analysisObjects.miners.ignoredAttributes;

	var normalizedArr = [];

	for (var i = 0; i < arr.length; i++) {

		var normalizedObj = {};

		var norm = arr[i][key];

		var sum = arr[i][key];

		for (var objKey in arr[i]) {

			if (objKey !== key && objKey !== 'id' && ! (objKey in ignoredAttributes))
				normalizedObj[objKey] = arr[i][objKey] / sum;
			else if (objKey === 'id')
				normalizedObj['id'] = arr[i]['id'];
			else if (objKey in ignoredAttributes)
				normalizedObj[objKey] = arr[i][objKey];

		}

		normalizedArr.push(normalizedObj);

	}

	return normalizedArr;

};

function generateGroupBySelect(arr) {

	window.sessionStorage.setItem('groupBy', 'average');

	var groupByStr = '<h3>Display grouping by</h3><br><div class=\'radio\'><label><input type=\'radio\' name=\'group-by-results\' value=\'average\' checked>' +
		'By average</label><br><label><input type=\'radio\' name=\'group-by-results\' value=\'sum\'>By sum</label></div><br><h3>Group by</h3><div class=\'radio\'>';

	groupByStr += '<br><label><input type=\'radio\' name=\'group-by-radio\' id=\'radio_no-group\' value=\'no-group\' checked> No groupping </label>';

	for (var key in arr[0]) {

		if (key !== 'users')
			continue;

		if (key === 'hiddenId')
			continue;

		groupByStr += '<br><label><input type=\'radio\' name=\'group-by-radio\' id=\'radio_' + key + '\'value=\'' + key + '\'>' +
		key +
		'</label>';

	}

	groupByStr += '</div>';

	$('#group-by').html(groupByStr);

	$('input[type=radio][name=group-by-results]').on('change', function() {

		var value = $(this).val();

		window.sessionStorage.setItem('groupBy', value);

		value = $('input[type=radio][name=group-by-radio]:checked').val();

		if (value !== 'no-group') {

			var dataSet = analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

			if (window.sessionStorage.getItem('groupBy') === 'average')
				analysisObjects.miners.groupDataSet = groupBy(dataSet, value);
			else
				analysisObjects.miners.groupDataSet = groupBySum(dataSet, value);

			generateAttributeTable(analysisObjects.miners.groupDataSet);

			$('#normalize').show();

		} else {

			analysisObjects.miners.curDataSet = null;
			analysisObjects.miners.groupDataSet = null;

			var dataSet = analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

			analysisObjects.miners.groupDataSet = null;

			$('#normalize').hide();

			generateAttributeTable(dataSet);

		}

	});

	$('input[type=radio][name=group-by-radio]').on('change', function() {

		var value = $(this).val();

		if (value !== 'no-group') {

			var dataSet = analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

			if (window.sessionStorage.getItem('groupBy') === 'average')
				analysisObjects.miners.groupDataSet = groupBy(dataSet, value);
			else
				analysisObjects.miners.groupDataSet = groupBySum(dataSet, value);

			generateAttributeTable(analysisObjects.miners.groupDataSet);

			window.sessionStorage.setItem('groupped', true);

			$('#show-one').attr('disabled', false);

			$('#normalize').show();

		} else {

			$('#show-one').attr('disabled', true);

			analysisObjects.miners.curDataSet = null;
			analysisObjects.miners.groupDataSet = null;

			var dataSet = analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

			analysisObjects.miners.groupDataSet = null;

			$('#normalize').hide();

			generateAttributeTable(dataSet);

			window.sessionStorage.setItem('groupped', false);

		}

	});

};

function generateNormalize(arr) {

	var normalizeStr = '<h3>Percentage of the features by</h3><div class=\'radio\'>';

	normalizeStr += '<br><label><input type=\'radio\' name=\'normalize-radio\' id=\'normalize_no-normalize\' value=\'no-normalize\' checked> No normalizing </label>';

	for (var key in arr[0]) {

		if (key === 'hiddenId')
			continue;

		normalizeStr += '<br><label><input type=\'radio\' name=\'normalize-radio\' id=\'normalize_' + key + '\'value=\'' + key + '\'>' +
		key +
		'</label>';

	}

	normalizeStr += '</div>';

	$('#normalize').html(normalizeStr);

	$('#normalize').hide();

	$('input[type=radio][name=normalize-radio]').on('change', function() {

		if (! analysisObjects.miners.groupDataSet) {

			alert('Grouping has to be made before normalizing');
			return;

		}

		var value = $(this).val();

		if (value !== 'no-normalize')
			analysisObjects.miners.curDataSet = normalize(analysisObjects.miners.groupDataSet, value);
		else
			analysisObjects.miners.curDataSet = analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

		generateAttributeTable(analysisObjects.miners.curDataSet);

		initNeuralNTreeSettings();

	});

};

function convertMillisToDate(millis) {

	var date = new Date(millis);

	var hours = date.getHours();

	var suffix = (hours >= 12)? 'PM' : 'AM';

    hours = (hours > 12)? hours - 12 : hours;

    hours = (hours == '00') ? 12 : hours;

    var minutes = date.getMinutes();

    minutes = minutes <= 9 ? '0' + minutes : minutes;

    return hours + ':' + minutes + ' ' + suffix;

};


function reduceDataSetBasedOnTime(dateText, inst) {

	var minutesOfDay = function(m) {

  		return m.getMinutes() + m.getHours() * 60;

	};
	var date = dateText;

	if (! dateText) {

		analysisObjects.miners.reducedTimeDataSet = null;

		generateAttributeTable(analysisObjects.miners.dataSet);

		if (inst === 'start-time')
			analysisObjects.miners.minTime = null;
		else if (inst === 'end-time')
			analysisObjects.miners.maxTime = null;

		return;

	}

	switch (inst) {

		case 'start-time':
			analysisObjects.miners.minTime = date;
			break;
		case 'end-time':
			analysisObjects.miners.maxTime = date;
			break;

	}

	if (analysisObjects.miners.minTime
		|| analysisObjects.miners.maxTime) {

		var startTime,
			endTime;

		if (analysisObjects.miners.minTime)
            startTime = analysisObjects.miners.minTime;
        if (analysisObjects.miners.maxTime)
	       endTime = analysisObjects.miners.maxTime;

		if (startTime > endTime) {

			alert('Start time filter larger than end time filter');
			return;

		}

		var dateArray = [];

		var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.dataSet;

		for (var i = 0; i < dataSet.length; i++) {

			var obj = dataSet[i];

            var time = obj['timestamp'];

			if (! time)
				time = obj['time'];

			var objTime = new Date(parseInt(time));
			if (startTime && endTime && objTime >= startTime && objTime <= endTime)
				dateArray.push(obj);
			else if (startTime && ! endTime && objTime >= startTime)
				dateArray.push(obj);
			else if (! startTime && endTime && objTime <= endTime)
				dateArray.push(obj);

		}

		return dateArray;

	}

	return null;

};

function pointChange(node) {

	var id = node.id;

	var value = $('#' + id).val();

	var index = id.split('_')[2];

	var arrayIndex = id.split('_')[1];

	var point = parseFloat(value);

	analysisObjects.miners.neuralNTree.neuralNTree.nodes[index].point[arrayIndex] = point;

	$('#' + id).val(value);

};

function fetchDataSet(data) {

	if (! analysisObjects.miners.dataSet || analysisObjects.miners.dataSet.length === 0)
		analysisObjects.miners.dataSet = [];

	var i = 0;

	for (; i < data.length; i++)
		analysisObjects.miners.dataSet.push(data[i]);
	
	for (var j = 0; j < analysisObjects.miners.dataSet.length; j++)
		analysisObjects.miners.dataSet[j]['notes'] = 0;

	generateAttributeTable(analysisObjects.miners.dataSet);

	initNeuralNTreeSettings();

	$('input[type=radio][name=group-by-results]').trigger('change');

	setMessage(i + ' data instances loaded');

};

function setMessage() {

	var messageStr = '';

	for (var i = 0; i < arguments.length; i++)
		messageStr += '<div class=\'alert alert-success alert-dismissable text-center\'><a href=\'#\' class=\'close\' data-dismiss=\'alert\' aria-label=\'close\'>&times;</a>' + arguments[i] + '</div>';



	$('#messages').append(messageStr);

	$('.alert').slideUp(2000);

};

function showLoader() {

	$('#loader').show();

};

function hideLoader() {

	$('#loader').hide();

};

function buildStudentModels() {



	var dt = new DecisionTree();

	var anomaly;

	try {

		anomaly = new Anomaly();

	} catch (e) { }

	var dataset = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;

	var studentModels = [];

	for (var i = 0; i < dataset.length; i++) {

		studentModels.push({ 'users': dataset[i].users, sessionId: window.sessionStorage.getItem('sessionId'), status: parseInt(dt.decisionTree.predict(dataset[i])) === 1 ? 1 : parseInt(dt.decisionTree.predict(dataset[i])) === 0 ? 0 : -1 });

		var isOk = parseInt(dt.decisionTree.predict(dataset[i])) === 1 ? 'wellPerformed' : parseInt(dt.decisionTree.predict(dataset[i])) === 0 ? 'Medium' : 'NotWellPerformed';

		var data = 	'users=' + dataset[i].users + '&sessionId=' + window.sessionStorage.getItem('sessionId') + '&classification=' + isOk;


		$.ajax({

			type: 'POST',
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/put_classification_vectors_pilot_2.php',
			data: data,
			success: function(data) { },
			error: function(error) {}

		});

	}

	if (anomaly) {

	for (var i = 0; i < dataset.length; i++) {

		var status = parseInt(anomaly.anomaly.predict(dataset[i]));

		status = status === 1 ? -1 : 1;

		for (var j = 0; j < studentModels.length; j++)
			if (studentModels[j].users === dataset[i].users) {

				var isOk = status === 1 ? 0 : 1;

				$.ajax({

					type: 'POST',
					url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/put_anomaly_vectors_pilot_2.php',
					data: 'users=' + dataset[i].users + '&sessionId=' + window.sessionStorage.getItem('sessionId') + '&anomalies=' + isOk,
					success: function(data) {},
					error: function(error) {}

				});

				studentModels[j].status += status;

			}

	}

	}

	function removeDuplicates( arr, prop ) {


  		var obj = {};

  		for ( var i = 0, len = arr.length; i < len; i++ ){

    		if(!obj[arr[i][prop]]) obj[arr[i][prop]] = arr[i];

  		}

  		var newArr = [];

  		for ( var key in obj ) newArr.push(obj[key]);

  		return newArr;

	}
	
	function convertRange( value, r1, r2 ) { 
    	return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
	}

	studentModels = removeDuplicates(studentModels, 'users');

	var max = -Infinity;

	for (var i = 0; i < studentModels.length; i++)
		if (studentModels[i].status > max)
			max = studentModels[i].status;

	for (var i = 0; i < studentModels.length; i++) {

		var student = studentModels[i];
		
		var status = convertRange(student.status, [ -2, 2 ], [ 0, 100 ]);
        

		var data = 'users=' + student.users + '&sessionId=' + window.sessionStorage.getItem('sessionId') + '&status=' + status;

		$.ajax({

			method: 'POST',
			url: 'http://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/put_student_models_pilot_2.php',
			data: data,
			success: function(data) {


			},
			error: function(error) {


			}

		});

	}

	dt.reset();
	if (anomaly)
		anomaly.reset();
};

function Reflect() {

	analysisObjects.uiConstants.removeContent();

	this.createUI();

};


Reflect.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.wrapper);

	showLoader();

	var uri = isChrome() ? analysisObjects.urls.templateUrl + 'options.html' : 'templates/options.html';

	$container.load(uri, function() {

		hideLoader();

	});

};

function generateTimeLine(param) {

	var id = param.id.split('-')[1];

	var user = '';

	for (var i = 0; i < analysisObjects.miners.dataSet.length; i++) {

		if (analysisObjects.miners.dataSet[i].hiddenId == id) {

			user = analysisObjects.miners.dataSet[i].users;	
			break;

		}

	}

	var userActions = [];

	for (var i = 0; i < analysisObjects.miners.dataSet.length; i++)
		if (analysisObjects.miners.dataSet[i].users == user)
			userActions.push(analysisObjects.miners.dataSet[i]);


	var dataset = [];


	for (var i = 0; i < userActions.length; i++) {

		var actions = userActions[i];

		var action = null;

		for (var key in actions) {

			if (key === 'timestamp' || key === 'wellPerformed' || key === 'hiddenId' || key === 'users')
				continue;

			if (actions[key])
				action = key;

		}

		var obj = {};

		obj.id = actions.hiddenId;
		obj.content = action;

		var millis = parseInt(actions.timestamp);

		var date = new Date(millis);

		obj.start = date.toString();

		dataset.push(obj);

	}

	dataset.sort(function(a, b) {

		return new Date(a.start) - new Date(b.start);

	});

	$('<div id=\'timeline-dialog-' + id + '\'></div>').dialog({

		width: 650,
		height: 600


	});

	new vis.Timeline(document.getElementById('timeline-dialog-' + id), dataset, {});
};
