function addActivities(result) {

    var list = JSON.parse(result);

    for (i = 0; i < list.DATA.length; i++) {
        var riga = list.DATA[i];
        $("<div class=\"grid-item col-sm-4 col-xs-12\" onClick=\"divClick(" + riga.Id + ") \"/>")
            .append("<div class=\"activity\" >  <div class=\"activityHeader\" > <h5>" + riga.Title + "</h5> <div class=\"activityBody\">" + riga.Description)
            .appendTo("#tileGrid");
    }
}