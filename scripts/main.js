var margin = {top: 0, right: 0, bottom: 0, left: 0};
var width = document.body.clientWidth - margin.left - margin.right;
var height = 800 - margin.top - margin.bottom;

var wtree = width*0.5;
var htree = height-width*0.25;
var wtree_g = width*0.5;
var htree_g = width*0.25;
var tree_zoom=1;
var tree_margin = {top: 0, right: 0, bottom: 5, left: 5};
var bar_pos = [{x1:margin.right, y1:height+margin.top,x2:margin.right, y2:margin.bottom}];
var svg = d3.select("#group").append("svg")
   // .style("background", "#eed")
    .attr("width", width*0.5)
    .attr("height", height);
var svg_graph = d3.select("#treemap_graph").append("svg")
   // .style("background", "#eed")
    .attr("width", wtree_g)
    .attr("height", htree_g);
var svg4 = d3.select("#treemap_tree")
	.append("svg")
   // .style("background", "#eed")
    .attr("width", wtree)
    .attr("height", htree);
var svg_bar = d3.select("#treemap_bar").append("svg")
   // .style("background", "#eed")
    .attr("width", wtree)
    .attr("height", height);
var color = d3.scaleOrdinal(d3.schemeCategory20);


var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 4, height / 4));
var tree = d3.cluster()
    .size([htree, wtree]);
    //.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2); });
var bar = svg_bar.append("g")
      .attr("class", "bar")
    .selectAll("line")
    .data(bar_pos)
    .enter().append("line")
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
var tree_dx;
var node2;
var roots;
//data
d3.json("data/dataset1.json", function(error, graph) {
if (error) throw error;
//processing
	var step = between_e(graph);
	var max_lv=step.length+1;
// tree
	var tree_hi = tree_mapingv2(step,graph);
	tree_dx = tree_zoom*wtree/(max_lv-1);
//end
	roots = d3.hierarchy(tree_hi[0]);
	tree(roots);
	var link2 = svg4.selectAll(".link")
	  .data(roots.descendants().slice(1))
	  .enter().append("path")
	  .attr("class", "link")
	  .attr("d", function(d) {
	    return "M" + [tree_dx*d.data.depth+tree_margin.right, d.x]
	        + "C" + [tree_dx*(d.parent.data.depth+d.data.depth)/2+tree_margin.right, d.x]
	        + " " + [tree_dx*d.parent.data.depth+tree_margin.right, (d.x+d.parent.x)/2]
	        + " " + [tree_dx*d.parent.data.depth+tree_margin.right, d.parent.x];
	  })
	  .attr("stroke", function(d) { return color(1); });

	node2 = svg4.selectAll(".node")
	      .data(roots.leaves())
	      .enter().append("g")
	      .attr("class", " node--leaf")
	      .attr("transform", function(d) { return "translate(" + [tree_dx*d.data.depth, d.x] + ")"; });
	node2.append("circle")
	      .attr("r", 5)
	      .attr("fill", function(d) { return color(d.parent==null? 0:(d.parent.x+d.parent.y)/30); });

	node2.append("text")
	      .attr("dy", ".31em")
	      .attr("x", -6)
	      .style("text-anchor", "end")
	      .attr("transform", function(d) { return "rotate(" + (0) + ")"; })
	      .text(function(d) { return d.data.name; });
  //-------------graph
	var y_range = d3.scaleLinear().domain([d3.min(tree_hi[1]), d3.max(tree_hi[1])]).range([htree_g, 0]);
	var x_range = d3.scaleLinear().domain([0, tree_hi[1].length-1]).range([wtree_g, 0]);
	var line_g = d3.line()
	    .x(function(d,i) { return x_range(i); })
	    .y(function(d) { return y_range(d); });
	svg_graph.append("g")
	  .attr("class", "axis axis--x")
	  .attr("transform", "translate(0," + htree_g + ")")
	  .call(d3.axisBottom(x_range));

	svg_graph.append("g")
	  .attr("class", "axis axis--y")
      .call(d3.axisLeft(y_range))
	.append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
	  .text("modularity");

	svg_graph.append("path")
      .attr("class", "graph")
      .data([1])
  		.attr("d", line_g(tree_hi[1]));

  //---------------node   
  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });
  node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.id });
  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
  bar.call(d3.drag()
	.on("start", dragstarted_bar)
	.on("drag", dragged_bar)
	.on("end", dragended_bar));
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
function dragstarted_bar(d) {
}

