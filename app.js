var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var nodes = [
    { id: 1, name: "Nodo 1", type: "Cargar Datos" },
    { id: 2, name: "Nodo 2", type: "Filtro Pasa Banda" }
];

var links = [
    { source: 1, target: 2 } 
];

var simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 5);

node.append("title")
    .text(function(d) { return d.name; });

simulation
    .nodes(nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(links);

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

function resize() {
    var container = d3.select('#svg-container');
    var svg = container.select('svg');
    svg.attr('width', container.node().getBoundingClientRect().width);
    svg.attr('height', container.node().getBoundingClientRect().height);
    simulation.force("center", d3.forceCenter(container.node().getBoundingClientRect().width / 2, container.node().getBoundingClientRect().height / 2));
    simulation.alpha(1).restart(); 
}

resize();
window.addEventListener('resize', resize);

function updateDescription() {
    var descriptionDiv = document.getElementById('description');
    descriptionDiv.innerHTML = ''; 

    var header = document.createElement('h2');
    header.innerText = 'Desc';
    descriptionDiv.appendChild(header);

    nodes.forEach(node => {
        var nodeText = document.createElement('p'); 
        nodeText.innerText = `Nodo ${node.id} - ${node.name}: ${node.type}`;
        descriptionDiv.appendChild(nodeText);
    });

    links.forEach(link => {
        var linkText = document.createElement('p'); 
        linkText.innerText = `Enlace desde Nodo ${link.source.id} a Nodo ${link.target.id}`;
        descriptionDiv.appendChild(linkText);
    });
}


updateDescription();


var lastNodeId = nodes.length; 

function addNode() {
    lastNodeId++; 
    var newNode = {
        id: lastNodeId,
        name: `Nodo ${lastNodeId}`,
        type: "Nuevo Tipo"
    };
    nodes.push(newNode);
    updateSimulation();
    updateDescription();
    updateNodeList();
}


function removeNode(nodeId) {
    nodes = nodes.filter(node => node.id !== nodeId);
    links = links.filter(link => link.source.id !== nodeId && link.target.id !== nodeId);
    updateSimulation();
    updateDescription();
    updateNodeList(); 
}


function updateNodeList() {
    var nodeList = document.getElementById('nodeList');
    nodeList.innerHTML = ''; 

    nodes.forEach(node => {
        var nodeDiv = document.createElement('div');
        nodeDiv.innerText = node.name;
        var deleteButton = document.createElement('button');
        deleteButton.innerText = 'Eliminar Nodo';
        deleteButton.onclick = function() { removeNode(node.id); };
        nodeDiv.appendChild(deleteButton);
        nodeList.appendChild(nodeDiv);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addNode').addEventListener('click', addNode);
});



updateNodeList();


function updateSimulation() {
    
    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
    link.exit().remove();
    link = link.enter().append("line").attr("class", "link").merge(link);

    
    node = node.data(nodes, function(d) { return d.id; });
    node.exit().remove();
    node = node.enter().append("circle").attr("class", "node").attr("r", 5)
        .merge(node)
        .call(d3.drag() 
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    
    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

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


var zoom = d3.zoom()
    .scaleExtent([1 / 2, 4])
    .on("zoom", zoomed);

svg.call(zoom);

function zoomed() {
    svg.attr("transform", d3.event.transform);
}

var isDraggable = false;
var isZoomable = false;

function toggleDragMode() {
    isDraggable = !isDraggable;
    isZoomable = false;

    var dragButton = document.getElementById('toggleDrag');
    var zoomButton = document.getElementById('toggleZoom');

    if (isDraggable) {
        dragButton.classList.add('button-active');
        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    } else {
        dragButton.classList.remove('button-active');
        node.on(".drag", null);
    }
    zoomButton.classList.remove('button-active');
    svg.on(".zoom", null);
}

function toggleZoomMode() {
    isZoomable = !isZoomable;
    isDraggable = false;

    var zoomButton = document.getElementById('toggleZoom');
    var dragButton = document.getElementById('toggleDrag');

    if (isZoomable) {
        zoomButton.classList.add('button-active');
        svg.call(zoom);
    } else {
        zoomButton.classList.remove('button-active');
        svg.on(".zoom", null);
    }
    dragButton.classList.remove('button-active');
    node.on(".drag", null);
}


document.getElementById('toggleDrag').addEventListener('click', toggleDragMode);
document.getElementById('toggleZoom').addEventListener('click', toggleZoomMode);


toggleDragMode(); 
