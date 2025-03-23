import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './DependencyGraph.css';

const DependencyGraph = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.nodes || !data.links) {
      console.warn('Invalid data format for dependency graph');
      return;
    }

    const width = 800;
    const height = 600;

    // Clear previous graph
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    svg.selectAll('*').remove();

    // Add zoom functionality
    const g = svg.append('g');
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    // Create forces
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Add links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value || 1));

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(drag(simulation));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 8)
      .attr('fill', d => getNodeColor(getNodeType(d.id)));

    // Add labels to nodes
    node.append('text')
      .text(d => getShortName(d.id))
      .attr('x', 12)
      .attr('y', 4)
      .style('font-size', '12px')
      .style('fill', '#333');

    // Add titles for hover
    node.append('title')
      .text(d => d.id);

    // Handle simulation updates
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Highlight connected nodes on hover
    node.on('mouseover', (event, d) => {
      const connectedNodes = new Set();
      data.links.forEach(link => {
        if (link.source.id === d.id) connectedNodes.add(link.target.id);
        if (link.target.id === d.id) connectedNodes.add(link.source.id);
      });

      node.style('opacity', n => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.1);
      link.style('opacity', l => l.source.id === d.id || l.target.id === d.id ? 1 : 0.1);
    }).on('mouseout', () => {
      node.style('opacity', 1);
      link.style('opacity', 1);
    });

  }, [data]);

  const getNodeType = (path) => {
    if (path.includes('/components/')) return 'component';
    if (path.includes('/services/')) return 'service';
    if (path.includes('/routes/')) return 'route';
    if (path.includes('/models/')) return 'model';
    return 'other';
  };

  const getNodeColor = (type) => {
    switch(type) {
      case 'component': return '#69b3a2';
      case 'service': return '#e66465';
      case 'route': return '#4169e1';
      case 'model': return '#ffd700';
      default: return '#aaaaaa';
    }
  };

  const getShortName = (path) => {
    const parts = path.split('/');
    return parts[parts.length - 1].replace('.js', '');
  };

  const drag = (simulation) => {
    const dragstarted = (event) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    };

    const dragged = (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    };

    const dragended = (event) => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    };

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  return (
    <div className="dependency-graph">
      <div className="graph-legend">
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#69b3a2' }}></span>
          <span>Components</span>
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#e66465' }}></span>
          <span>Services</span>
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#4169e1' }}></span>
          <span>Routes</span>
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#ffd700' }}></span>
          <span>Models</span>
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#aaaaaa' }}></span>
          <span>Other</span>
        </div>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default DependencyGraph; 