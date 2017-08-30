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
	ignoredAttributes: { 'id': true, 'wellPerformed': true, 'hiddenId': true, 'vector_id': true, 'session_id': true },
	classificationWellPerformed: {},
	minTime: null,
	maxTime: null,
	reducedTimeDataSet: null

};

analysisObjects.uiConstants = {

	wrapper: '#analysis-content',
	
	settings: '#analysis-settings',
	
	removeContent: function() {
	
		$(this.wrapper).html('');
		
		var $settingsContainer = $(this.settings);
	
		$settingsContainer.hide();
	
	}


};

analysisObjects.urls = {

	templateUrl: window.location.href.replace('index.html', '') + 'templates/'

};

var Settings = function() {

	// TODO: settings object

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

	this.data = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;
	
	var data = [];
	
	for (var i = 0; i < this.data.length; i++) {
	
		if (this.data[i]['hiddenId'] in analysisObjects.miners.classificationWellPerformed) {
		
			this.data[i]['wellPerformed'] = 1;
		
		} else {
		
			this.data[i]['wellPerformed'] = 0;
		
		}
	
	}
	
	for (var i = 0; i < this.data.length; i++) {
	
		var obj = {};
		
		for (var key in this.data[i]) {
		
			if (! (key in analysisObjects.miners.ignoredAttributes) || key === 'wellPerformed') {
				
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

	this.outlier = outlier;
	
	this.dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;
	
	var data = [];
	
	for (var i = 0; i < this.dataSet.length; i++) {
	
		var inputArray = getInputVector(this.dataSet[i]);
		
		data.push(inputArray);
	
	}
	
	this.dataSet = data;
	
	for (var i = this.dataSet.length - 1; i >= 0; i--)
		for (var j = this.dataSet[i].length - 1; j >= 0; j--)
			if (isNaN(this.dataSet[i][j])) {
			
				this.dataSet[i].splice(j, 1);
			
			} else {
			
				this.dataSet[i][j] = parseFloat(this.dataSet[i][j]);
			
			}
	/*		
	for (var i = 0; i < this.dataSet.length; i++)
		for (var j = 0; j < this.dataSet[i].length; j++)
			if (this.dataSet[i][j] == 0)
				this.dataSet[i][j] = 10;
			else
				this.dataSet[i][j] *= 10;
	
	
	
	var flag = false;
	
	var similar = {};
	
	for (var i = 0; i < this.dataSet.length; i++) {
	
		for (var j = 0; j < this.dataSet[i].length; j++) {
		
			flag = false;
		
			var current = this.dataSet[i][j];
			
			for (var k = 0; k < this.dataSet.length; k++) {
			
				var compare = this.dataSet[k][j];
				
				if (compare !== current)
					flag = true;
			
			}
			
			if (! flag) {
			
				//similar[j] = true;
				this.dataSet[i][j] += 10;
			
			}
		
		}
	
	}
	
	console.log(this.dataSet);
	/*
	var similarArray = [];
	
	for (var key in similar)
		similarArray.push(key);
		
	similarArray.sort();
	
	this.similar = similar;
	
	
	for (var i = similarArray.length - 1; i >= 0; i--) {
	
		for (var j = 0; j < this.dataSet.length; j++)
			this.dataSet[j].splice(similarArray[i], 1);
	
	}
	
	console.log(this.dataSet);
	/*
	this.dataSet = (function multiDimensionalUnique(arr) {
    
    	var uniques = [];
    	var itemsFound = {};
    
    	for (var i = 0, l = arr.length; i < l; i++) {
        
        	var stringified = JSON.stringify(arr[i]);
        
        	if (itemsFound[stringified]) { continue; }
        
        	uniques.push(arr[i]);
        
        	itemsFound[stringified] = true;
    
    	}
    
    	return uniques;

	})(this.dataSet);*/
	
	
	this.data = $M(this.dataSet);
	
	this.outlier.trainClassifer(this.data);
	
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

	// TODO: charts object

};

function initSettings() {

	analysisObjects.uiConstants.removeContent();
	
	this.settings = analysisObjects.miners.settings || new Settings();
	
	this.createUI();

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
	
	console.log(this.settings);
	
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
		
			$('#max-clusters').val(self.settings.size);
			$('#alpha').val(self.settings.alpha);
			$('#dimensions').val(self.settings.dimensions);
			$('#min').val(self.settings.min);
			$('#max').val(self.settings.max);
			//$('#merge').val(self.settings.merge);
		
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
					//	merge		= parseInt($('#merge').val());
				
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
			//	self.settings.merge = merge;
				
				analysisObjects.miners.neuralNTreeSettings = self.settings;
				
				console.log(analysisObjects.miners.neuralNTreeSettings);
		
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
					//	merge 		= parseInt($('#merge').val());
				
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
				//self.settings.merge = merge;
				
				analysisObjects.miners.neuralNTreeSettings = self.settings;
				
				console.log(analysisObjects.miners.neuralNTreeSettings);
		
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
						//merge 		= parseInt($('#merge').val());
				
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
			//	self.settings.merge = merge;
				
				analysisObjects.miners.neuralNTreeSettings = self.settings;
		
			}
			
			if (analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet) {
			
				var clusters = [];
			
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
							tableStr += '<th>' + headers[j] + ' ' + label[j] + '</th>';
									
						tableStr += '<th>Notes</th>';
						tableStr += '</tr><tr>';
						
						input = getInputVector(input);
								
						for (var j = 0; j < input.length; j++) {
									
							tableStr += '<td>' + input[j] + '</td>';
									
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
							newStr += '<td>' + input[j] + '</td>';
										
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

					self.nodes.update({ id: out, size: size, info: tableStr, featureCount: featureCount, label: clusterLabel });
					
			
				}
				
				var silhouettes = [];
				
				for (var i = 0; i < clusters.length; i++)
					for (var j = 0; j < clusters.length; j++)
						if (i !== j) {
						
							if (clusters[i] && clusters[j] && clusters[i].length > 1 && clusters[j].length > 1) {
							
								var temp = self.silhouette(clusters[i], clusters[j]);
							
								silhouettes.push({ silhouette: temp, 'cluster': i, 'compared cluster': j });
							
							}
						
						}
						
				silhouettes.sort(function(a, b) {
				
					if (a.silhouette < b.silhouette)
						return -1;
					else if (a.silhouette > b.silhouette)
						return 1;
					else
						return 0;
				
				});
						
				self.createSilhouetteTable(silhouettes);
							
			
			} else {
			
				alert('No data set specified');
			
			}
			
			hideLoader();
	
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
	
		str += array[i]['silhouette'] > 0 ? '<tr class=\'success\'>' : '<tr class=\'danger\'>';
	
		for (var key in array[i])
			str += '<td>' + array[i][key] + '</td>';
	
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
			
				if (i !== j) {
				
					firstTotal += this.euclidean(codebook[i], codebook[j]);
					divFirst++;
				
				}
			
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
      //id of the visualization container
    	injectInto: 'neural-n-tree-hyperbolic',
      //canvas width and height
      	width: 800,
      	height: 800,
      //Change node and edge styles such as
      //color, width and dimensions.
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
                  				
                  					// TODO...
                  				
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
    //load JSON data.
    ht.loadJSON(json);
    //compute positions and plot.
    ht.refresh();
    //end
    ht.controller.onComplete();
    
    //console.log(ht);
	
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

	var levels = this.neuralNTree.neuralNTree.levelOrder(this.neuralNTree.neuralNTree.rootNode);
	
	//this.neuralNTree.neuralNTree.toJSON();

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
		
		mins.push(NNTFunctions.util.convertRange([levels[0][0].point[i]], [-2, 2], [this.neuralNTree.neuralNTree.min, this.neuralNTree.neuralNTree.max])[0]);
		
	}
		
	for (var i = 0, len = levels.length; i < len; i++)
		for (var j = 0, inLen = levels[i].length; j < inLen; j++) {
				
			if (levels[i][j] !== null)
				for (var k = 0, pointLen = levels[i][j].point.length; k < pointLen; k++) {
				
					if (mins[k] > NNTFunctions.util.convertRange([levels[i][j].point[k]], [-2, 2], [this.neuralNTree.neuralNTree.min, this.neuralNTree.neuralNTree.max])[0])
						mins[k] = NNTFunctions.util.convertRange([levels[i][j].point[k]], [-2, 2], [this.neuralNTree.neuralNTree.min, this.neuralNTree.neuralNTree.max])[0];
						
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
				tempPoint = NNTFunctions.util.convertRange(tempPoint, [-2, 2], [this.neuralNTree.neuralNTree.min, this.neuralNTree.neuralNTree.max]);
					
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

	for (var i = 0, len = levels.length; i < len; i++) {

		for (var j = 0, levLen = levels[i].length; j < levLen; j++) {

			if (null !== levels[i][j]) {
			
				var str = '<input type=\'text\' style=\'width: 290px;\' value=\'';
					
				var point = NNTFunctions.util.convertRange(levels[i][j].point, [-2, 2], [this.neuralNTree.neuralNTree.min, this.neuralNTree.neuralNTree.max]);
					
					
				for (var k = 0, pointLen = point.length; k < pointLen; k++) {
						
					str += k !== pointLen - 1 ? point[k].toFixed(4) + ', ' : point[k].toFixed(4);
					
				}
					
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
					
				this.nodes.add({ id: levels[i][j].index, label: levels[i][j].index, level: i, info: str, size: 25, shape: 'square', featureCount: 0,
					color: col, nodeHeader: nodeHeader, cid: levels[i][j].mergeIndex });
			
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
	
	//this.visual.unbind('click').click(function(properties) {

	this.visual.on('click', function(properties) {
			
		var ids = properties.nodes;

		var clickNodes = self.nodes.get(ids);
		
		if (! clickNodes || ! clickNodes[0])
			return;
			
		if (clickNodes && clickNodes[0] && clickNodes[0].info) {
			
			var str = clickNodes[0].info;
			var header = clickNodes[0].nodeHeader;
			var $dialog = $('<div></div>')
				.html(str)
					.dialog({
						width: 300,
						height: 400,
						closeOnEscape: false,
						title: header,
						close: function() {
					
							$(this).dialog('destroy').remove();
					
						}
					});
			
			var nodePoint = self.neuralNTree.neuralNTree.nodesByIndex([ids[0]]).point;
			
			nodePoint = NNTFunctions.util.convertRange(nodePoint, [-2, 2], [self.neuralNTree.neuralNTree.min, self.neuralNTree.neuralNTree.max]);
			
			for (var i = 0, len = nodePoint.length; i < len; i++)
				nodePoint[i] = parseFloat(nodePoint[i].toFixed(4));
			
			nodePoint = JSON.stringify(nodePoint);
			
			nodePoint = nodePoint.substring(1, nodePoint.length - 1);
			
			$('#node-index_' + ids[0]).val(nodePoint);
			
			/*
			if (self.neuralNTree.neuralNTree.getHeight(self.neuralNTree.neuralNTree.rootNode) > 1)
				self.visualHypertree();
			*/		
		}
	
	});
	
	/*
	if (this.neuralNTree.neuralNTree.getHeight(this.neuralNTree.neuralNTree.rootNode) > 1)
		this.visualHypertree();
	*/
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
					
					self.nodes.add({ label: ! levels[i][j].category ? levels[i][j].attribute + ' '  + levels[i][j].predicateName + ' ' + levels[i][j].pivot :
						levels[i][j].category == 1 ? 'Good' : 'Bad', level: self.levelCount + plus, id: levels[i][j].index, size: 25, shape: 'square', featureCount: 0,
						color: levels[i][j].category ? 'blue' : ! levels[i][j].noMatch ? 'green' : 'red',
						info: levels[i][j].pivot, predicate: levels[i][j].predicateName, nodeId: levels[i][j].index, attribute: levels[i][j].attribute, category: levels[i][j].category });
					
					if (null !== levels[i][j].parent && 'undefined' !== typeof levels[i][j].parent)
						self.edges.add({ from: levels[i][j].index, to: levels[i][j].parent.index });

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
        
                	direction: 'UD'
        
            	}
        
        	},
        
        	physics: false

		};

		self.visual = new vis.Network(container, data, options);
		
		self.visual.on('click', function(properties) {
			
			var ids = properties.nodes;

			var clickNodes = self.nodes.get(ids);
		
			if (! clickNodes || ! clickNodes[0])
				return;
			
			if (clickNodes && clickNodes[0] && clickNodes[0].info) { // TODO: change pivot and value
				
				var str = 'Pivot <input class=\'pivot\' value=\'' + clickNodes[0].info + '\' id=\'pivot_' + clickNodes[0].nodeId + '\'>' +
					'<br>';
				
				if (clickNodes[0].predicate === '==')
					str += 'Predicate <select id=\'predicate_' + clickNodes[0].nodeId + '\' class=\'predicate\'><option value=\'==\' selected=\'selected\'>equal</option><option value=\'>=\'>greater than or equal</option><option value=\'<=\'>less than or equal</option></select>';
				else if (clickNodes[0].predicate === '>=')
					str += 'Predicate <select id=\'predicate_' + clickNodes[0].nodeId + '\' class=\'predicate\'><option value=\'==\'>equal</option><option value=\'>=\' selected=\'selected\'>greater than or equal</option><option value=\'<=\'>less than or equal</option></select>';
				else
					str += 'Predicate <select id=\'predicate_' + clickNodes[0].nodeId + '\' class=\'predicate\'><option value=\'==\'>equal</option><option value=\'>=\'>greater than or equal</option><option value=\'<=\' selected=\'selected\'>less than or equal</option></select>';
				
				str += '<br>';
				
				str += 'Attribute <select id=\'attribute_' + clickNodes[0].nodeId + '\' class=\'attribute\'>';
				
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
		
							if (levels[i][j] && levels[i][j].index == nodeId)
								levels[i][j].predicateName = $('#' + id).val();
									
		
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
			
				var str = clickNodes[0].category == 1 ? '<select id=\'category_' + clickNodes[0].nodeId + '\' class=\'category\'><option value=\'1\' selected=\'selected\'>Good</option><option value=\'2\'>Bad<option></select>' :
					'<select id=\'category_' + clickNodes[0].nodeId + '\' class=\'category\'><option value=\'1\'>Good</option><option value=\'2\' selected=\'selected\'>Bad<option></select>' ;
			
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
		
			if (! (key in analysisObjects.miners.ignoredAttributes) && 
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
		
		str += predict == 1 ? '<tr class=\'success\'>' : '<tr class=\'danger\'>';
		
		for (var key in obj) {
		
			if (! (key in analysisObjects.miners.ignoredAttributes))
				str += '<td>' + obj[key] + '</td>';
		
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
			
				self.anomaly = new Anomaly();
				
				
			
			} else {
			
				alert('No data set loaded');
			
			}
		
		}
		
		$('#apply-anomaly').on('click', function(event) {
		
			showLoader();
		
			var th = $('#anomaly-threshold').val();
			
			analysisObjects.miners.anomaly.th = th;
			
			try {
			
				th = parseFloat(th);
			
			} catch (e) {
			
				alert('Not a proper th-value');
				return;
			
			}
			
			var inputs = [];
			
			var str = '';
			
			var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.groupDataSet || analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;
			
			for (var i = 0; i < dataSet.length; i++) {
			
				var val = getInputVector(dataSet[i]);
				
				val = $V(val);
				
				var status = self.anomaly.outlier.checkIfOutlier(val, th);
			
				inputs.push({ input: getInputVectorTextAllAttributes(dataSet[i]), status: status });
			
			}
			
			var probs = self.anomaly.outlier.probs;
			
			var sum = 0;
			
			for (var i = 0; i < probs.length; i++)
				sum += probs[i];
				
			if (probs.length > 0)
				sum = sum / probs.length;
			
			console.log(sum);
			
			if (! isNaN(sum))
				$('#anomaly-threshold').val(sum);
			
			str = '<table id=\'a-table\' class=\'table\'><thead><tr>';
			
			var headers = getKeysAllAttributes(dataSet[0]);
			
			for (var i = 0; i < headers.length; i++)
				str += '<th>' + headers[i] + '</th>';
				
			str += '</tr></thead><tbody>';
			
			for (var i = 0; i < inputs.length; i++) {
			
				str += inputs[i].status ? '<tr class=\'danger\'>' : '<tr class=\'success\'>';
				
				for (var j = 0; j < inputs[i].input.length; j++)
					str += '<td>' + inputs[i].input[j]; + '</td>';
					
				str += '</tr>';
			
			}
			
			str += '</tbody></table>';
			
			$('#anomaly-table').html(str);
			
			$('#a-table').tablesorter();
			
			hideLoader();
		
		});
		
		hideLoader();
		
		if (analysisObjects.miners.anomaly) {
		
			self.anomaly = analysisObjects.miners.anomaly;
			
			var th = analysisObjects.miners.anomaly.th ||$('#anomaly-threshold').val();
			
			$('#anomaly-threshold').val(th);
			
			$('#apply-anomaly').click();
		
		}
	
	});

};

function initCharts() {
	
	analysisObjects.uiConstants.removeContent();
	
	this.charts = analysisObjects.miners.charts || new Charts();

	this.createUI();

};

initCharts.prototype.createUI = function() {

	var $container = $(analysisObjects.uiConstants.wrapper);
	
	var self = this;
	
	showLoader();
	
	var uri = isChrome() ? analysisObjects.urls.templateUrl + 'charts.html' : 'templates/charts.html';
	
	$container.load(uri, function() {
	
		var ctx = document.getElementById('charts-radar').getContext('2d');
		
		var ctxLine = document.getElementById('charts-line').getContext('2d');
		
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
		
		var chart = new Chart(ctx, obj);
		
		var lineChart = new Chart(ctxLine, objLine);
		
		self.radarChart = chart;
		self.lineChart = lineChart;
		
		hideLoader();
		
	});

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
		
	});


};

initApriori.prototype.buildUI = function() {

	var frequentItemSets = this.apriori.frequentItemSets;
	var associationRules = this.apriori.associationRules;
	
	var assoStr = '<table id=\'asso-table\' class=\'table\'><thead><tr><th>LHS</th><th>RHS</th><th>Confidence</th></tr></thead><tbody>';
	
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
	
	$('#apriori-table').html(assoStr);
	
	$('#apriori-support-div').html(freqStr);
	
	$('#freq-table').tablesorter();
	$('#asso-table').tablesorter();

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
				
				console.log(e);
				
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
	generateNormalize(obj);
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
		
			input.push(obj[key]);
		
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
	
		input.push(obj[key]);
	
	}
	
	return input;

};

function getKeysAllAttributes(obj) {

	var keys = [];
	
	for (var key in obj) {
	
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
		
			userObj[obj['users']] = true;
		
		}
	
	}
	
	var listStr = '<ul id=\'user-list\'>';
	
	var count = 0;
	
	for (var key in userObj) {
	
		listStr += '<li class=\'ui-state-default\' id=\'user-list_' + key + '\'>' + key + '</li>';
		count++;
	
	}
	
	listStr += '</ul>';
	
	$('#users').html(listStr);
	
	$('#user-list').sortable();
	
	setMessage(count + ' users found');

};

