import { Component, Input, AfterViewInit, EventEmitter, Inject } from '@angular/core';
// import {
//   select,
//   Selection,
//   forceSimulation, forceLink, forceManyBody, forceCenter,
//   scaleOrdinal,
//   drag,
//   event,
//   schemeCategory10,
//   Simulation, SimulationNodeDatum, SimulationLinkDatum,
//  } from 'd3';
import { UserNoName } from 'octokat';
import { ColorHelper } from '../utils/color';
import { Graph, GraphLink } from '../models/graph';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData, UserInfoBoxComponent } from '../user-info-box/user-info-box.component';
import { xml } from 'd3';
import { pointOnLineAtDistance } from '../utils/math';

// class D3NodeData implements SimulationNodeDatum {
//   id: string;
//   name: string;
//   index?: number;
//   x?: number;
//   y?: number;
//   vx?: number;
//   vy?: number;
//   fx?: number | null;
//   fy?: number | null;
// }

// class D3LinkData implements SimulationLinkDatum<D3NodeData> {
//   source: string | number D3NodeData;
//   target: string | number | D3NodeData;
//   index?: number;
// }

declare var d3: any;


@Component({
  selector: 'app-following-graph',
  templateUrl: './following-graph.component.html',
  styleUrls: ['./following-graph.component.scss']
})
export class FollowingGraphComponent implements AfterViewInit {


  @Input() graph: Graph<UserNoName> = new Graph<UserNoName>();
  @Input() rootUserName = '';
  @Input() viewBoxWidth = 30000;
  @Input() viewBoxHeight = 30000;
  @Input() update: EventEmitter<any> = new EventEmitter<any>();


  @Input() colorRange: string[] = [];

  simulation: any;
  canvas: any;
  nodesLayer: any;
  linksLayer: any;
  defsLayer: any;
  directionsLayer: any;
  directionMarkers: any;
  links: any;
  nodes: any;
  color: any;
  graphNodes: any[] = [];
  graphLinks: any[] = [];
  selectedUser: any;
  clickCoords: any;
  showInfoBox = false;

  constructor(public dialog: MatDialog) {}

