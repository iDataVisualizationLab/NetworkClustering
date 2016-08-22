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
        .text("Computing Time - ms");

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
	var count =0;
	var min_s = min_d*2/3;

	xScale.domain([0, max_v+min_d/2]);
	xAxis.call(d3.axisBottom(xScale)
				.tickValues([0].concat(list_o[0].list))
				);
	stackedBarWidth = containerWidth/((max_v-0+min_d/2)/min_s);

	var q=d3.queue();
	
	q.defer(earse_chart).defer(function(){data.splice(0);maxStackY=0;});

  	list_o[0].list.forEach(function(e){
  		q.defer(read_json,value,e,count);
  		count++;});

  	q.defer(function(){d3.select("#try_button").style("background-color","lemonchiffon");})
  	.awaitAll(function(error, results) {
      if (error) throw error;
      console.log(results);
    });
  	/*console.log(layersArea.selectAll("g").data());
  	layers = layersArea.selectAll("g");
  	layers.selectAll("rect").data(data,function (d) { console.log(d.values);return d.values; })
				    .enter().append("rect")
			        .attr("x", function(d){return (xScale(count));})
			        .attr("y", function(d){return (yScale(d[1]));})
			        .attr("width", stackedBarWidth)
			        .attr("height", function(d){return (yScale(d[1]));});*/
}
function earse_chart (){
	var layer_All = layersArea.selectAll(".layer").data(data).enter();
	var group_All = layer_All.selectAll("g");
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
				{key: "Betweenness edge", value:[0,(end_time_b-start_time)]},
				{key: "Modularity Q", value:[(end_time_b-start_time),(end_time_t-start_time)]}]
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

function findnei(a,key,av){
  var nei=[];
  if (key[1])//virtual node
  {
  	if (a[a[2]][a[0]]>0){//virtual node next
	  	a[a[2]][a[0]] -=av;
	  	a[a[0]][a[2]] -=av;
	  	nei.push(key);
  	}else{
  		nei.push([a[0],false,a[2]]);
  	}
  }else{
	  for (var i=0;i<a[0].length;i++){
	    if (a[key[0]][i]>0){
	    	if (a[key[0]][i]>av)
	      		nei.push([i,true,key[0]]);// virtual node 
	      	else
	      		nei.push([i,false,key[0]]);
	      a[key[0]][i]-=av;
	      a[i][key[0]]-=av;
	    }
	  } 
	}
  return nei;
}

function init(m,n){
    var ar= [];
    for (var i = 0; i < m; i++) {
      var art=[];
      for (var j = 0; j < n; j++) {
        art.push(0);
      }
      ar.push(art);
    }
    return ar;
  }

function init_empty(m){
    var ar= [];
    for (var i = 0; i < m; i++) {
      var art=[];
      ar.push(art);
    }
    return ar;
  }

function a_array(ee){
  var a = init(ee.nodes.length,ee.nodes.length);
  ee.links.forEach(function(e){
  	var ii=0;
  	var jj=0;
  	ee.nodes.filter(function(n,i){
	  if (e.source==n.id)
	    ii=i;
	  else
	  	if (e.target==n.id)
	  		jj=i;
	});
	a[ii][jj]=e.value;
	a[jj][ii]=e.value;
	});
  return a;
}

function a_array_av(ee){
  var a = init_empty(ee.nodes.length);
  var sum = 0;
  var m = ee.links.length;
  ee.links.forEach(function(e){
  	var ii=0;
  	var jj=0;
  	ee.nodes.filter(function(n,i){
	  if (e.source==n.id)
	    ii=i;
	  else
	  	if (e.target==n.id)
	  		jj=i;
	});
	sum = sum + (e.value);
	a[ii].push({nei: jj,val: e.value});
	a[jj].push({nei: ii,val: e.value});
    
	});
  return [a,sum/m];
}



function calculate_m(ee){
  var sum = 0;
  var m = ee.links.length;
  ee.links.forEach(function(e){
  	var ii=0;
  	var jj=0;
  	ee.nodes.filter(function(n,i){
	  if (e.source==n.id)
	    ii=i;
	  else
	  	if (e.target==n.id)
	  		jj=i;
	});
	sum = sum+e.value;
    
	});
  return [sum];
}

