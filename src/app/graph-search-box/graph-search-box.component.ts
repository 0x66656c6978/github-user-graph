import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserNoName } from 'octokat';
import { Graph } from '../models/graph';
import { GithubService, FollowingGraphOptions } from '../services/github.service';
import { checkRunningSearch } from '../utils/graphSearch';

@Component({
  selector: 'app-graph-search-box',
  templateUrl: './graph-search-box.component.html',
  styleUrls: ['./graph-search-box.component.scss']
})
export class GraphSearchBoxComponent implements OnInit {

  @Input() maxGraphDepth = 5;
  @Input() graph: Graph<UserNoName> = new Graph<UserNoName>();
  @Output() expand: EventEmitter<Graph<UserNoName>> = new EventEmitter<Graph<UserNoName>>();

  searchForm: FormGroup;

  constructor(private github: GithubService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      userName: new FormControl('', Validators.pattern(/[a-z0-9\-_]+/)),
      maxGraphDepth: new FormControl(5, Validators.pattern(/[0-9]+/)),
    });
  }

  stopCurrentSearch(): void {
    if (GithubService.isRunning) {
      GithubService.stopCurrentSearch();
    }
  }

  async expandGraph(userName): Promise<void> {
    if (checkRunningSearch()) {
      const ev = new EventEmitter<Graph<UserNoName>>();
      ev.subscribe((innerUpdateGraph) => this.expand.emit(innerUpdateGraph));
      const followingGraphOpts = new FollowingGraphOptions(userName);
      followingGraphOpts.maxDepth = parseInt(this.searchForm.value.maxGraphDepth, 10);
      followingGraphOpts.update = ev;
      followingGraphOpts.graph = this.graph;
      GithubService.stopCurrentSearch();
      await GithubService.awaitStop();
      await this.github.getFollowingGraph(followingGraphOpts);
    }
  }

}
