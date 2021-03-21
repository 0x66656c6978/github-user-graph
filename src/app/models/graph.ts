export class GraphLink {
  source: string;
  target: string;

  constructor(source: string, target: string) {
    this.source = source;
    this.target = target;
  }
}

export class Graph<T> {
  nodes: string[] = [];
  values: { [id: string]: T } = {};
  links: GraphLink[] = [];

  outgoingCount: { [id: string]: number } = {};
  incomingCount: { [id: string]: number } = {};
  bidirectionalLinks: { [id: string]: string[] } = {};

  clone(): Graph<T> {
    const newGraph = new Graph<T>();
    newGraph.nodes = [...this.nodes];
    newGraph.links = [...this.links];
    newGraph.values = {...this.values};
    newGraph.outgoingCount = {...this.outgoingCount};
    newGraph.incomingCount = {...this.incomingCount};
    newGraph.bidirectionalLinks = {...this.bidirectionalLinks};
    return newGraph;
  }

  findNode(x: string): string {
    return this.nodes.find(y => x === y);
  }

  addNode(id: string, links: GraphLink[] = []): void {
    if (this.findNode(id)) {
      links.forEach((link) => this.addLink(link));
      return;
    }
    this.nodes.push(id);
    this.outgoingCount[id] = 0;
    this.incomingCount[id] = 0;
    this.bidirectionalLinks[id] = [];
    links.forEach((link) => this.addLink(link));
  }

  addLink(l: GraphLink): void {
    if (this.findExactLink(l)) {
      return;
    }
    const matchingNodes = this.nodes.filter(n => n === l.source || n === l.target);
    if (matchingNodes.length !== 2) {
      throw new Error('Invalid link specified. One of the nodes does not exist in the graph');
    }
    this.links.push(l);
    this.outgoingCount[l.source] = this.links.filter(ll => l.source === ll.source).length;
    this.incomingCount[l.source] = this.links.filter(ll => l.source === ll.target).length;
    this.outgoingCount[l.target] = this.links.filter(ll => l.target === ll.source).length;
    this.incomingCount[l.target] = this.links.filter(ll => l.target === ll.target).length;
    if (this.findExactLink(new GraphLink(l.target, l.source))) {
      this.bidirectionalLinks[l.target].push(l.source);
      this.bidirectionalLinks[l.source].push(l.target);
    }
  }

  getNodeValue(id: string): T {
    const value = this.values[id] || null;
    if (value === null) {
      debugger;
    }
    return value;
  }

  setNodeValue(id: string, value: T): void {
    this.values[id] = value;
  }

  adjacent(x, y) : boolean {
    return null !== this.links.find(({ source, target }) => source === x && target === y);
  }

  neighbors(x: string): string[] {
    return this.links.filter(({ source }) => source === x).map(({ target }) => target);
  }

  findExactLink(x: GraphLink): GraphLink {
    return this.links.find(({ source, target }) => source === x.source && target === x.target);
  }

  findLooseLink(x: GraphLink): GraphLink {
    return this.links.find(({ source, target }) =>
      (source === x.source && target === x.target) || (source === x.target && target === x.source)
    );
  }
}