function dragged_bar(d) {
  d.x1 += d3.event.dx;
  if (d.x1<=margin.right)
  	d.x1 = margin.right;
  else{
  	if (d.x1>= wtree+margin.right)
  		d.x1 = wtree+margin.right
  	else
  		d3.select(this).attr("transform", function(d){
                return "translate(" + [ d.x1,0 ] + ")"});
  }
  d.x2 = d.x1;   
}

function dragended_bar(d) {
  var depth = Math.floor(d.x1/tree_dx);
  var cg = 0;
  //roots.each(function(d){if d.data.depth>=depth i++;})
  node2.selectAll("circle").attr("fill",function(d) { return color(depth); });
}


function findbi(e,key,start,end){
  while (start<=end){
    var p = Math.floor((start+end)/2);
    if (e.links[p].source<key){
      start=p+1;      
    }else{
      if (e.links[p].source>key){
        end=p-1;
      }else{
        return p;
      }
    }
  }
  return -1;
}

function findnei(e,key){
  var nei=[];
  var p = findbi(e,key,0,e.links.length-1);
  var i=p;
  while (i>-1&&e.links[i].source==key){
    nei.push(e.links[i].target);
    i--;
  }
  i=p+1;
  while (i<e.links.length&&e.links[i].source==key){
    nei.push(e.links[i].target);
    i++;
  } 
  return nei;
}

function findnei2(a,key){
  var nei=[];
  for (var i=0;i<a[0].length;i++){
    if (a[key][i]==1)
      nei.push(i);
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

function a_array(e){
  var a = init(e.links.length,e.links.length); 
  for (var i =0; i< e.links.length ; i++){
    a[e.links[i].source][e.links[i].target]=e.links[i].value;
    a[e.links[i].target][e.links[i].source]=e.links[i].value;
  }
  return a;
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

function between_e(graph){
  var alink = a_array(graph);
  var step=[];
  while (step.length!=graph.links.length){
    // calculate
    var ebs=init(alink[0].length,alink[0].length);
    var max_ebs=[0,0,0];
    for (var s = 0; s < graph.nodes.length; s++) {
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
        var nei=findnei2(alink,i);
        var l=Q.length;
        for (var jj in nei){
          var j=nei[jj];
          if (d[j]==null){
            d[j]=d[i]+1;
            w[j]=w[i];
            Q.push(j);
            Pathu[j]=[i];
            if (Pathd[i]==null)
              Pathd[i]=[j];
            else
              Pathd[i].push(j);
          }else{
            if (d[j]==d[i]+1){
              w[j]=w[j]+w[i];
              Pathu[j].push(i);
              if (Pathd[i]==null)
                Pathd[i]=[j];
              else
                Pathd[i].push(j);
            }
          }
        }
        if (Q.length ==l&&i!=s)
          Leaf.push(i);
      }
      var eb=init(alink[0].length,alink[0].length);
      //Leaf
      while(Leaf.length!=0){
        var t=Leaf.pop();
        while (Pathu[t].length!=0){
          var i = Pathu[t].pop();
          eb[i][t] += w[i]/w[t];
          eb[t][i] += w[i]/w[t];
          ebs[i][t] += w[i]/w[t];
          ebs[t][i] += w[i]/w[t];
          if (ebs[i][t]>max_ebs[0]){
            max_ebs[0]=ebs[i][t];
            max_ebs[1]=i;
            max_ebs[2]=t;
          }
        }
      }
      //cont
      while (S.length!=0){
        var j = S.pop();
        if (Pathd[j]!=null)
        {
          var sumb=1;
          while (Pathd[j].length!=0){
            var jj = Pathd[j].pop();
            sumb+=eb[j][jj];
          }
          if (Pathu[j]!=null)
          {
            while (Pathu[j].length!=0){
              var i = Pathu[j].pop();
              eb[i][j]+=w[i]/w[j]*sumb;
              eb[j][i]+=w[i]/w[j]*sumb;
              ebs[i][j]+=w[i]/w[j]*sumb;
              ebs[j][i]+=w[i]/w[j]*sumb;
              if (ebs[i][j]>max_ebs[0]){
                max_ebs[0]=ebs[i][j];
                max_ebs[1]=i;
                max_ebs[2]=j;
              }
            }
          }
        }
      }
    }
    if (max_ebs[0]!=0){
      step.push([max_ebs[1],max_ebs[2]]);
      alink[max_ebs[1]][max_ebs[2]]=0;
      alink[max_ebs[2]][max_ebs[1]]=0;
    }
  }
  return step;
}

function tree_maping(step,graph){
  var grouping = [];
  var ed = step.pop();
  grouping.push([graph.nodes[ed[0]].id,graph.nodes[ed[1]].id]);
  var hi=[{name: ed[0]+"-"+ed[1],children: [{name: graph.nodes[ed[0]].id},{name: graph.nodes[ed[1]].id}]}];
  while (step.length!=0){
    var li=step.pop();
    // 4 main case
  for (var i=0;i<grouping.length;i++)
    var g=finditem(grouping,li,graph);
    var g1=g[0];
    var g2=g[1];
    if (g1!=g2){
      if (g1!=-1&&g2!=-1){
        // 2 groups -> new group
        grouping.splice(g1,1,grouping[g1].concat(grouping[g2]));
        grouping.splice(g2,1);
        var hi_t=[];
        hi_t.push(hi[g1]);
        hi_t.push(hi[g2]);
        hi[g1]={name: li[0]+"-"+li[1],children: hi_t};
        hi.splice(g2,1);
        
        //document.write("case 1 "+g1+" "+g2+"   "+JSON.stringify(hi)+"</br>");
      }else{
        // 1 element + 1 group -> new group
        var nam= li[0]+"-"+li[1];
        if (g2==-1){// li[1] is new element
          li[0]=li[1];
        }else{
          g1=g2;
        }
        grouping[g1].push(li[0]);
        hi[g1]={name: nam,children: [hi[g1]]};
        hi[g1].children.push({name: graph.nodes[li[0]].id});
        //document.write("case 2 "+JSON.stringify(hi)+"</br>");
      }
    }else{
      if (g1==-1)
      {
        grouping.push(li);
        hi.push({name: li[0]+"-"+li[1],children: [{name: graph.nodes[li[0]].id},{name: graph.nodes[li[1]].id}]});
        //document.write("case 3 "+JSON.stringify(hi)+"</br>");
      }else{
        var hi_t=[];
        hi_t.push(hi[g1]);
        hi[g1]={name: li[0]+"-"+li[1],children: hi_t};
        //document.write("case 4 "+JSON.stringify(hi)+"</br>");
      }
    }
  }
  if (hi.length==1){
    return hi[0];
  }
  else{
    return hi;
  }
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
			sum += A[i][k]*2; 
		}
	}
	a_e[i] = sum/2/m;
	a_e[j] = 0;
	return delta_Q;
}

