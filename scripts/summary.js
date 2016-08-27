var margin = {top: 50, right: 50, bottom: 80, left: 100};
var width = (window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth) - margin.left;
var height = (window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight) - margin.top;

//--------------------------put list of smaple here---------------------------------
var filelist =[{name: "vis",list:[30,51,100]},{name: "imdb",list:[79,102,125,171]}];
//----------------------------------------------------------------------------------

var seriesNames = ["Betweenness edge", "Modularity Q"];
var    numSeries = seriesNames.length;
var    numSamples = 3;
var    data = [];
var chartMode="stacked",
	name_file = filelist[0].name,
	mtitle = {top: 10, right: margin.right, bottom: 30, left: margin.left},
	stitle = {width: (width-margin.right), height: (30+mtitle.top+mtitle.bottom)},
	containerWidth = width-margin.left-margin.right,
	containerHeight = height-margin.bottom-stitle.height,
	//-----Legend -----------------
	paddingBetweenLegendSeries = 5,
    legendSeriesBoxX = 0,
    legendSeriesBoxY = 0,
    legendSeriesBoxWidth = 15,
    legendSeriesBoxHeight = 15,
    legendSeriesHeight = legendSeriesBoxHeight + paddingBetweenLegendSeries,
    legendSeriesLabelX = legendSeriesBoxWidth+5,
    legendSeriesLabelY = legendSeriesHeight  / 2,
    legendMargin = {x:30,y:10},
    //legendX = containerWidth - legendSeriesBoxWidth - legendMargin,
    //legendY = legendMargin,
    legendX = legendMargin.x+margin.left,
    legendY = legendMargin.y+stitle.height,
    legendSeriesMax = legendSeriesHeight*seriesNames.length,
    legendScale_per = legendSeriesMax/containerHeight,
    maxStackY = 0,
    stackedBarWidth = 0,
    animation_time = 4000,
    animation_time_per = 20;
var colorLegend = d3.scaleOrdinal(d3.schemeCategory10);

var svg =d3.select("#chart")
	.attr("width",width)
	.attr("height",height);

var titleArea = svg.append("g")
    .attr("class", "title")
    .attr("width",stitle.width)
    .attr("height",stitle.height)
    .attr("transform", "translate(" + mtitle.left + "," + mtitle.top + ")");

var title_text = titleArea
				.append("text")
				.attr("x",stitle.width/2)
				.attr("y",stitle.height/2)
				.text("Computing time for betweenness edge and Modularity - VIS");

var mainArea = svg.append("g")
    .attr("class", "main-area")
    .attr("width",containerWidth)
    .attr("height",containerHeight)
    .attr("transform", "translate(" + margin.left + "," + stitle.height + ")");

var grid_line = mainArea.append("g")
			    .attr("class", "grid-lines");

var xScale = d3.scaleLinear()
    .range([0, containerWidth]);

var yScale = d3.scaleLinear()
    .range([containerHeight, 0]);

var barScale = d3.scaleLinear()
    .range([0,containerHeight]);

var xAxis = mainArea.append("g")
	  .attr("class", "axis axis--x")
	  .attr("transform", "translate(" + [0,containerHeight] + ")");

var yAxis = mainArea.append("g")
	  .attr("class", "axis axis--x");

svg.append("text")
		.attr("class","graph-title")
    	.attr("transform", "translate("+ [margin.left/2, margin.top+containerHeight/2] +")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Computing Time - s");

svg.append("text")
		.attr("class","graph-title")
    	.attr("transform", "translate("+ [margin.left+containerWidth/2, height-margin.bottom/2] +")")  // text is drawn off the screen top left, move down and out and rotate
        .text("Number of samples");

var legendSeries = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + legendX + "," + legendY + ")")
    .selectAll("g").data(seriesNames.reverse())
        .enter().append("g")
            .attr("class", function(d){return d})
            .attr("transform", function (d, i) { return "translate(0," + (i * legendSeriesHeight) + ")"; });

legendSeries.append("rect")
    .attr("class", "series-box")
    .attr("x", legendSeriesBoxX)
    .attr("y", legendSeriesBoxY)
    .attr("width", legendSeriesBoxWidth)
    .attr("height", legendSeriesBoxHeight)
    .attr("fill",function(d){return colorLegend(d);});

legendSeries.append("text")
    .attr("class", "series-label")
    .attr("x", legendSeriesLabelX)
    .attr("y", legendSeriesLabelY)
    .text(String);

