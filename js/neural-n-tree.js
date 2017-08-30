'use strict';

var NNTFunctions = NNTFunctions || {};

NNTFunctions.util = {

	assert: function(condition, message) {

        	if (! condition)
                	throw message || 'Assertation failed';

	},

	getOption: function(opt, name, def) {

        	if ('undefined' === typeof opt)
                	return def;

        	return 'undefined' !== typeof opt[name] ? opt[name] : def;

	},

	convertRange: function(value, r1, r2) {

        	var arr = [];

        	for (var i = 0, len = value.length; i < len; i++)
                	arr.push((value[i] - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]);

        	return arr;

	},

	similarity: function(arrOne, arrTwo) {
	
        	NNTFunctions.util.assert(arrOne.length === arrTwo.length, 'Array lengths do not match');

        	var a   = 0,
           	    b   = 0,
            	c   = 0;

        	for (var i = 0, len = arrOne.length; i < len; i++) {

                	a += Math.pow(arrOne[i], 2);
                	b += Math.pow(arrTwo[i], 2);
                	c += arrOne[i] * arrTwo[i];

        	}

        	return (c / (Math.sqrt(a) * Math.sqrt(b)));
			
	},

	random: function(min, max) {

        	return Math.random() * (max - min) + min;

	},

	randArr: function(size, dimensions) {

        	var arr = [];

        	for (var i = 0; i < size; i++) {

                	var pointArr = [];

                	for (var j = 0; j < dimensions; j++)
                        	pointArr.push(NNTFunctions.util.random(-2, 2));

                	arr.push(pointArr);

        	}

        	return arr;

	}

};

NNTFunctions.NNTNode = function(point) {

        this.point      = point,
        this.parent     = null,
        this.left       = null,
        this.right      = null,
		this.index		= -1,
        this.isTerminal = false;

};

NNTFunctions.NeuralNTree = function(option) {

        this.rootNode   = null,
        this.alpha      = NNTFunctions.util.getOption(option, 'learningRate', 0.01),
        this.terminals  = {},
        this.index      = 0,
        this.min        = NNTFunctions.util.getOption(option, 'scaleMin', -1),
        this.max        = NNTFunctions.util.getOption(option, 'scaleMax', 1),
        this.size       = NNTFunctions.util.getOption(option, 'size', 1000),
        this.merge		= NNTFunctions.util.getOption(option, 'merge', 8);
        this.dimensions = NNTFunctions.util.getOption(option, 'dimensions', 3);

		this.nodes = [];

        var arr         = NNTFunctions.util.randArr(this.size, this.dimensions);

        this.initTree(arr);
        this.postOrder(this.rootNode);

};

NNTFunctions.NeuralNTree.prototype.setMerge = function(merge) {

		this.merge = Math.log2(merge) - 1;

};

NNTFunctions.NeuralNTree.prototype.postOrder = function(node) {

        if (null !== node && 'undefined' !== typeof node) {

                this.postOrder(node.left);
                this.postOrder(node.right);

                var temp = this.index;
                node.index = temp;
                
                this.nodes[temp] = node;

                this.index++;

                if (node.isTerminal) 
                        this.terminals[temp] = node;

        }

};

NNTFunctions.NeuralNTree.prototype.initTree = function(arr) {

        return this._initTree(arr, 0, arr.length - 1);

};

NNTFunctions.NeuralNTree.prototype._initTree = function(arr, min, max) {

        if (min > max)
                return null;

        var mid = Math.round((min + max) / 2),
            node = new NNTFunctions.NNTNode(arr[mid]);

        if (null === this.rootNode)
                this.rootNode = node;

        node.left = this._initTree(arr, min, mid - 1);

        if (null !== node.left)
                node.left.parent = node;

        node.right = this._initTree(arr, mid + 1, max);

        if (null !== node.right)
                node.right.parent = node;

        if (null === node.left && null === node.right)
                node.isTerminal = true;

        return node;

};

NNTFunctions.NeuralNTree.prototype.backwardTrain = function(arg) {

        arg	= NNTFunctions.util.convertRange(arg, [this.min, this.max], [-2, 2]);

        var bmu = null;

        for (var key in this.terminals) {

                if (null === bmu)
                        bmu = this.terminals[key];

		var bmuSim = NNTFunctions.util.similarity(arg, bmu.point),
		    curSim = NNTFunctions.util.similarity(arg, this.terminals[key].point);

		if (bmuSim > curSim)
			bmu = this.terminals[key];

        }

        while (this.rootNode !== bmu) {
                
		this.levelUpdate(bmu, arg);
		bmu = bmu.parent;

        }

};


