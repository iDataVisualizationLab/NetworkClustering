/**
 * Created by alexnguyen on 2/16/17.
 */
function Graph() {
    this.vertices = [];
    this.adjList = [];
}

Graph.prototype.addEdge = function(vertex1, vertex2) {
    this.adjList[vertex1].push(vertex2);
    this.adjList[vertex2].push(vertex1);
};
function prececessor(G, source) {
    var level = 0;
    var nextlevel = [source];
    var seen = new Object();
    seen[source] = level;
    var pred = new Object();
    pred[source] = [];
    while (nextlevel.length > 0) {
        level +=1;
        var currentlevel = nextlevel;
        nextlevel=[];
        for(v=0;v<currentlevel.length;v++){
            for(var w=0;w<G[currentlevel[v]].length;w++){
                if(!seen.hasOwnProperty(G[currentlevel[v]][w])){
                    pred[G[currentlevel[v]][w]]=[currentlevel[v]];
                    seen[G[currentlevel[v]][w]]=level;
                    nextlevel.push(G[currentlevel[v]][w]);
                }else if(seen[G[currentlevel[v]][w]]==level){
                    pred[G[currentlevel[v]][w]].push(currentlevel[v]);
                }
            }
        }

    }
    return pred

}
function prececessor_length(G, source) {
    var level = 0;
    var nextlevel = [source];
    var seen = new Object();
    seen[source] = level;
    var pred = new Object();
    pred[source] = [];
    while (nextlevel.length > 0) {
        level +=1;
        var currentlevel = nextlevel;
        nextlevel=[];
        for(v=0;v<currentlevel.length;v++){
            for(var w=0;w<G[currentlevel[v]].length;w++){
                if(!seen.hasOwnProperty(G[currentlevel[v]][w])){
                    pred[G[currentlevel[v]][w]]=[currentlevel[v]];
                    seen[G[currentlevel[v]][w]]=level;
                    nextlevel.push(G[currentlevel[v]][w]);
                }else if(seen[G[currentlevel[v]][w]]==level){
                    pred[G[currentlevel[v]][w]].push(currentlevel[v]);
                }
            }
        }

    }
    return seen

}

function prececessorV_length(G, source, num_node) {
    var level = 0;
    var nextlevel = [source];
    var seen = new Object();
    seen[source] = level;
    var pred = new Object();
    pred[source] = [];
    while (nextlevel.length > 0) {
        level +=1;
        var currentlevel = nextlevel;
        nextlevel=[];
        for(v=0;v<currentlevel.length;v++){
            for(var w=0;w<G[currentlevel[v]].length;w++){
                if(!seen.hasOwnProperty(G[currentlevel[v]][w].nei)){
                    pred[G[currentlevel[v]][w].nei]=[currentlevel[v]];
                    seen[G[currentlevel[v]][w].nei]=level;
                    nextlevel.push(G[currentlevel[v]][w].nei);
                }else if(seen[G[currentlevel[v]][w].nei]==level){
                    pred[G[currentlevel[v]][w].nei].push(currentlevel[v]);
                }
            }
        }

    }
    for(var i=num_node;i<G.length;i++){
        delete seen[i];
    }
    return seen

}

function getObjectSortedValue(obj){
    return Object.values(obj).sort(function (a,b) {
        return  b-a;
    });
}
function a_array_ext(arr, av) {
    var l = arr.length;
    for (var iii = 0; iii < l; iii++) {
        for (var jjj = 0; jjj < arr[iii].length; jjj++) {
            var n = Math.round(arr[iii][jjj].val / av);
            var nei = arr[iii][jjj].nei;
            if (n > 1) {
                arr[iii][jjj] = {nei: arr.length, val: av, ori: nei};
                //arr[iii][jjj].nei = arr.length;
                //arr[iii][jjj].val = av;

                arr.push([{nei: iii, val: av, ori: nei}, {nei: nei, val: av, ori: iii}]);
                for (var z = 2; z < n; z++) {
                    var ll = arr.length;
                    //arr[ll-1][1].nei = ll;
                    arr[ll - 1][1] = {nei: ll, var: av, ori: iii};
                    arr.push([{nei: ll - 1, val: av}, {nei: nei, val: av, ori: nei}]);
                }
                arr[nei].filter(function (n, i) {
                    if (n.nei == iii) {
                        arr[nei].splice(i, 1, {nei: arr.length - 1, val: av, ori: iii});
                        //n.val = av;
                        //n.nei = arr.length-1;//last virtual node
                    }
                });
            }
        }
    }
    return [arr, av];
}
function a_array_av(ee) {
    var a = init_empty(ee.nodes.length);
    var sum = 0;
    var m = ee.links.length;
    ee.links.forEach(function (e) {
        var ii = 0;
        var jj = 0;
        ee.nodes.filter(function (n, i) {
            if (e.source == n.id)
                ii = i;
            else if (e.target == n.id)
                jj = i;
        });
        sum = sum + (e.value);
        a[ii].push({nei: jj, val: e.value});
        a[jj].push({nei: ii, val: e.value});

    });
    return [a, sum / m];
}
function init_empty(m) {
    var ar = [];
    for (var i = 0; i < m; i++) {
        var art = [];
        ar.push(art);
    }
    return ar;
}