var layersArea = mainArea.append("g")
    .attr("class", "layers")
    .attr("width",width-margin.right)
    .attr("height",height-margin.bottom);

var layers;

d3.selectAll(".joint-toggle input").on("change", changeChartMode);
d3.select("#save_button").attr("onclick", "save_file()");
d3.select("#try_button").attr("onclick","updateData(name_file)");
d3.select("#name_file").attr("onchange","readData(value)");
d3.queue().defer(readData,"vis").awaitAll(function(error, results) {
      if (error) throw error;
      console.log(results);
    });
/*var xAxis = d3.svg.axis()
    .scale(xScale) //binsScale)
    .ticks(numSamples)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");*/
function readData(value) {
	name_file = value;
	d3.json("data/"+value.toUpperCase()+"_time.json", function(error, data_raw) {
		if (error) throw error;
		title_text.text("Computing time for betweenness edge and Modularity - "+value.toUpperCase());
		earse_chart ();
		data = data_raw;
		var data_num = data_raw.length;
		maxStackY = 0;
		var min_v = data_raw[0].id;
		var max_v = data_raw[0].id;
		var min_d = min_v;
		var old_val = 0;
		var list_data = [0];
		data_raw.forEach(function(e,i){
			maxStackY = (maxStackY > e.values[1].value[1] ? maxStackY : e.values[1].value[1]);
			var dis = e.id-old_val;
			min_d = min_d < dis ? min_d : dis;
			min_v = min_v < e.id ? min_v : e.id;
			max_v = max_v > e.id ? max_v : e.id;
			old_val = e.id;
			list_data.push(e.id);
		});
		var min_s = min_d*2/3;
		xScale.domain([0, max_v+min_d/2]);
		xAxis.call(d3.axisBottom(xScale)
					.tickValues(list_data)
					);
		stackedBarWidth = containerWidth/(max_v+min_d/2)*min_s;

		yScale.domain([0, maxStackY*(1+legendScale_per)]);
		barScale.domain([0, maxStackY*(1+legendScale_per)]);


		var new_layers = layersArea.selectAll(".layer").data(data_raw);

		var newer = new_layers.enter().append("g")
					.attr("class", function(d){return d.id;});

    	var layerss = newer
    			.selectAll("rect")
    			.data(function (d) { d.values.forEach(function(e){e.value.push(d.id);});
    				return d.values; })
    			.enter().append("rect");

		layerss
					.attr("class",function(d){return d.key; })
					.attr("x", function(d){return (xScale(d.value[2])-stackedBarWidth/2);})
			        .attr("y", containerHeight)
			        .attr("width", stackedBarWidth)
			        .attr("height", 0)
			        .attr("fill",function(d){return colorLegend(d.key);})
			        .call(transition_animation);

		//layerss.exit().remove();
  		yAxis.call(transition_axis);
  		grid_line.selectAll(".grid-line").data(yScale.ticks())
			        .enter().append("line")
			            .attr("class", "grid-line")
			            .attr("x1", 0)
			            .attr("x2", containerWidth)
			            .attr("y1", yScale)
			            .attr("y2", yScale);
	});
}
function updateData(value) {
	d3.select("#try_button").style("background-color","lightsteelblue" );
	name_file=value;
	title_text.text("Computing time for betweenness edge and Modularity - "+value.toUpperCase());
	var list_o = filelist.filter(function(n,i){
		if (n.name==value){
			return n;
		}
	})
	var list=[];
	list_o[0].list.forEach(function(e){
		list.push(value+e+".json");
	});
	var min_v=d3.min(list_o[0].list);
	var max_v=d3.max(list_o[0].list);
	var min_d=min_v;
	for (var tm=1;tm<list_o[0].list.length;tm++){
		var dis = list_o[0].list[tm]-list_o[0].list[tm-1];
		min_d = min_d < dis ? min_d : dis;
	}
	var min_s = min_d*2/3;

	xScale.domain([0, max_v+min_d/2]);
	xAxis.call(d3.axisBottom(xScale)
				.tickValues([0].concat(list_o[0].list))
				);
	stackedBarWidth = containerWidth/((max_v-0+min_d/2)/min_s);

	var q=d3.queue();
	
	q.defer(earse_chart).defer(function(){data.splice(0);maxStackY=0;});

  	list_o[0].list.forEach(function(e){
  		q.defer(read_json,value,e,list_o[0].list[list.length-1]);});

  	q.defer(function(){d3.select("#try_button").style("background-color","lemonchiffon");})
  	.awaitAll(function(error, results) {
      if (error) throw error;
      console.log(results);
    });
}
function earse_chart (){
	var layer_All = layersArea.selectAll(".layer").data(data).enter();
	var group_All = layer_All.selectAll("g");
	var grid_line_All = grid_line.selectAll(".grid-line").remove();
	layer_All.selectAll("rect")
				.transition()
				.duration(animation_time)
				.delay(function(d,i){return i*animation_time_per})
				.attr("y", height-margin.bottom)
        		.attr("height", 0)
				.call(function () {
					console.log("I have been call");
					console.log("1");
					layer_All.remove();
					console.log("2");
					group_All.remove();
				});
}


