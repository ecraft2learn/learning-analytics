# Learning analytics system for eCraft2Learn project
To analyse [eCraft2Learn](http://project.ecraft2learn.eu) data

### Test dataset can be found in test-dataset folder. Use session id 40 to access the test data on the server.
If you use the app with Chrome / Safari, you have to upload the app to the web server (Chrome and Safari do not allow loading dynamic html from the local file system).

If you wish to use tha app without a sytem tracking you, use

```
https://url-to-app/?logging=off
```

### Algorithms in use:
Task | Algorithm
--- | ---
Classification | ID3 decision tree
Cluster analysis | Neural N-Tree
Association rule mining | Apriori
Anomaly detection | One class SVM with kernel

### You can also run the app with [electron](https://electron.atom.io)
Only analytics features available when running with electron
```
npm install
npm start
```

[Instance of the app running on a server](https://ecraft2learn.github.io/learning-analytics/)

### Adding self-made components to system:
```
Add your html template to templates folder and include the 
js / css files in index.html then in index.html add the following lines
```
```html
<!-- inside of <ul class='nav navbar-nav'>...</ul>  -->
<li id='TOOL_NAME' role='presentation'><a href='javascript:void(0)' id='a-TOOL_NAME'>&nbsp;&nbsp;<span class='glyphicon glyphicon-ICON'></span> TOOL_NAME</span></a></li>
```

```javascript
$('#a-TOOL_NAME').on('click', (event) => {


	analysisObjects.uiConstants.removeContent();
 
       	let $container = $(analysisObjects.uiConstants.wrapper);

        showLoader();

        let uri = isChrome() ? analysisObjects.urls.templateUrl + 'TEMPLATE_NAME.html' : 'templates/TEMPLATE_NAME.html';

        $container.load(uri, () => {
 
        	hideLoader();

		// do things after your html template has been loaded...

        });

});

```
