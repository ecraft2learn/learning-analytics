# eCraft2Learn-analysis
To analyse eCraft2Learn data

### Test dataset can be found in test-dataset folder.
Currently does not fetch data from any server. Use JSON-file format when you upload datasets.
You have to include keys 'id' and 'users' to your JSON-file. Otherwise the system parses dynamically the keys.
If you use with Chrome, you have to upload the app to the web server (Chrome does not allow loading dynamic html from the local file system).

### Algorithms in use:
Task | Algorithm
--- | ---
Classification | ID3
Cluster analysis | Neural N-Tree
Association rule learning | Apriori
Anomaly detection | Density based outlier detection

[Instance of app running on a server](http://cs.uef.fi/~tapanit/ecraft2learn/analysis/)