function read_json(value,e,count){
	d3.json("data/"+value+e+".json", function(error, graph) {
		if (error) throw error;
		var num_n = graph.nodes.length;
		var start_time = performance.now();
		//processing
		var step = between_e(graph);
		var end_time_b = performance.now();
		var max_lv=step.length+1;
		// tree
		var tree_hi = tree_mapingv3(step,graph);
		var end_time_t = performance.now();
		var data_temp = {
			id:e,
			values: [
				{key: "Betweenness edge", value:[0,(end_time_b-start_time)/1000]},
				{key: "Modularity Q", value:[(end_time_b-start_time)/1000,(end_time_t-start_time)/1000]}]
			};
		maxStackY = (maxStackY > data_temp.values[1].value[1] ? maxStackY : data_temp.values[1].value[1]);

		yScale.domain([0, maxStackY*(1+legendScale_per)]);
		barScale.domain([0, maxStackY*(1+legendScale_per)]);

      	var old_layer = layersArea.selectAll(".layer").data(data).enter();
      	old_layer.selectAll("rect").call(transition_animation);
      	data.push(data_temp);

					//new_layers.remove();	
		 // JOIN new data with old elements.
		var new_layers = layersArea.selectAll(".layer").data([data_temp],function(d){return d;});


		// UPDATE old elements not present in new data.
		/* new_layers.exit()
		 			.attr("y", function(d){console.log("d[1]: "+d[1]+ "f: "+ yScale(d[1]));return (yScale(d[1]));})
			        .attr("height", function(d){return (barScale(d[1]-d[0]));})
			        .transition(t);*/
		// ENTER new elements present in new data.
		var newer = new_layers.enter().append("g")
		.attr("class", function(d){return d.id;});


    	var layerss = newer
    			.selectAll("rect")
    			.data(function (d) { return d.values; })
    			.enter().append("rect");

		layerss
					.attr("class",function(d){return d.key; })
					.attr("x", function(d){return (xScale(e)-stackedBarWidth/2);})
			        .attr("y", containerHeight)
			        .attr("width", stackedBarWidth)
			        .attr("height", 0)
			        .attr("fill",function(d){return colorLegend(d.key);})
			        .call(transition_animation);
		//layerss.exit().remove();
		layerss.merge(new_layers);
  		yAxis.call(transition_axis);
  		if (e === count)
  		grid_line.selectAll(".grid-line").data(yScale.ticks())
			        .enter().append("line")
			            .attr("class", "grid-line")
			            .attr("x1", 0)
			            .attr("x2", containerWidth)
			            .attr("y1", yScale)
			            .attr("y2", yScale);

	});
}


function transition_animation (selection){
	selection.transition()
        .duration(animation_time)
        .delay(function (d,i) { return i * animation_time_per; })
        .attr("y", function(d){return (yScale(d.value[1]));})
        .attr("height", function(d){return (barScale(d.value[1]-d.value[0]));});
}

function transition_axis (selection){
	selection.transition()
        .duration(animation_time)
        .delay(function (d,i) { return i * animation_time_per; })
        .call(d3.axisLeft(yScale));
}

function changeChartMode() {
	console.log(this.name);
	if (this.name==="animate"){
		if (this.value==="yes")
		{
			animation_time=4000;
			animation_time_per=20;
		}else{
			animation_time=0;
			animation_time_per=0;
		}
	}else{
	    chartMode = this.value;
	    if (chartMode === "stacked") {
	        //stackBars();
	    }
	    else {
	        //groupBars();
	    }
	}
}

function save_file() {
	console.log(data);
	try {
    var isFileSaverSupported = !!new Blob;
    var json_S = JSON.stringify(data);
    var file = new Blob([json_S],{type: "application/json"});
	saveAs(file,name_file+"_time.json");
	} catch (e) {
		console.log("file save error: "+e);
	}
}