function initTimePicker() {

	for (var i = 0; i < arguments.length; i++) {
	
		$(arguments[i]).timepicker({ 
		
			interval: 5,
			change: function(dateText) {
			
				var type = $(this).attr('id');
			
				var dataSet = reduceDataSetBasedOnTime(dateText, type);
				
				if (dataSet) {
				
					analysisObjects.miners.reducedTimeDataSet = dataSet;
					
					analysisObjects.miners.curDataSet = null;
					
					generateAttributeTable(analysisObjects.miners.reducedTimeDataSet);
				
				}
			
			}
		
		});
	
	}

};

function generateAttributeCheckboxes(obj) {

	$('#attributes').html('');
	
	var str = '<h3>Attributes</h3><div>';				
					
	for (var key in obj) {
	
		if (key === 'hiddenId')
			continue;
	
		if (key !== 'id' && key !== 'vector_id' && key !== 'session_id')
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
		
		console.log(attr);
						
		if (! $checked)
			analysisObjects.miners.ignoredAttributes[attr] = true;
		else
			delete analysisObjects.miners.ignoredAttributes[attr];
			
	//	resetMiners();
		
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
	
	setMessage('Miners have been reseted');

};

function generateAttributeTable(arr) {

	for (var i = 0; i < arr.length; i++) {
	
		arr[i]['hiddenId'] = i;
	
	}

	$('#data-set-table').html('');

	var dataSetStr = '<table id=\'attribute-table\' class=\'table\'><thead><tr>';
	
	for (var key in arr[0]) {
	
		if (key !== 'hiddenId')
			dataSetStr += '<th>' + key + '</th>';
		
	}
				
	dataSetStr += '</tr></thead><tbody>';
				
	for (var i = 0; i < arr.length; i++) {
				
		dataSetStr += '<tr class=\'well-performed\' id=\'' + arr[i]['hiddenId'] + '\'>';
					
		for (var key in arr[i]) {
			
			if (key !== 'hiddenId')
				dataSetStr += '<td>' + arr[i][key] + '</td>';
					
		}
					
		dataSetStr += '</tr>';
				
	}
				
	dataSetStr += '</tbody></table>';
				
	$('#data-set-table').html(dataSetStr);
	
	$('#attribute-table').tablesorter();
	
	$('.well-performed').on('click', function(event) {
	
		var key = $(this).attr('id');
		
		if (analysisObjects.miners.classificationWellPerformed[key]) {
		
			delete analysisObjects.miners.classificationWellPerformed[key];
			$(this).removeClass('success');
		
		} else {
		
			$(this).addClass('success');
			analysisObjects.miners.classificationWellPerformed[key] = true;
		
		}
		
		
	});

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
				
				}
			
			}
		
		} else {
		
			for (var objKey in curObj) {
			
				if (objKey !== key) {
				
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
			
			groupedArr[i][objKey] = objKey !== 'id' ? sum : obj['id'][0];
		
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
		
			if (objKey !== key && objKey !== 'id')
				normalizedObj[objKey] = arr[i][objKey] / sum;
			else if (objKey === 'id')
				normalizedObj['id'] = arr[i]['id'];
		
		}
		
		normalizedArr.push(normalizedObj);
	
	}
	
	return normalizedArr;

};

