import { Component, Input, OnInit , Inject, EventEmitter} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FollowingGraphOptions, GithubService } from '../services/github.service';
import { checkRunningSearch } from '../utils/graphSearch';

export interface DialogData {
  user: any;
  graph: any;
  update: any;
}

@Component({
  selector: 'app-user-info-box',
  templateUrl: './user-info-box.component.html',
  styleUrls: ['./user-info-box.component.scss']
})
export class UserInfoBoxComponent {

  user: any;
  graph: any;
  update: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public github: GithubService,
  ) {
    this.user = data.user;
    this.graph = data.graph;
    this.update = data.update;
  }

  async tryExpand(userName: string): Promise<void> {
    if (checkRunningSearch()) {
      const opts = new FollowingGraphOptions(userName);
      opts.graph = this.graph;
      opts.maxDepth = 3;
      opts.update = this.update;
      GithubService.stopCurrentSearch();
      await GithubService.awaitStop();
      await this.github.getFollowingGraph(opts);
    }
  }
}
