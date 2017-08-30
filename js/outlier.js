outlier = {
	mean: null,
	covMatrix: null,
	num_rows: 0,
	num_cols: 0,
	testValx: null,
	probs: [],
	
	initclassifier:function(data)
	{
		/**
			initialize the classifier
		*/
		var dims = data.dimensions();
		outlier.num_rows = dims.rows;		//size
		outlier.num_cols = dims.cols;		//dimensions or features
		outlier.mean = outlier.findMean(data);
		
		
		
		outlier.covMatrix = outlier.findCovarianceMatrix(data);
		
		
		//var ret = covariance(data.elements);
		//console.log(ret);
	//	console.log(outlier.covMatrix);
	
	},
 
	findMean:function (data) 
	{
		/**
			obtain the mean from the data
		*/
		var output = Vector.Zero(outlier.num_cols);
		for (var i = 1; i <= outlier.num_rows; i++) {
			var curRow = data.row(i);
			output = output.add(curRow)
		}
		
		var noutput = output.x(1/outlier.num_rows);
		return noutput;

	},

	convertVectorToMatrix:function ( vec)
	{
		/**
			convert vectors to matrix
		*/
		var output = [];
		for (var i = 1; i <= outlier.num_rows; i++) {
			output.push(vec.elements);
		}
		return $M(output);
	},
	
	findCovarianceMatrix:function (data) 
	{
		/**
			estimate the covariance matrix from the data
		*/
		var meanMatrix = outlier.convertVectorToMatrix( outlier.mean); //m x n
		var subMeandata = data.subtract( meanMatrix );  //zero the data
		var subMeandataT = subMeandata.transpose();
		var covMatrix = subMeandataT.x( subMeandata ); 

		return covMatrix;

	},

	trainClassifer:function (data)
	{
		/**
			train the classifer
		*/
		outlier.initclassifier(data);	
	},

	trainClassiferWithParameters:function (mean, covMatrix)
	{
		/**
			train the classifer
		*/
		var dims = mean.dimensions();
		outlier.num_cols = dims;		//dimensions or features
		outlier.mean = mean;
		outlier.covMatrix = covMatrix;
	},

	getprobabValue:function (testValx)
	{
		/**
			calculate the probability density function of a multivariate data set.
		*/
		
		outlier.testValx = testValx;
		var mean = outlier.mean;
		var cov = outlier.covMatrix;
		var ar1 = Math.pow( ( 2 * Math.PI ), ( outlier.num_cols / 2 ) );
		var ar2 = Math.pow( cov.det() , 0.5);

		var subMeandata = outlier.testValx.subtract( mean );  //zero the data
		//convert vector to matrix and transpose to allow for muliplication
		var nsubMeandata = $M(subMeandata);
		var nsubMeandataT = nsubMeandata.transpose();

		//console.log(cov);

		var invCov = cov.inverse();
		
		//console.log(invCov);

		if (! invCov)
			invCov = cov;

		var ar3 = nsubMeandataT.x(invCov);
		ar3 = ar3.x(nsubMeandata); 
		ar3 = ar3.elements[0][0];
		ar3 = -1 * 0.5 * ar3;
		ar3 = Math.exp(ar3);

		var output = (1 / (ar1 * ar2)) * ar3;
		return output ;
	
	},
	checkIfOutlier:function (testValx, threshold)
	{

		if (! threshold)
			threshold = 0.0005
		/**
			set up a flag to set the threshold of the classifier.
		*/
		var prob = outlier.getprobabValue(testValx);
		
		outlier.probs.push(prob);
		
		//console.log(prob);
		
		var isOutlier = false;
		if (prob  < threshold)
		{
			isOutlier = true;
		}
		return isOutlier;

	}
}