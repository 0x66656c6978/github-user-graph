import { EventEmitter, Injectable } from '@angular/core';
import Octokat, { UserNoName } from 'octokat'

import { Graph, GraphLink } from '../models/graph'
import { sleep } from '../utils/async';
import config from '../../config';
import { FollowingGraphModule } from '../following-graph/following-graph.module';

export class FollowingGraphOptions {
  userName: string;
  maxDepth?: number = GithubService.DefaultMaxDepth;
  graph?: Graph<any> = new Graph();
  update?: EventEmitter<Graph<any>> = new EventEmitter<Graph<any>>();
  maxWaitTime ? = 30000;

  constructor(userName) {
    this.userName = userName;
  }
}

export class GraphProcessingQueueItem {
  id: string;
  depth: number;
  user: any;
  links?: GraphLink[] = [];
}

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  public static DefaultMaxDepth = 3;
  private static stopFlag = false;
  private static runningFlag = false;

  octo: Octokat;
  repositories: {[id: string]: any[]} = {};
  organizations: {[id: string]: any[]} = {};



  constructor() {
    this.octo = new Octokat({
      token: (new config()).personalGithubToken,
    });
  }

  static stopCurrentSearch(): void {
    if (this.isRunning) {
      this.stopFlag = true;
    }
  }


  public static get isRunning(): boolean{
    return this.runningFlag;
  }


  static async awaitStop(maxTime: number = 60000): Promise<boolean> {
    const start = Date.now();
    while (this.isRunning) {
      const expired = Date.now() - start;
      if (expired > maxTime) {
        return false;
      }
      await sleep(100);
    }
    return true;
  }

  async sendApiRequest(
    url: string,
    personalAccessToken: string = localStorage.getItem('personalAccessToken')
  ): Promise<any> {
    return await (await (await fetch(url, { headers: { Authorization: `token ${personalAccessToken}` }})).json());
  }

  async getFollowingGraph(options: FollowingGraphOptions): Promise<Graph<any>> {
    console.log(Date.now(), 'queue processing started');
    GithubService.stopFlag = false;
    GithubService.runningFlag = true;
    const { userName, graph, maxDepth, update } = options;
    const q: GraphProcessingQueueItem[] = [];
    const c: string[] = [];
    q.push({id: userName, depth: 0, user: await this.sendApiRequest(`https://api.github.com/users/${userName}`)});
    await sleep(777);
    while (q.length) {
      if (GithubService.stopFlag) {
        console.log(Date.now(), 'queue processing aborted');
        GithubService.runningFlag = false;
        GithubService.stopFlag = false;
        return graph;
      }
      const i = q.shift();
      console.log(Date.now(), `processing queue item at depth=${i.depth}, index=${0}/${q.length + 1}. id=${i.id}`)
      c.push(i.id);
      graph.addNode(i.id, i.links);
      const following = await this.sendApiRequest(`https://api.github.com/users/${i.id}/following`);
      await sleep(777);
      const followers = await this.sendApiRequest(`https://api.github.com/users/${i.id}/followers`);
      await sleep(777);
      // const repositories = await this.sendApiRequest(`https://api.github.com/users/${i.id}/repos`);
      // await sleep(777);
      // const organizations = await this.sendApiRequest(`https://api.github.com/users/${i.id}/orgs`);
      // await sleep(777);

      this.repositories[i.id] = [];
      this.organizations[i.id] = [];


      graph.setNodeValue(i.id, {
        ...i.user,
        repositories: [],
        organizations: [],
      });
      if (i.depth < maxDepth) {
        const processChild = (child, direction = true) => {
          const childId = child.login.toString();
          const link = direction ? new GraphLink(i.id, childId) : new GraphLink(childId, i.id);
          if (c.indexOf(childId) === -1 && q.find(qq => qq.id === childId) === undefined) {
            console.log(Date.now(), `Adding child to queue. depth=${i.depth + 1}, childId=${childId}, type=${direction ? 'followee' : 'follower'}`);
            q.push({id: childId, depth: i.depth + 1, user: child, links: [link]});
          }
        };
        following.forEach(followee => processChild(followee));
        followers.forEach(follower => processChild(follower, false));
      }
      update.emit(graph);
    }
    GithubService.runningFlag = false;
    return graph;
  }
}
