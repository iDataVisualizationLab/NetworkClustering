/*title
 var svg_ti = d3.select("#title").append("svg")
 .attr("width","100%").attr("height","30px");
 svg_ti.append("rect").attr("width","100%")
 .attr("height","30px").attr("background","#000");*/
//body
var margin = {top: 0, right: 20, bottom: 20, left: 0};
var width = (window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth) - margin.left - margin.right;
var height = (window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight) - margin.top - margin.bottom;

var wtree_b_g = width * 0.25;
var htree_b_g = width * 0.125;
var mtree_g = {top: 10, right: 50, bottom: 50, left: 50};
var wtree_g = wtree_b_g - mtree_g.left - mtree_g.right;
var htree_g = htree_b_g - mtree_g.top - mtree_g.bottom;

var wtree_b = width * 0.25;
var htree_b = height - htree_b_g;
var mtree = {top: 10, right: 50, bottom: 0, left: 50};
var wtree = wtree_b - mtree.left - mtree.right;
var htree = htree_b - mtree.top - mtree.bottom;

var wgroup = width - wtree - mtree.left - mtree_g.right;
var hgroup = height;
var bar_pos = [{x1: 0, y1: height, x2: 0, y2: 0}];

var wtime = 300;
var htime = 50;
var mtime = {top: (hgroup - htime - 10), right: 0, bottom: 0, left: (wgroup - wtime - 10)};

//Setup svgFDG parameters
var padding = 1.5, // separation between same-color circles
    clusterPadding = 16, // separation between different-color circles
    maxRadius = 12;

//End


d3.select("#container").append("div").attr("id", "group").attr("class", "group").style("left", (margin.left + wtree_b) + "px");
var svg = d3.select("#group").append("svg")
    .attr("width", wgroup)
    .attr("height", hgroup)
    .attr("id", "svgFDG")
var svg_graph = d3.select("#treemap_graph").append("svg")
// .style("background", "#eed")

    .attr("width", wtree_b_g)
    .attr("height", htree_b_g)
    .append("g")
    .attr("width", wtree_b_g)
    .attr("height", htree_b_g);

d3.select("#treemap_main").append("div").attr("id", "treemap_tree").attr("class", "treemap_tree").style("top", (margin.top + htree_b_g) + "px");
var svg4 = d3.select("#treemap_tree")
    .append("svg")
    .style("position", "absolute")
    .attr("width", wtree_b)
    .attr("height", htree_b)
    .append("g")
    .attr("width", wtree_b)
    .attr("height", htree_b)
    .attr("transform", "translate(" + [mtree.left, mtree.top] + ")");
var svg_bar = d3.select("#treemap_bar").append("svg")
// .style("background", "#eed")
    .attr("width", wtree_b)
    .attr("height", height);
//.attr("transform", "translate(" + [mtree_g.left, mtree_g.top] + ")");
var color = d3.scaleOrdinal(d3.schemeCategory10);


var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter((width - wtree_b) / 2, height / 2));
var tree = d3.cluster()
    .size([htree, wtree])
    .separation(function (a, b) {
        return 1;
    });
var bar = svg_bar.append("g")
    .attr("class", "bar")
    .attr("transform", "translate(" + [mtree_g.left, mtree_g.top] + ")");
var bar_l1 = bar
    .append("line")
    .classed('b', true)
    .data(bar_pos)
    .style("stroke-dasharray", "4, 2")
    .style("stroke-width", "2px")
    .attr("x1", function (d) {
        return d.x1;
    })
    .attr("y1", function (d) {
        return d.y1;
    })
    .attr("x2", function (d) {
        return d.x2;
    })
    .attr("y2", function (d) {
        return d.y2;
    });
var bar_l2 = bar.append("line")
    .classed('a', true)
    .data(bar_pos)
    .style("opacity", "0")
    .attr("x1", function (d) {
        return d.x1;
    })
    .attr("y1", function (d) {
        return d.y1;
    })
    .attr("x2", function (d) {
        return d.x2;
    })
    .attr("y2", function (d) {
        return d.y2;
    });
var focus;
var tree_dx;
var node2;
var node;
var roots;
var tree_deep_cv;
var radius = 6;
/*
 <<<<<<< HEAD

 =======
 >>>>>>> f41cb8646193b11f7aab076bf481cc71363c0550*/
