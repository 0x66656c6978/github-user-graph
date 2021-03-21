import { Component, EventEmitter } from '@angular/core';
import { UserNoName } from 'octokat';
import { Graph, GraphLink } from './models/graph';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'github-user-graph';

  graph: Graph<UserNoName> = new Graph<UserNoName>();
  update: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    // const a = (+Date.now()).toString();
    // const b = (+Date.now() + 1).toString();
    // this.graph.addNode(a);
    // this.graph.addNode(b);
    // this.graph.addLink(new GraphLink(a, b));
  }

  handleExpand(): void {
    this.update.emit(this.graph);
  }
}