function generateGroupBySelect(arr) {

	var groupByStr = '<h3>Group by</h3><div class=\'radio\'>';
	
	groupByStr += '<br><label><input type=\'radio\' name=\'group-by-radio\' id=\'radio_no-group\' value=\'no-group\' checked> No groupping </label>';
	
	for (var key in arr[0]) {
	
		if (key === 'hiddenId')
			continue;
	
		groupByStr += '<br><label><input type=\'radio\' name=\'group-by-radio\' id=\'radio_' + key + '\'value=\'' + key + '\'>' +
		key + 
		'</label>';
	
	}
	
	groupByStr += '</div>';
	
	$('#group-by').html(groupByStr);
	
	$('input[type=radio][name=group-by-radio]').on('change', function() {
	
		var value = $(this).val();
		
		if (value !== 'no-group') {
		
			var dataSet = analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;
			
			analysisObjects.miners.groupDataSet = groupBy(dataSet, value);
			
			//alert('Now please normalize vectors');
			
			generateAttributeTable(analysisObjects.miners.groupDataSet);
			
			$('#normalize').show();
		
		} else {
			
			analysisObjects.miners.curDataSet = null;
			analysisObjects.miners.groupDataSet = null;
			
			var dataSet = analysisObjects.miners.reducedTimeDataSet || analysisObjects.miners.dataSet;
			
			analysisObjects.miners.groupDataSet = null;
			
			$('#normalize').hide();
			
			generateAttributeTable(dataSet);
			
		//	resetMiners();
			
		}
		
	});

};

