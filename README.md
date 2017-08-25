# eCraft2Learn-analysis
To analyse eCraft2Learn data

### Test dataset can be found in test-dataset folder.
Currently does not fetch data from any server. Use JSON-file format when you upload datasets.
You have to include keys 'id' and 'users' to your JSON-file. Otherwise the system parses dynamically the keys.
If you use with Chrome, you have to upload the app to the web server (Chrome does not allow loading dynamic html from the local file system).

### Algorithms in use:
classification -> id3 decision tree
cluster analysis -> neural n-tree
association rule learning -> apriori
outlier detection -> density based

[instance of app running on a server](http://cs.uef.fi/~tapanit/ecraft2learn/analysis/)