function a_array_ext(arr,av){
	var l = arr.length;
	for (var iii=0;iii<l;iii++){
		for (var jjj=0; jjj<arr[iii].length;jjj++)
		{
			var n = Math.round(arr[iii][jjj].val/av);
			var nei = arr[iii][jjj].nei;
			if (n>1)
			{
				arr[iii][jjj].nei = arr.length;
				arr[iii][jjj].val = av; 
				arr.push([{nei: iii, val: av},{nei: nei,val: av}]);
				for (var z = 2; z<n;z++)
				{
					var ll = arr.length;
					arr[ll-1][1].nei = ll;
					arr.push([{nei: ll-1, val: av},{nei: nei,val: av}]);
				}
				arr[nei].filter(function(n,i){
					if (n.nei==iii){
						n.val = av; 
						n.nei = arr.length-1;//last virtual node
					}
				});
			}
		}
	}
	return [arr,av];
}

function finditem(grouping,li,graph){
  var g1=-1;
  var g2=-1;
  for (var i=0;(i<grouping.length)&&(g1==-1||g2==-1);i++){
    for (var j=0;(j<grouping[i].length)&&(g1==-1||g2==-1);j++){ 
      if (g1==-1&&grouping[i][j]==graph.nodes[li[0]].id)
          g1=i;
      if (g2==-1&&grouping[i][j]==graph.nodes[li[1]].id)
          g2=i;
    }
  }
  return [g1,g2];
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


function copyA(a){
	var b=[];
	a.forEach(function(e){
		var bb=[];
		e.forEach(function(e){
			bb.push(clone(e));	
			});
		b.push(bb);
	});
	return b;
}
//virtual nodes
function between_e(graph){
  var alink_o = a_array_av(graph); // orgiginal
  var av = alink_o[1];
  alink_o = alink_o[0];
  var num_n = graph.nodes.length;// num of node
  var step=[];
  var num_l = graph.links.length;
  //document.write("</br> av: "+av);
  while (step.length!=graph.links.length){
  	var alink_oc = copyA(alink_o);
  	//document.write("</br> old array size: "+alink_o[3][0].nei);
  	var alink_fix = a_array_ext(alink_oc,av); // add virtual nodes
  	//document.write("</br> old array size: "+alink_o[3][0].nei);
  	var alink = alink_fix[0]; //fixed
    // calculate
    var ebs=init(num_n,num_n);
    var max_ebs=[0,0,0];
    for (var s = 0; s < num_n; s++) {
      var S=[];
      var Leaf=[];
      var Pathu=[];
      var Pathd=[];
      var d=[];
      var w=[];
      d[s]=0;
      w[s]=1;
      var Q=[];
      Q.push(s);
      while (Q.length!=0){
        var i = Q.shift();
        S.push(i);
        var l=Q.length;
        //document.write("</br>"+i+": ");
        alink[i].forEach(function(e){
        	var j = e.nei;
			if (d[j]==null){
				d[j]=d[i]+1;
				w[j]=w[i];
				Q.push(j);

				if (i<num_n){//not virtual node
				  	Pathu[j]=[i];
				  	if (j<num_n){
					  	if (Pathd[i]==null)
							Pathd[i]=[j];
						else
							Pathd[i].push(j);
					}
				  }else{
				  	Pathu[j]=Pathu[i];
				  	if (j<num_n){
					  	if (Pathd[Pathu[i][Pathu[i].length-1]]==null)
							Pathd[Pathu[i][Pathu[i].length-1]]=[j];
						else
							Pathd[Pathu[i][Pathu[i].length-1]].push(j);
						
					}
				  }

			}else{
				if (d[j]==d[i]+1){
				  w[j]=w[j]+w[i];
				  if (i<num_n){//not virtual node
				  	Pathu[j].push(i);
				  }else{
				  	Pathu[j].concat(Pathu[i]);
				  	if (j<num_n){
					  	if (Pathd[Pathu[i][Pathu[i].length-1]]==null)
							Pathd[Pathu[i][Pathu[i].length-1]]=[j];
						else
							Pathd[Pathu[i][Pathu[i].length-1]].concat(Pathd[j]);
						
					}
				  }
				}
	        }//document.write("</br>"+" - "+e.nei+": "+"d :"+d[e.nei]+"w :"+w[e.nei]);
	    });
        if (Q.length ==l&&(i!=s)&&(i<num_n))
          Leaf.push(i);
  	}
  	/*for (var i=0;i<num_n;i++){
  		document.write("</br>"+" - "+i+" - w:"+w[i]);

  		document.write("</br>"+" --- u");
  		if(Pathu[i]!=null)
  		Pathu[i].forEach(function(e){document.write("- "+e);});
  	document.write("</br>"+" --- d");
  	if(Pathd[i]!=null)
  		Pathd[i].forEach(function(e){document.write("- "+e);});
  	};*/
      var eb=init(num_n,num_n);
      //Leaf
      while(Leaf.length!=0){
        var t=Leaf.pop();
        //document.write("</br>"+" -Leaf "+t);
        while (Pathu[t].length!=0){
          var i = Pathu[t].pop();
          eb[i][t] = w[i]/w[t];
          //eb[t][i] = w[i]/w[t];
          ebs[i][t] += w[i]/w[t];
          //ebs[t][i] += w[i]/w[t];
          if (ebs[i][t]>max_ebs[0]){
            max_ebs[0]=ebs[i][t];
            max_ebs[1]=i;
            max_ebs[2]=t;
          }
        }
      }
      //document.write("</br>"+" ----- ");
      //document.write("</br>"+S);
      //cont
      while (S.length!=0){
        var j = S.pop();
        if (j<num_n){
	        if (Pathd[j]!=null)
	        {
	        	//document.write("</br> -- "+j);
	          var sumb=1;
	          while (Pathd[j].length!=0){
	            var jj = Pathd[j].pop();
	            sumb+=eb[j][jj];
	          }
	          if (Pathu[j]!=null)
	          {
	            while (Pathu[j].length!=0){
	              var i = Pathu[j].pop();
	              eb[i][j]=w[i]/w[j]*sumb;
	              //eb[j][i]=w[i]/w[j]*sumb;
	              ebs[i][j]+=w[i]/w[j]*sumb;
	              //ebs[j][i]+=w[i]/w[j]*sumb;
	              if (ebs[i][j]>max_ebs[0]){
	                max_ebs[0]=ebs[i][j];
	                max_ebs[1]=i;
	                max_ebs[2]=j;
	                //document.write("</br>"+"max "+ max_ebs);
	              }
	            }
	          }
	      	}
        }
      }
    }
    if (max_ebs[0]!=0){
      step.push([max_ebs[1],max_ebs[2]]);
      av = av*num_l;
      //document.write("</br>"+"max "+ max_ebs[0]);
      for (var i =0;i<alink_o[max_ebs[1]].length;i++){
      	 //document.write("</br>"+"-- "+ alink_o[max_ebs[1]][i].nei);
      	if (alink_o[max_ebs[1]][i].nei== max_ebs[2]){
      		av = av - alink_o[max_ebs[1]][i].val;
			num_l--;
			av = av/num_l;
			alink_o[max_ebs[1]].splice(i,1);
			break;
      	}
      }

      for (var i =0;i<alink_o[max_ebs[2]].length;i++){
      	 //document.write("</br>"+"--- "+ alink_o[max_ebs[2]][i].nei);
      	if (alink_o[max_ebs[2]][i].nei== max_ebs[1]){
			alink_o[max_ebs[2]].splice(i,1);
			break;
      	}
      }
    }
    //document.write("----step: "+ step+"  av"+av+"</br>");
  }
  return step;
}

function Q_init(A,m,a_e){
	var n = A.length;
	var Q = 0;
	for  (var i = 0;i<n;i++){
		var sum = 0;
		for (var j = 0;j<n;j++){
			sum +=A[i][j];
		}
		a_e.push(sum/2/m);
		Q-=Math.pow(sum/2/m,2);
	}
	return Q;
}

function delta_Q(i,j,m,A,a_e){
	var n = A.length;
	var delta_Q = 2*(A[i][j]/2/m-a_e[i]*a_e[j]);
	//update
  	A[i][i] += A[j][j]+A[i][j]+A[j][i];
  	A[j][j] = 0;
  	A[j][i] = 0;
  	A[i][j] = 0;
  	var sum = A[i][i];
	for  (var k = 0;k<n;k++){
		if (k!=i && k!=j){
			A[i][k] += A[j][k];
			A[k][i] = A [i][k];
			A[j][k] = 0;
			A[k][j] = 0;
			sum += A[i][k]; 
		}
	}
	a_e[i] = sum/2/m;
	a_e[j] = 0;
	return delta_Q;
}

function tree_mapingv3(step,graph){
  var grouping = [];	
  var ed = step.pop();
  var lv = 1;
  var m = calculate_m(graph);
  var A = a_array(graph);
  var a_e = [];
  var Q = [];
  var Q_t = Q_init(A,m,a_e);
  Q.push(Q_t);
  grouping.push([graph.nodes[ed[0]].id,graph.nodes[ed[1]].id]);
  // join 2 nodes together
  Q_t +=  delta_Q(ed[0],ed[1],m,A,a_e);
  //----
  Q.push(Q_t);
  var hi=[{name: [ed[0],ed[1]],children: [{name: graph.nodes[ed[0]].name!=null?graph.nodes[ed[0]].name:graph.nodes[ed[0]].id, depth: 0},{name: graph.nodes[ed[1]].name!=null?graph.nodes[ed[1]].name:graph.nodes[ed[1]].id, depth: 0}], depth: lv, Q: Q_t}];
  while (step.length!=0){
    var li=step.pop();
    // 4 main case
	for (var i=0;i<grouping.length;i++){
    	var g=finditem(grouping,li,graph);}

	var g1=g[0];
	var g2=g[1];
	if (g1!=g2){
		lv++;
	  if (g1!=-1&&g2!=-1){
	    // 2 groups -> new group
	    //Q
	    Q_t += delta_Q(grouping[g1][0],grouping[g2][0],m,A,a_e);
	    Q.push(Q_t);
	    //move
	    grouping.splice(g1,1,grouping[g1].concat(grouping[g2]));
	    grouping.splice(g2,1);
	    var hi_t=[];
	    hi_t.push(hi[g1]);
	    hi_t.push(hi[g2]);
	    hi[g1]={name: li,children: hi_t,depth: lv, Q: Q_t};
	    hi.splice(g2,1);
	    //document.write("case 1 "+g1+" "+g2+"   "+JSON.stringify(hi)+"</br>");
	  }else{
	    // 1 element + 1 group -> new group
	    var li_t= li;
	    if (g2==-1){// li[1] is new element
	      li_t[0]=li_t[1];
	    }else{
	      g1=g2;
	    }
	    //Q
	    Q_t += delta_Q(grouping[g1][0],li[0],m,A,a_e);
	    Q.push(Q_t);
	    //move
	    grouping[g1].push(li[0]);
	    hi[g1]={name: li,children: [hi[g1]], depth: lv, Q:Q_t};
	    hi[g1].children.push({name: graph.nodes[li_t[0]].name!=null?graph.nodes[li_t[0]].name:graph.nodes[li_t[0]].id , depth: 0});
	    //document.write("case 2 "+JSON.stringify(hi)+"</br>");
	  }
	}else{
	  if (g1==-1)
	  {
	  	lv++;
	  	//Q
	    Q_t += delta_Q(li[0],li[1],m,A,a_e);
	    Q.push(Q_t);
	    //move
	    grouping.push(li);
	    hi.push({name: li,children: [{name: graph.nodes[li[0]].name!=null?graph.nodes[li[0]].name:graph.nodes[li[0]].id, depth: 0},{name: graph.nodes[li[1]].name!=null?graph.nodes[li[1]].name:graph.nodes[li[1]].id, depth: 0}], depth: lv, Q: Q_t});
	    //document.write("case 3 "+JSON.stringify(hi)+"</br>");
	  }
	}
  }
  if (hi.length==1){
    return [hi[0],Q];
  }
  else{
  	hi[0]={name: "join all",children: [hi[0]],depth: lv+1, Q: Q_t};
  	while (grouping.length != 1){
	  	Q_t += delta_Q(grouping[0][0],grouping[1][0],m,A,a_e);
	  	grouping.splice(0,1,grouping[0].concat(grouping[1]));
	    grouping.splice(1,1);
	    hi[0].children.push(hi[1]);
    	hi.splice(1,1);
	}

	Q.push(Q_t);
    return [hi[0],Q];
  }
}

