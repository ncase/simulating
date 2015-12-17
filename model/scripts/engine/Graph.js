(function (exports) {
  var Graph = exports.Graph = {};

  // largest horizontal space between two points on the graph
  Graph.MAX_INTERVAL = 10;
  Graph.MAX_POINTS = 200;

  Graph.container = document.getElementById("graph_container");
  Graph.svg = document.getElementById("graph");

  // Initial setup
  Graph.initialize = function create() {
    Graph.defs = Graph.svg.appendChild(svg('defs'));
    Graph.graph = Graph.svg.appendChild(svg('g'));

    Graph.data = [];
    Graph.paths = [];

    subscribe("/grid/updateAgents", Graph.update);
    subscribe("/ui/updateStateHeaders", Graph.updateDefs);

    Graph.updateDefs();
    Graph.draw();
  };

  Graph.updateDefs = function updateDefs() {
    // Define the repeating patterns we use to fill each part of the graph
    Graph.defs.innerHTML = Model.data.states
      .map(function (state) {
        return '<pattern id="p_' + state.id + '" width="20" height="20" patternUnits="userSpaceOnUse">' +
          '<text x="0" y="16">' + state.icon + '</text>' +
          '</pattern>';
      })
      .join('\n');

    // Clear old paths:
    Graph.graph.innerHTML = '';

    // Create elements for each path
    Graph.paths = Model.data.states
      .map(function (state) {
        var path = svg('path');
        path.style.fill = 'url(#p_' + state.id + ')';
        path.style.stroke = '#888'
        return Graph.graph.appendChild(path);
      });

    Graph.draw();
  };

  Graph.update = function update() {
    // grab a new set of data...
    Graph.data.push(countAgents(Grid.array));

    // check we're note over our limit:
    if (Graph.data.length > Graph.MAX_POINTS) Graph.data.shift();

    // ...and draw the thing
    Graph.draw();
  };

  Graph.draw = function draw() {
    var width = Graph.container.clientWidth,
      height = Graph.container.clientHeight,
      total = Grid.array.length * Grid.array[0].length,
      intervalSize = Math.min(width / (Graph.data.length - 1), Graph.MAX_INTERVAL);

    Graph.svg.setAttribute('width', width);
    Graph.svg.setAttribute('height', height);

    // SVG paths draw a shape by tracing a set of points.
    // In each path, forwards has the points on the bottom of the shape,
    // and backwards has the points on the top.
    var paths = Model.data.states.map(function (state) {
      return {forwards: [], backwards: []};
    });

    var x = 0;

    for (var i = 0; i < Graph.data.length; i++) {
      var data = Graph.data[i],
        bottom = 0;

      for (var j = 0; j < Model.data.states.length; j++) {
        var state = Model.data.states[j],
          path = paths[j];

        path.forwards.push(x + ' ' + (height * bottom / total));
        bottom += data[state.id];
        path.backwards.push(x + ' ' + (height * bottom / total));
      }

      x += intervalSize;
    }

    for (i = 0; i < paths.length; i++) {
      var pathString;
      if (paths[i].forwards.length) {
        pathString = 'M ' + paths[i].forwards
          .concat(paths[i].backwards.reverse())
          .join(' L ');
      } else {
        pathString = 'M 0 0';
      }
      Graph.paths[i].setAttribute('d', pathString);
    }
  };

  // count agents of each state
  function countAgents(grid) {
    var stats = {};

    for (var i = 0; i < Model.data.states.length; i++)
      stats[Model.data.states[i].id] = 0;

    for (var y = 0; y < grid.length; y++) {
      for (var x = 0; x < grid[y].length; x++) {
        var agent = grid[y][x];
        stats[agent.stateID] += 1;
      }
    }

    return stats;
  }

  function svg(name) {
    var ns = "http://www.w3.org/2000/svg";
    return document.createElementNS(ns, name);
  }

})(window);
