
let adjList = {};
let nodesList = [];


                   function drawGraph() {
    const input = document.getElementById("edgeInput").value.trim();
    if (!input) return;

    const lines = input.split("\n");

    let nodes = new Set();
    let elements = [];
    adjList = {};

    lines.forEach((line, i) => {
        const [u, v] = line.trim().split(/\s+/);
        if (!u || !v) return;

        nodes.add(u);
        nodes.add(v);

        if (!adjList[u]) adjList[u] = [];
        if (!adjList[v]) adjList[v] = [];

        adjList[u].push(v);
        adjList[v].push(u);

        elements.push({
            data: { id: "e" + i, source: u, target: v }
        });
    });

    nodesList = Array.from(nodes);

    nodesList.forEach(n => {
        elements.push({ data: { id: n } });
    });

    if (window.cy && typeof window.cy.destroy === "function") {
        window.cy.destroy();
    }

    window.cy = cytoscape({
        container: document.getElementById("cy"),
        elements: elements,
        style: [
            { selector: 'node', style: { 'label': 'data(id)' } },
            { selector: 'edge', style: { 'width': 2 } }
        ],
        layout: { name: 'cose' }
    });

    updateProperties();
}
function updateProperties() {
    document.getElementById("nodeCount").innerText = nodesList.length;

    let edgeCount = 0;
    for (let u in adjList) {
        edgeCount += adjList[u].length;
    }
    document.getElementById("edgeCount").innerText = edgeCount / 2;

    document.getElementById("connected").innerText =
        isConnected() ? "YES" : "NO";
}

function isConnected() {
    let visited = {};
    let start = nodesList[0];
    dfs(start, visited);
    return nodesList.every(n => visited[n]);
}

function dfs(node, visited) {
    visited[node] = true;
    for (let neigh of adjList[node]) {
        if (!visited[neigh]) dfs(neigh, visited);
    }
}

function runBFS() {
    if (!nodesList.length) return;

    let visited = {};
    let queue = [];
    let order = [];

    queue.push(nodesList[0]);
    visited[nodesList[0]] = true;

    while (queue.length) {
        let u = queue.shift();
        order.push(u);

        for (let v of adjList[u]) {
            if (!visited[v]) {
                visited[v] = true;
                queue.push(v);
            }
        }
    }

    highlightBFS(order);
}

function highlightBFS(order) {
    let i = 0;
    let interval = setInterval(() => {
        if (i > 0) {
            cy.$(`#${order[i-1]}`).style('background-color', '#0074D9');
        }
        if (i === order.length) {
            clearInterval(interval);
            return;
        }
        cy.$(`#${order[i]}`).style('background-color', 'orange');
        i++;
    }, 600);
}


function runDFS() {
    if (!nodesList.length) return;

    let visited = {};
    let order = [];

    dfsAnim(nodesList[0], visited, order);
    highlightDFS(order);
}

function dfsAnim(node, visited, order) {
    visited[node] = true;
    order.push(node);

    for (let v of adjList[node]) {
        if (!visited[v]) {
            dfsAnim(v, visited, order);
        }
    }
}

function highlightDFS(order) {
    let i = 0;
    let interval = setInterval(() => {
        if (i > 0) {
            cy.$(`#${order[i-1]}`).style('background-color', '#0074D9');
        }
        if (i === order.length) {
            clearInterval(interval);
            return;
        }
        cy.$(`#${order[i]}`).style('background-color', 'purple');
        i++;
    }, 600);
}

function detectCycle() {
    let visited = {};
    for (let node of nodesList) {
        if (!visited[node]) {
            if (cycleDFS(node, visited, -1)) {
                alert("Cycle Detected ✅");
                return;
            }
        }
    }
    alert("No Cycle ❌");
}

function cycleDFS(u, visited, parent) {
    visited[u] = true;

    for (let v of adjList[u]) {
        if (!visited[v]) {
            if (cycleDFS(v, visited, u)) return true;
        } else if (v !== parent) {
            return true;
        }
    }
    return false;
}


function showComponents() {
    let visited = {};
    let colors = ['red', 'green', 'blue', 'orange', 'purple', 'brown'];
    let colorIndex = 0;

    for (let node of nodesList) {
        if (!visited[node]) {
            let comp = [];
            collectComponent(node, visited, comp);

            comp.forEach(n => {
                cy.$(`#${n}`).style('background-color', colors[colorIndex % colors.length]);
            });

            colorIndex++;
        }
    }
}

function collectComponent(node, visited, comp) {
    visited[node] = true;
    comp.push(node);

    for (let v of adjList[node]) {
        if (!visited[v]) {
            collectComponent(v, visited, comp);
        }
    }
}


function resetGraph() {
    nodesList.forEach(n => {
        cy.$(`#${n}`).style('background-color', '#0074D9');
    });
}