//add modularity
function tree_mapingv2(step,graph){
  var grouping = [];	
  var ed = step.pop();
  var lv = step.length;
  var max_lv = lv+1;
  var m = graph.links.length;
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
  var hi=[{name: [ed[0],ed[1]],children: [{name: graph.nodes[ed[0]].id, depth: max_lv},{name: graph.nodes[ed[1]].id, depth: max_lv}], depth: lv, Q: Q_t}];
  while (lv!=0){
    var li=step.pop();
    lv--;
    // 4 main case
	for (var i=0;i<grouping.length;i++){
    	var g=finditem(grouping,li,graph);}

	var g1=g[0];
	var g2=g[1];
	if (g1!=g2){
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
	    hi[g1].children.push({name: graph.nodes[li_t[0]].id, depth: max_lv});
	    //document.write("case 2 "+JSON.stringify(hi)+"</br>");
	  }
	}else{
	  if (g1==-1)
	  {
	  	//Q
	    Q_t += delta_Q(li[0],li[1],m,A,a_e);
	    Q.push(Q_t);
	    //move
	    grouping.push(li);
	    hi.push({name: li,children: [{name: graph.nodes[li[0]].id, depth: max_lv},{name: graph.nodes[li[1]].id, depth: max_lv}], depth: lv, Q: Q_t});
	    //document.write("case 3 "+JSON.stringify(hi)+"</br>");
	  }else{
	  	//Q
	    Q.push(Q_t);
	    //move
	    var hi_t=[];
	    hi_t.push(hi[g1]);
	    hi[g1]={name: li,children: hi_t,depth: lv, Q:Q_t};
	    //document.write("case 4 "+JSON.stringify(hi)+"</br>");
	  }
	}
  }
  if (hi.length==1){
    return [hi[0],Q];
  }
  else{
    return [hi,Q];
  }
}