  ngAfterViewInit(): void {
    this.canvas = d3.select('svg');
    const canvasLayer = this.canvas.append('g').attr('class', 'container').attr('style', 'overflow: scroll');
    this.nodesLayer = canvasLayer.append('g').attr('class', 'nodes');
    this.linksLayer = canvasLayer.append('g').attr('class', 'links');
    this.defsLayer = this.canvas.append('svg:defs');
    this.directionsLayer = canvasLayer.append('g').attr('class', 'directions');

    this.canvas.attr('width', this.viewBoxWidth);
    canvasLayer.attr('width', 30000);
    this.canvas.attr('height', this.viewBoxHeight);
    canvasLayer.attr('height', 30000);

    this.update.subscribe(() => {
      console.log(Date.now(), 'update graph', this.graph, this.graphNodes, this.graphLinks);
      this.drawGraph();
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(UserInfoBoxComponent, {
      data: {
        user: this.selectedUser,
        graph: this.graph,
        update: this.update,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }

  drawGraph(): void {
    if (this.simulation) {
      this.simulation.stop();
    }

    const filterNodes = n => (
      (this.graph.outgoingCount[n.id] > 0 && this.graph.incomingCount[n.id] > 0) ||
      (this.graph.outgoingCount[n.id] > 0) ||
      (this.graph.incomingCount[n.id] > 1) ||
      this.graph.bidirectionalLinks[n.id].length > 0
    );
    const filterLinks = n => (
      n.source &&
      n.target
      // (
      //   this.graph.outgoingCount[n.target.id] > 0 ||
      //   this.graph.incomingCount[n.source.id] > 1 ||
      //   this.graph.bidirectionalLinks[n.target.id].length > 0 ||
      //   this.graph.bidirectionalLinks[n.source.id].length > 0
      // )
    );
    const newNodes = this.graph.nodes.map(n => ({
      ...this.graph.getNodeValue(n),
      id: n,
    })).filter(filterNodes);
    for (const graphNode of newNodes) {
      if (!this.graphNodes.find(n => graphNode.id === n.id)) {
        this.graphNodes.push(graphNode);
      }
    }

    const newLinks = this.graph.links.map(l => ({
      source: this.graphNodes.find(n => n.id === l.source),
      target: this.graphNodes.find(n => n.id === l.target),
    })).filter(filterLinks);
    for (const graphLink of newLinks) {
      if (!this.graphLinks.find(ll => ll.source.id === graphLink.source.id && ll.target.id === graphLink.target.id)) {
        this.graphLinks.push(graphLink);
      }
    }

    this.links = this.linksLayer
    .selectAll('line')
    .data(this.graphLinks);
    this.links.enter().append('line')
      .attr('stroke', '#ccc')
      .attr('stroke-width', (d) => this.graph.bidirectionalLinks[d.source.id].indexOf(d.target.id) === -1 ? 0.5 : 2);
    this.links.exit().remove();
    this.nodes = this.nodesLayer
      .selectAll('circle')
      .data(this.graphNodes);
    this.directionMarkers = this.directionsLayer.selectAll('circle').data(this.graphLinks);
    this.directionMarkers.enter().append('circle')
        .attr('r', 3)
        .attr('fill', '#000');
    const that = this;
    this.nodes.enter().append('circle')
        .attr('fill', () => ColorHelper.randomColor())
        .call(d3.drag()
            .on('start', (d: any) => this.dragstarted(d))
            .on('drag', (d: any) => this.dragged(d))
            .on('end', (d: any) => this.dragended(d)))
        .on('click', function(d: any): void {
          that.selectedUser = d;
          //that.showInfoBox = true;
          that.clickCoords = d3.mouse(this);
          that.openDialog();
        });
    this.nodes.exit().remove();

    this.simulation = d3.forceSimulation(this.graphNodes)
      .force('link', d3.forceLink().id(x => x.id).distance(50).links(this.graphLinks))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(this.viewBoxWidth / 2, this.viewBoxHeight / 2))
      .force('collision', d3.forceCollide((d) => 30 + this.graph.bidirectionalLinks[d.id].length * 7.5))
      .on('tick', () => this.ticked())
      .on('end', () => this.simulationended());
  }

  simulationended(): void {
  }

  ticked(): void {
    this.defsLayer.selectAll('pattern').data(this.graphNodes).enter()
    .append('svg:pattern')
      .attr('id', (d) => d.id)
      .attr('width', 1)
      .attr('height', 1)
      .attr('patternContentUnits', 'objectBoundingBox')
      .append('svg:image')
        .attr('xlink:href', (d) => {
          if (!d.avatar_url) {
            debugger;
          }
          return d.avatar_url;
        })
        .attr('height', 1)
        .attr('width', 1)
        .attr('preserveAspectRatio', 'xMinYMin slice');
    const r = (d) => 15 + this.graph.bidirectionalLinks[d.id].length * 5;
    this.nodes
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
        .attr('r', r)
        .attr('fill', (d) => `url(#${d.id}) ${ColorHelper.randomColor()}`);
    this.links
        .attr('x1', (d: any) => pointOnLineAtDistance(d.target, d.source, r(d.source)).x)
        .attr('y1', (d: any) => pointOnLineAtDistance(d.target, d.source, r(d.source)).y)
        .attr('x2', (d: any) => pointOnLineAtDistance(d.source, d.target, r(d.target)).x)
        .attr('y2', (d: any) => pointOnLineAtDistance(d.source, d.target, r(d.target)).y)
        .attr('stroke-width', (d) => {
          return this.graph.bidirectionalLinks[d.source.id].indexOf(d.target.id) === -1 ? 0.5 : 2
        });

    this.directionMarkers
      .attr('cx', (d: any) => pointOnLineAtDistance(d.source, d.target, r(d.target)).x)
      .attr('cy', (d: any) => pointOnLineAtDistance(d.source, d.target, r(d.target)).y)
  }

  dragged(d): void {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d): void {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

  dragstarted(d): void {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }
}
