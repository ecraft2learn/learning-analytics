function getLevelOrder(root) {

	var index = 0;

	var result = [];
	
	if (null === root)
		return result;
		
	var list = [];
	
	list.push(root);
	
	while (list.length > 0) {
	
		var plist = [];
		
		var level = [];
		
		while (list.length > 0) {
		
			var node = list.shift();
			
			if ('undefined' !== typeof node) {
			
				node.index = ++index;
			
				level.push(node);
			
				if ('undefined' !== typeof node.notMatch) {
			
					plist.push(node.notMatch);
					node.notMatch.parent = node;
					node.notMatch.noMatch = true;
			
				}
			
				if ('undefined' !== typeof node.match) {
			
					plist.push(node.match);
					node.match.parent = node;
					node.match.noMatch = false;
			
				}
			
			}
		
		}
	
		result.push(level);
			
		list = plist;
	
	}
	
	return result;

};

function addParentsDecisionTree(root) {

	if ('undefined' !== typeof root) {
		
		if (root.notMatch)
			root.notMatch.parent = root;
		
		if (root.match)
			root.match.parent = root;
		
		addParentsDecisionTree(root.notMatch);
		addParentsDecisionTree(root.match);
	
	}

};

function removeParentsDecisionTree(root) {

	if ('undefined' !== typeof root) {
	
		removeParentsDecisionTree(root.notMatch);
	
		root.parent = null;
		
		removeParentsDecisionTree(root.match);
	
	}

};

function addParentsNeuralNTree(root) {

	if (null !== root && 'undefined' !== typeof root) {
		
		if (root.left)
			root.left.parent = root;
		
		if (root.right)
			root.right.parent = root;
		
		addParentsNeuralNTree(root.left);
		addParentsNeuralNTree(root.right);
	
	}

};

function removeParentsNeuralNTree(root) {


	if (null !== root) {
	
		removeParentsNeuralNTree(root.left);
		
		root.parent = null;
		
		removeParentsNeuralNTree(root.right);
	
	}

};