function generateNormalize(arr) {

	var normalizeStr = '<h3>Normalize vectors</h3><div class=\'radio\'>';
	
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
		
		//resetMiners();
		
		initNeuralNTreeSettings();
	
	});

};


function reduceDataSetBasedOnTime(dateText, inst) {

	var minutesOfDay = function(m) {
  
  		return m.getMinutes() + m.getHours() * 60;
	
	};
	
	var date = new Date(dateText);
	
	
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
			startTime = minutesOfDay(analysisObjects.miners.minTime);
		if (analysisObjects.miners.maxTime)
			endTime = minutesOfDay(analysisObjects.miners.maxTime);
	
		if (startTime > endTime) {
		
			alert('Start time filter larger than end time filter');
			return;
		
		}
	
		var dateArray = [];
		
		var dataSet = analysisObjects.miners.curDataSet || analysisObjects.miners.dataSet;
		
		for (var i = 0; i < dataSet.length; i++) {
		
			var obj = dataSet[i];
			
			var objTime = new Date();
			
			var time = obj['time'];
			
			if (time.indexOf('PM') > -1)
				var pm = true;
			else
				var pm = false;
			
			time = time.replace('AM', '');
			time = time.replace('PM', '');
			
			time = time.split(':');
			
			var minutes = parseInt(time[1]);
			var hours = pm ? parseInt(time[0]) + 12 : parseInt(time[0]);
			
			objTime.setHours(hours);
			objTime.setMinutes(minutes); // TODO: CHANGE LATER
			
			objTime = minutesOfDay(objTime);
			
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
	
	var index = id.split('_')[1];
	
	var str = '[' + value + ']';
	
	var point = JSON.parse(str);
	
	analysisObjects.miners.neuralNTree.neuralNTree.nodes[index].point = NNTFunctions.util.convertRange(point, 
		[analysisObjects.miners.neuralNTree.neuralNTree.min, analysisObjects.miners.neuralNTree.neuralNTree.max],
		[-2, 2]);
		
	$('#' + id).val(value);

};

function fetchDataSet(data) {

	analysisObjects.miners.curDataSet = null;
	analysisObjects.miners.reducedTimeDataSet = null;
	analysisObjects.miners.groupDataSet = null;
	
	if (! analysisObjects.miners.dataSet || analysisObjects.miners.dataSet.length === 0)
		analysisObjects.miners.dataSet = [];
	
	var i = 0;
	
	for (; i < data.length; i++)
		analysisObjects.miners.dataSet.push(data[i]);
		
	generateAttributeTable(analysisObjects.miners.dataSet);
	
	initNeuralNTreeSettings();
	
	setMessage(i + ' data instances loaded');
	
};

function setMessage() {

	var messageStr = '';

	for (var i = 0; i < arguments.length; i++)
		messageStr += '<div class=\'alert alert-info alert-dismissable text-center\'><a href=\'#\' class=\'close\' data-dismiss=\'alert\' aria-label=\'close\'>&times;</a>' + arguments[i] + '</div>';
		
	$('#messages').append(messageStr);

};

function showLoader() {

	$('#loader').show();

};

function hideLoader() {

	$('#loader').hide();

};