// d3.json("data/karate.json", function(error, graph) {
d3.json("data/imdb171.json", function (error, graph) {
    // d3.json("data/dataset4_fix.json", function(error, graph) {
    if (error) throw error;
    // for(var i=0;i<graph.links.length;i++){
    //     console.log("G.add_edge("+graph.links[i].source+","+ graph.links[i].target+", weight="+ graph.links[i].value+")")
    // }

    var num_n = graph.nodes.length;
    var sample_properties = 0.7;
    var alpha = Math.floor(num_n * sample_properties);
    var start_time = performance.now();
//processing
//     var step = edge_betweenness_centrality(graph, k = alpha, normalized = true, weight = true, virtual = false);
    var step = _betweennness_virtual(graph,k=10);
    // var step = between_e(graph);
    var end_time_b = performance.now();
    var max_lv = step.length + 1;
// tree
    var tree_hi = tree_mapingv3(step, graph);
    var end_time_t = performance.now();
    var tree_deep = d3.scaleLinear().domain([tree_hi[0].depth, 0]).range([0, wtree]);
    tree_deep_cv = d3.scaleLinear().domain([tree_hi[0].depth, 0]).range([0, tree_hi[1].length]);
    tree_dx = wtree / tree_hi[1].length;
//end
    roots = d3.hierarchy(tree_hi[0]);
    tree(roots);
    var link2 = svg4.selectAll(".link")
        .data(roots.descendants().slice(roots.name == "join all" ? (roots.children.length + 1) : 1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function (d) {
            return "M" + [tree_deep(d.data.depth), d.x]
                + "L" + [tree_deep(d.parent.data.depth), d.x]
                + "L" + [tree_deep(d.parent.data.depth), d.parent.x];
            /*+ "C" + [(tree_deep(d.parent.data.depth)+tree_deep(d.data.depth))/2, d.x]
             + " " + [tree_deep(d.parent.data.depth), (d.x+d.parent.x)/2]
             + " " + [tree_deep(d.parent.data.depth), d.parent.x];*/
        })
        .attr("stroke", function (d) {
            return color(1);
        });

    function size_scale() {
        if (num_n * 2 * 4 < htree)
            return 1;
        else
            return htree / (num_n * 2 * 4);
    }

    var resize = size_scale();

    node2 = svg4.selectAll(".node")
        .data(roots.leaves(), function (d) {
            return d.data.name;
        })
        .enter().append("g")
        .attr("class", " node--leaf")
        .attr("transform", function (d) {
            return "translate(" + [tree_deep(d.data.depth), d.x] + ")";
        });
    //console.log(roots.leaves().length);
    node2.append("circle")
        .attr("r", resize * 4)
        .attr("fill", function (d) {
            return color(1)
        });

    node2.append("text")
        .attr("y", resize * 4)
        .attr("x", resize * 4 + 1)
        //.style("text-anchor", "end")
        .style("font-size", 9.5 * resize + "px")
        //.attr("transform", function(d) { return "rotate(" + (0) + ")"; })
        .text(function (d) {
            return d.data.name;
        });

    var clusterbox = d3.select("#treemap_tree").append("rect")
        .attr("class", "clusterbox")
        .style("display", "none");
    clusterbox.append("text");
    var time_box = svg.append("g")
    //.attr("transform","translate(" + mtime.left +","+ mtime.top + ")");

        .attr("class", "timebox")
        .attr("width", wtime)
        .attr("height", htime)
        .attr("transform", "translate(" + mtime.left + "," + mtime.top + ")");
    time_box.append("rect").attr("width", wtime)
        .attr("height", htime);
    time_box
        .append("text")
        .attr("transform", "translate(" + [10, 20] + ")")
        .text("Computing time for betweenness edge: " + Math.round(end_time_b - start_time) + " ms");
    time_box
        .append("text")
        .attr("transform", "translate(" + [10, 35] + ")")
        .text("Computing time for Modularity Q: " + Math.round(end_time_t - end_time_b + start_time) + " ms");
    //-------------graph
    var domain = {x: {min: 0, max: 0}, y: {min: 0, max: 0}};
    domain.y.min = d3.min(tree_hi[1]);
    domain.y.max = (d3.max(tree_hi[1]) - d3.min(tree_hi[1])) * 1.1 + d3.min(tree_hi[1]);

    var y_range = d3.scaleLinear().domain([domain.y.min, domain.y.max]).range([htree_g, 0]);
    var x_range = d3.scaleLinear().domain([tree_hi[1].length, 1]).range([wtree_g, 0]);
    var max_Q = {pos: 0, val: tree_hi[1][0]};
    var line_g = d3.line()
        .x(function (d, i) {
            if (d > max_Q.val) {
                max_Q.val = d;
                max_Q.pos = i
            }
            return x_range(tree_hi[1].length - i);
        })
        .y(function (d) {
            return y_range(d);
        });

    svg_graph.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + [mtree_g.left, mtree_g.top + htree_g] + ")")
        .call(d3.axisBottom(x_range).tickSize(5));

    svg_graph.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + [mtree_g.left, mtree_g.top] + ")")
        .call(d3.axisLeft(y_range));

    svg_graph.append("path")
        .attr("class", "graph")
        .attr("transform", "translate(" + [mtree_g.left, mtree_g.top] + ")")
        .data([1])
        .attr("d", line_g(tree_hi[1]));

    svg_graph.append("text")
        .attr("class", "graph-title")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + [mtree_g.left - 35, mtree_g.top + htree_g / 2] + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Modularity - Q");
    svg_graph.append("text")
        .attr("class", "graph-title")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + [mtree_g.left + wtree_g / 2, mtree_g.top + htree_g + 35] + ")")  // text is drawn off the screen top left, move down and out and rotate
        .text("Number of clusters");

    focus = svg_graph.append("g")
        .attr("transform", "translate(" + [mtree_g.left, mtree_g.top] + ")")
        .append("g")
        .attr("class", "focus")

        .style("display", "none");

    focus.append("circle")
        .attr("r", 4.5);

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

    focus.append("line")
        .classed("x", true)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1.5px")
        .attr("stroke-dasharray", "3 3");

    /*svg_bar.append("rect")
     .attr("class", "overlay")
     .attr("width", wtree_g)
     .attr("height", htree_g)
     .attr("transform", "translate(" + [mtree_g.right, mtree_g.top] + ")")
     .on("mouseover", function(d){ focus.style('display', null)})
     .on("mouseout", function(d){focus.style('display', 'none')})
     .on("mousemove", mousemove);
     function mousemove() {
     var x0 = Math.round(x_range.invert(d3.mouse(this)[0]));
     d = y_range(tree_hi[1][x0]);
     focus.attr("transform", "translate(" + x_range(x0)+ "," + (d ) + ")");
     focus.select("text").text(tree_hi[1][x0]);
     focus.select("line.y")
     .attr("x1",0)
     .attr("y1",0)
     .attr("x2",0)
     .attr("y2",d);
     }*/

    //---------------node
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return Math.sqrt(d.value);
        });

    node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        //.data(graph.nodes)
        .data(graph.nodes, function (d) {
            return d.id;
        })
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
            return color(d.group);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function (d) {
            return takeaname(d);
        });
    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) {
            return takeaname(d);
        });

    simulation.force("charge", d3.forceManyBody().strength(-10));
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
        .velocityDecay(0.2)
        .force("x", d3.forceX().strength(.0005))
        .force("y", d3.forceY().strength(.0005));

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        node
            .attr("cx", function (d) {
                return d.x
            })
            .attr("cy", function (d) {
                return d.y
            })
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
    }

    //---------------------init bar
    bar_l2.attr("transform", function (d) {
        return "translate(" + [x_range(tree_hi[1].length - max_Q.pos), 0] + ")"
    });
    bar_l1.attr("transform", function (d) {
        return "translate(" + [x_range(tree_hi[1].length - max_Q.pos), 0] + ")"
    });
    var x0 = x_range(tree_hi[1].length - max_Q.pos);
    y0 = y_range(max_Q.val);
    focus.attr("transform", "translate(" + x0 + "," + y0 + ")");
    focus.select("text").text(max_Q.val);
    focus.select("line.x")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", -x0)
        .attr("y2", 0);
    bar_l2.attr("x1", function (d) {
        d.x1 = x0;
        return bar_pos.x1
    });
    var numofg = 1;
    update_group(tree_hi[1].length - max_Q.pos - 1);
    //---------------
    bar_l2.call(d3.drag()
        .on("start", dragstarted_bar)
        .on("drag", dragged_bar)
        .on("end", dragended_bar))
        .on("mousemove", dragstarted_bar)
        .on("mouseout", mouseout);

    function mouseout(d) {
        bar_l2.style("opacity", "0");
        focus.style('display', "none");
        clusterbox.style("display", "none");
    }

    function dragstarted_bar(d) {
        bar_l2.style("opacity", "0.5");
        focus.style('display', null);
        clusterbox.style("display", null);
        var x0 = Math.round(x_range.invert(d.x1));
        d = y_range(tree_hi[1][tree_hi[1].length - x0]);
        focus.attr("transform", "translate(" + x_range(x0) + "," + (d ) + ")");
        focus.select("text").text(tree_hi[1][tree_hi[1].length - x0]);
        focus.select("line.x")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", -x_range(x0))
            .attr("y2", 0);
    }

    function dragged_bar(d) {
        bar_l2.on("mouseout", null)
        d.x1 += d3.event.dx;
        if (d.x1 <= 0)
            d.x1 = 0;
        else {
            if (d.x1 >= wtree)
                d.x1 = wtree;

            else {
                bar_l2.attr("transform", function (d) {
                    return "translate(" + [d.x1, 0] + ")"
                });
                bar_l1.attr("transform", function (d) {
                    return "translate(" + [d.x1, 0] + ")"
                });
            }

        }
        var x0 = Math.round(x_range.invert(d.x1));
        d = y_range(tree_hi[1][tree_hi[1].length - x0]);
        focus.attr("transform", "translate(" + x_range(x0) + "," + (d ) + ")");
        focus.select("text").text(tree_hi[1][tree_hi[1].length - x0]);
        focus.select("line.x")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", -x_range(x0))
            .attr("y2", 0);
        //d.x2 = d.x1;
        clusterbox.select("text").text("# of clusters : " + (x0 + 1) + " | Q : " + Math.round((tree_hi[1][tree_hi[1].length - x0]) * 1000) / 1000);
    }

    function dragended_bar(d) {
        bar_l2.style("opacity", "0")
            .on("mouseout", mouseout);
        ;
        focus.style('display', "none");
        var depth = Math.round(x_range.invert(d.x1)) - 1;
        if (depth < 0)
            depth = 0;
        //update_group(depth tree_hi[1].length-max_Q.pos-1);
        update_group(depth);
    }

    function update_group(depth) {
        console.log("test if here first time: " + depth)
        clusters = new Array(depth);

        var cg = 0;
        var leave = [];
        var node_t = [];
        node_t.push(roots);
        while (node_t.length != 0) {
            var node_t_t = node_t.pop();
            if (tree_deep_cv(node_t_t.data.depth) < depth) {
                if (node_t_t.children != null)
                    node_t = node_t_t.children.concat(node_t);
                else
                    leave.push(node_t_t);
            } else {
                leave.push(node_t_t);
            }
        }
        numofg = leave.length;
        clusterbox.select("text").text("# of clusters : " + leave.length + " | Q : " + Math.round(tree_hi[1][tree_hi[1].length - 1 - depth] * 1000) / 1000);
        for (var j = 0; j < leave.length; j++) {
            //update for tree windown
            node2.data(leave[j].leaves(), function (d) {
                return takeaname(d.data);
            })
                .selectAll("circle")
                .attr("fill", function (d) {
                    return color(j);
                });
            var node_temp = [];
            link2.data(leave[j].descendants(), function (d) {
                return takeaname(d.data);
            })
                .attr("stroke", function (d) {
                    return color(j);
                });
            //update for right group windown
            leave[j].leaves().forEach(function (e) {
                simulation.nodes().filter(function (n) {
                    if (takeaname(n) == e.data.name) {
                        n.group = j;
                        node_temp.push(n);
                    }
                })
            });
            node.attr("fill", function (d) {
                return color(d.group)
            });
        }

        graph.nodes.forEach(function (d) {
            if (!clusters[d.group]) {
                clusters[d.group] = d;
            }
        })

        var newlinks = [];
        graph.links.forEach(function (d, i) {
            if (d.source.group === d.target.group)
                newlinks.push(i);
        })
        simulation.force("cluster", clustering);
        simulation.alphaTarget(0.2).restart();
        link.attr("opacity", function (d, i) {
            return newlinks.indexOf(i) > -1 ? 0.1 : 1;
        })


        function clustering(alpha) {
            graph.nodes.forEach(function (d) {
                var cluster = clusters[d.group];
                if (cluster === d) return;
                var x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = 10;
                if (l !== r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster.x += x;
                    cluster.y += y;
                }
            });
        }
    }


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



