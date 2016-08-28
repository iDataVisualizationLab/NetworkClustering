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
  	ee.nodes.forEach(function(n,i){
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
  	/*ee.nodes.filter(function(n,i){
	  if (e.source==n.id)
	    ii=i;
	  else
	  	if (e.target==n.id)
	  		jj=i;
	});*/
	sum = sum+e.value;
    
	});
  return sum;
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
				arr[iii][jjj] = {nei: arr.length, val: av, ori:nei};
				//arr[iii][jjj].nei = arr.length;
				//arr[iii][jjj].val = av;

				arr.push([{nei: iii, val: av,ori:nei},{nei: nei,val: av,ori:iii}]);
				for (var z = 2; z<n;z++)
				{
					var ll = arr.length;
					//arr[ll-1][1].nei = ll;
					arr[ll-1][1] = {nei: ll, var: av, ori:iii};
					arr.push([{nei: ll-1, val: av},{nei: nei,val: av, ori:nei}]);
				}
				arr[nei].filter(function(n,i){
					if (n.nei==iii){
						arr[nei].splice(i,1,{nei: arr.length-1, val: av, ori:iii});
						//n.val = av; 
						//n.nei = arr.length-1;//last virtual node
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
      if (g1==-1&&grouping[i][j]==li[0])
          g1=i;
      if (g2==-1&&grouping[i][j]==li[1])
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
  var alink_fix = a_array_ext(alink_o,av)[0]; // add virtual nodes
  var num_n = graph.nodes.length;// num of node
  var step=[];
  var num_l = graph.links.length;
  //document.write("</br> av: "+av);
  while (step.length!=graph.links.length){
  	//var alink_oc = copyA(alink_o);
  	//document.write("</br> old array size: "+alink_o[3][0].nei);
  	//var alink_fix = a_array_ext(alink_oc,av); // add virtual nodes
  	//document.write("</br> old array size: "+alink_o[3][0].nei);
  	//var alink = alink_fix[0]; //fixed
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
        if (i<num_n) S.push(i);
        var l=Q.length;
        //document.write("</br>"+i+": ");
        //console.log(" to: "+i);
        alink_fix[i].forEach(function(e,indd){
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
					//console.log(i+" Pathd "+ Pathd[i]);
				  }else{
				  	Pathu[j]=Pathu[i];
				  	if (j<num_n){
					  	if (Pathd[alink_fix[i][indd].ori]==null)
							Pathd[alink_fix[i][indd].ori]=[j];
						else
							Pathd[alink_fix[i][indd].ori].push(j);
						
					}
					//console.log(alink_fix[i][indd].ori+" Pathd "+ Pathd[alink_fix[i][indd].ori]);
				  }
				  //console.log(j+" Pathu "+ Pathu[j]);

			}else{
				if (d[j]==d[i]+1){
				  w[j]=w[j]+w[i];
				  if (i<num_n){//not virtual node
				  	Pathu[j].push(i);
				  	if (j<num_n){
					  	if (Pathd[i]==null)
							Pathd[i]=[j];
						else
							Pathd[i].push(j);
					}//if j is virtual , j won't be visit second time
				  }else{
				  	if (j<num_n){
				  		Pathu[j].concat(Pathu[i]);
					  	if (Pathd[alink_fix[i][indd].ori]==null)
							Pathd[alink_fix[i][indd].ori]=[j];
						else
							Pathd[alink_fix[i][indd].ori].concat(Pathd[j]);
						
					}
				  }
				  //console.log(i+" Pathd "+ Pathd[i]);
				  //console.log(j+" Pathu "+ Pathu[j]);
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
      var gene =[];
      //Leaf
      /*while(Leaf.length!=0){
        var t=Leaf.pop();
        console.log("list Leaf: "+t);
        //S.filter(function(e,inde){if (e==t){ S.splice(inde,1); return;}});
        //document.write("</br>"+" -Leaf "+t);
        while (Pathu[t].length!=0){
          var i = Pathu[t].pop();
          eb[i][t] += w[i]/w[t];
          eb[t][i] += w[i]/w[t];
          ebs[i][t] += w[i]/w[t];
          ebs[t][i] += w[i]/w[t];
          //console.log(ebs[i][t]);
          if (ebs[i][t]>max_ebs[0]){
            max_ebs[0]=ebs[i][t];
            max_ebs[1]=i;
            max_ebs[2]=t;
          }
	      	if (ebs[t][i]>max_ebs[0]){
	            max_ebs[0]=ebs[t][i];
	            max_ebs[1]=t;
	            max_ebs[2]=i;
	      	}
       
        }
      }*/
      //document.write("</br>"+" ----- ");
      //document.write("</br>"+S);
      //cont
      S.splice(0,1);
      while (S.length!=0){
        var j = S.pop();
        //console.log(j+" -- "+d[j]);
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
	              //eb[j][i]+=w[i]/w[j]*sumb;
	              ebs[i][j]+=w[i]/w[j]*sumb;
	              //ebs[j][i]+=w[i]/w[j]*sumb;
	              //console.log("2-10: "+ebs[2][10]+" 10-12: "+ebs[10][12]+"10-9: "+ebs[9][10]);
	              //console.log(ebs[i][t]);
	              if (ebs[i][j]>max_ebs[0]){
	                max_ebs[0]=ebs[i][j];
	                max_ebs[1]=i;
	                max_ebs[2]=j;
	                //console.log("i: "+max_ebs[1]+" j: "+max_ebs[2]+" max "+max_ebs[0]);
	                //document.write("</br>"+"max "+ max_ebs);
	              }
	              else{
	              	if (ebs[i][j]==max_ebs[0]){
	              		if (Math.abs(d[i]-d[j])<Math.abs(d[max_ebs[1]]-d[max_ebs[2]])){
			                max_ebs[0]=ebs[i][j];
			                max_ebs[1]=i;
			                max_ebs[2]=j;
			                //console.log("i: "+max_ebs[1]+" j: "+max_ebs[2]+" max "+max_ebs[0]);
			                //document.write("</br>"+"max "+ max_ebs);
			            }
		              }
	              }

	            }
	          }
	      	}
	      	else{
	      		while (Pathu[j].length!=0){
	      		var i = Pathu[j].pop();
		          eb[i][j] = w[i]/w[j];
		          //eb[j][i] += w[i]/w[j];
		          ebs[i][j] += w[i]/w[j];
		         // ebs[j][i] += w[i]/w[j];
		          if (ebs[i][j]>max_ebs[0]){
		            max_ebs[0]=ebs[i][j];
		            max_ebs[1]=i;
		            max_ebs[2]=j;
		            //console.log("i: "+max_ebs[1]+" j: "+max_ebs[2]+" max "+max_ebs[0]);
		          } else{
	              	if (ebs[i][j]==max_ebs[0]){
	              		if (Math.abs(d[i]-d[j])<Math.abs(d[max_ebs[1]]-d[max_ebs[2]])){
			                max_ebs[0]=ebs[i][j];
			                max_ebs[1]=i;
			                max_ebs[2]=j;
			                //console.log("i: "+max_ebs[1]+" j: "+max_ebs[2]+" max "+max_ebs[0]);
			                //document.write("</br>"+"max "+ max_ebs);
			            }
		              }
	              }
			 
			      }
	      	}
      }
      //console.log("----end---- "+s);
    }
    if (max_ebs[0]!=0){
      step.push([max_ebs[1],max_ebs[2]]);
      //av = av*num_l;
      //document.write("</br>"+"max "+ max_ebs[0]);
      for (var i =0;i<alink_fix[max_ebs[1]].length;i++){
      	 //document.write("</br>"+"-- "+ alink_o[max_ebs[1]][i].nei);
      	if (alink_fix[max_ebs[1]][i].nei== max_ebs[2]||alink_fix[max_ebs[1]][i].ori== max_ebs[2]){
      		//av = av - alink_o[max_ebs[1]][i].val;
			//num_l--;
			//av = av/num_l;
			alink_fix[max_ebs[1]].splice(i,1);
			break;
      	}
      }

      for (var i =0;i<alink_fix[max_ebs[2]].length;i++){
      	 //document.write("</br>"+"--- "+ alink_o[max_ebs[2]][i].nei);
      	if (alink_fix[max_ebs[2]][i].nei== max_ebs[1]||alink_fix[max_ebs[2]][i].ori== max_ebs[1]){
			alink_fix[max_ebs[2]].splice(i,1);
			break;
      	}
      }
    }
    //console.log("----step: "+ step+"  av"+av+"</br>");
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
  	var sum = 0;
	for  (var k = 0;k<n;k++){
		if (k!=i && k!=j){
			A[i][k] = A[i][k]+A[j][k];
			A[k][i] = A [i][k];
			A[j][k] = 0;
			A[k][j] = 0;
		}
		sum += A[i][k]; 
	}
	a_e[i] = sum/2/m;
	a_e[j] = 0;
	return delta_Q;
}
function takeaname(d){
return d.label!=null? d.label:(d.name!=null?d.name:d.id);}
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
  grouping.push(ed);
  // join 2 nodes together
  Q_t +=  delta_Q(ed[0],ed[1],m,A,a_e);
  //----
  Q.push(Q_t);
  var hi=[{name: ed,children: [{name: takeaname(graph.nodes[ed[0]]), depth: 0},{name: takeaname(graph.nodes[ed[1]]), depth: 0}], depth: lv, Q: Q_t}];
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
	    hi[g1].children.push({name: takeaname(graph.nodes[li_t[0]]) , depth: 0});
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
	    hi.push({name: li,children: [{name: takeaname(graph.nodes[li[0]]), depth: 0},{name: takeaname(graph.nodes[li[1]]), depth: 0}], depth: lv, Q: Q_t});
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