NNTFunctions.NeuralNTree.prototype.levelOrder = function(node) {

	var result = [];
	
	if (null === node)
		return result;
	
	var list = [];
	
	list.push(node);
	
	while (list.length > 0) {
	
		var plist = [],
			level = [];
			
		while (list.length > 0) {
		
			node = list.shift();
			
			level.push(node);
			
			var left 	= node.left,
				right 	= node.right;
				
			if (null !== left) {
			
				plist.push(left);
			
			}
			
			if (null !== right) {
			
				plist.push(right);
			
			}
		
		}
		
		result.push(level);
		
		list = plist;
	
	}

	return result;

};

NNTFunctions.NeuralNTree.prototype.toJSON = function() {

	var nodes = [];
	
	this.__toJSON(this.rootNode, nodes);
	
	var ret = nodes.pop();
	
	
	return ret;

};

NNTFunctions.NeuralNTree.prototype.getHeight = function(node) {

	if (! node)
		return -1;
	return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

};

NNTFunctions.NeuralNTree.prototype.__toJSON = function(node, list) {

	if (node) {
	
		var obj = {};
		
		obj.id = node.index + '_';
		obj.children = [];
		obj.name = node.point.join(', ');
		obj.data = {};
		
		list.push(obj);
		
		this.__toJSON(node.left, obj.children);
		this.__toJSON(node.right, obj.children);
	
	}

};

NNTFunctions.NeuralNTree.prototype.levelUpdate = function(node, arg) {

        var tree 	= this.levelOrder(node),
	    levels 	= tree.length;

        for (var i = 0, len = tree.length; i < len; i++) {

                for (var j = 0, treeLen = tree[i].length; j < treeLen; j++)
                        if (null !== tree[i][j])
                                for (var k = 0, pointLen = tree[i][j].point.length; k < pointLen; k++)
                                        tree[i][j].point[k] = this.update(tree[i][j].point[k], arg[k], ((i + 1) / (levels + 1)));


        }

};

NNTFunctions.NeuralNTree.prototype.update = function(point, arg, curLevel) {

        var val = point + this.alpha * (1 / curLevel) * (arg - point);

        return val;

};

NNTFunctions.NeuralNTree.prototype.cluster = function(arg) {

        arg     = NNTFunctions.util.convertRange(arg, [this.min, this.max], [-2, 2]);

        var cur = this.rootNode;

        while (! cur.isTerminal) {

                if (null !== cur.left && null !== cur.right) {

                        var left  = NNTFunctions.util.similarity(arg, cur.left.point),
                            right = NNTFunctions.util.similarity(arg, cur.right.point);

                        if (left >= right)
                                cur = cur.left;
                        else
                                cur = cur.right;

                } else if (null === cur.left && null !== cur.right) {
                 
					cur = cur.right;
			
				} else {
			
                        cur = cur.left;
			
				}

        }

        return cur;

};

NNTFunctions.NeuralNTree.prototype.forwardTrain = function(arg) {

        arg	= NNTFunctions.util.convertRange(arg, [this.min, this.max], [-2, 2]);

        var cur	= this.rootNode;

        while (null !== cur) {

                if (null !== cur.left && null !== cur.right) {

                        var left  = NNTFunctions.util.similarity(arg, cur.left.point),
                            right = NNTFunctions.util.similarity(arg, cur.right.point);

                        if (left >= right) 
                                cur = cur.left;
						else 
                                cur = cur.right;
                        
						this.levelUpdate(cur, arg);

                } else if (null !== cur.left && null === cur.right) {
			
                        cur = cur.left;
			
				} else {
			
                        cur = cur.right;
			
				}

        }

};

NNTFunctions.NeuralNTree.prototype.mergeClusters = function() {
	
	var levels = this.levelOrder(this.rootNode);
	
	for (var i = 0; i < levels[this.merge].length; i++) {
	
		var subTree = this.levelOrder(levels[this.merge][i]);
		
		var index = subTree[0][0].index
		
		for (var j = 1; j < subTree.length; j++) {
		
			for (var k = 0; k < subTree[j].length; k++) {
			
				if (subTree[j][k])
					subTree[j][k].mergeIndex = index;
		
			}
		
		}
	
	}
	
	levels = this.levelOrder(this.rootNode);

};

NNTFunctions.NeuralNTree.prototype.nodesByIndex = function(index) {

	return this.nodes[index];

};
