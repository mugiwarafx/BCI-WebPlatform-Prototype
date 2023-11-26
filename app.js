var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var nodes = [
    { id: 1, name: "Datos 1", type: "Data JSON", description: "Descripción del Nodo 1" },
    { id: 2, name: "Filtros 2", type: "Filtro Pasa Banda", description: "Descripción del Nodo 2" },
];

const nodeTypes = {
    "Filtros": ["Pasa banda", "Pasa bajo", "Pasa alto", "CAR"],
    "Preprocesamiento": ["Normalizar", "Extraer trials", "Trocear señales", "Seleccionar eventos", "Seleccionar canales", "Extraer ERP"],
    "Extracción de características": ["Estadística", "Hjorth", "Transformada de Fourier", "Densidad espectral de potencia", "Wavelets", "Autoencoder"],
    "Clasificadores": ["LDA", "KNN", "SVM", "Red neuronal"],
    "Validación": ["K-fold cross validation", "Hold out validation"],
    "Datos": ["Data JSON", "Data CSV"]
};


var links = [
    { source: 1, target: 2 } 
];

var simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-15000)) // Aumenta la fuerza de repulsión
    .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g");

node.append("rect")
    .attr("class", "node")
    .attr("width", 120) // Ancho del rectángulo
    .attr("height", 120) // Altura del rectángulo
    .attr("rx", 10) // Radio del borde en el eje X
    .attr("ry", 10); // Radio del borde en el eje Y

node.append("text")
    .attr("x", 10) // Posición X relativa al rectángulo dentro del grupo
    .attr("y", 20) // Posición Y relativa al rectángulo dentro del grupo
    .text(function(d) { return d.name; })
    .each(function() { wrapText(d3.select(this), 100); }) // Ajusta el ancho según sea necesario
    .attr("class", "node-text");
    


node.append("text")
    .attr("x", 10) // Posición X para el texto
    .attr("y", 50) // Posición Y para la segunda línea de texto (parte inferior)
    .text(function(d) { return d.type; }) // Solo muestra el tipo
    .each(function() { wrapText(d3.select(this), 100); }) // Ajusta el ancho según sea necesario
    .attr("class", "node-text");



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
        .attr("transform", function(d) {
            return "translate(" + (d.x - 60) + "," + (d.y - 30) + ")";
        });
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

    let counter = 0;
    nodes.forEach(node => {
        counter++;
        var nodeText = document.createElement('p'); 
        nodeText.innerText = `Step ${counter} / ${node.name} / ${node.type}`;
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
    const selectedType = document.getElementById('nodeTypeSelector').value;
    const description = document.getElementById('nodeDescription').value;
    const sourceNodeId = parseInt(document.getElementById('sourceNodeSelector').value, 10);

    const typeKey = findKeyByValue(selectedType);
    lastNodeId++;

    const newNode = {
        id: lastNodeId,
        name: `${typeKey} ${lastNodeId}`,
        type: selectedType,
        description: description,
        x: width / 2, // Posición inicial en el centro
        y: height / 2 // Posición inicial en el centro
    };

    nodes.push(newNode);
    links.push({ source: sourceNodeId, target: lastNodeId });

    updateSimulation();
    updateDescription();
    updateNodeList();
    updateNodeSelectors();
}


function findKeyByValue(value) {
    for (const key in nodeTypes) {
        if (nodeTypes[key].includes(value)) {
            return key;
        }
    }
    return null; // o manejar de otra manera si el tipo no se encuentra
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
    // Actualizar enlaces
    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
    link.exit().remove();
    link = link.enter().append("line").attr("class", "link").merge(link);

    // Actualizar nodos
    node = node.data(nodes, function(d) { return d.id; });
    node.exit().remove();

    // Crear nuevos nodos como grupos
    var newNode = node.enter().append("g");

    newNode.append("rect")
        .attr("class", "node")
        .attr("width", 120)
        .attr("height", 120)
        .attr("rx", 10) // Radio del borde en el eje X
        .attr("ry", 10); // Radio del borde en el eje Y

    newNode.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .text(function(d) { return d.name; })
        .attr("class", "node-text");

    newNode.append("text")
        .attr("x", 10)
        .attr("y", 50)
        .text(function(d) { return d.type; })
        .attr("class", "node-text");

    node = newNode.merge(node);
    
    // Aplicar la funcionalidad de arrastre a todos los nodos
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Reiniciar la simulación con los nuevos nodos
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



function fillNodeTypeSelector() {
    const selector = document.getElementById('nodeTypeSelector');
    for (const category in nodeTypes) {
        const group = document.createElement('optgroup');
        group.label = category;
        nodeTypes[category].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.text = type;
            group.appendChild(option);
        });
        selector.appendChild(group);
    }
}

fillNodeTypeSelector();

document.getElementById('addNode').addEventListener('click', addNode);


function updateNodeSelectors() {
    const sourceSelector = document.getElementById('sourceNodeSelector');

    sourceSelector.innerHTML = '';

    nodes.forEach(node => {
        const sourceOption = document.createElement('option');
        sourceOption.value = node.id;
        sourceOption.text = node.name;
        sourceSelector.appendChild(sourceOption.cloneNode(true));
    });
}

function addLink() {
    const sourceNodeId = parseInt(document.getElementById('sourceNodeSelector').value, 10);
    const targetNodeId = parseInt(document.getElementById('targetNodeSelector').value, 10);

    // Verificar que no se esté creando un enlace al mismo nodo
    if (sourceNodeId !== targetNodeId) {
        const newLink = { source: sourceNodeId, target: targetNodeId };
        links.push(newLink);
        updateSimulation();
        updateDescription();
        updateNodeList();
    } else {
        alert("No se puede crear un enlace al mismo nodo.");
    }
}

//document.getElementById('addLinkButton').addEventListener('click', addLink);

document.addEventListener('DOMContentLoaded', function() {
    updateNodeSelectors();
});

function wrapText(textElement, width) {
    let words = textElement.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    let lineHeight = 1.4; // Espacio entre líneas
    let y = textElement.attr("y");
    let dy = 0; // Valor inicial para 'dy'

    let tspan = textElement.text(null).append("tspan")
        .attr("x", 10)
        .attr("y", y)
        .attr("dy", dy + "em");

    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            // Ajusta la posición y para cada nueva línea
            tspan = textElement.append("tspan")
                .attr("x", 10)
                .attr("y", y)
                .attr("dy", (++lineNumber * lineHeight) + "em")
                .text(word);
        }
    }
}
