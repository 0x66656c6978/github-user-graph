import { GithubService } from '../services/github.service';

export function checkRunningSearch(): boolean {
  if (GithubService.isRunning) {
    if (confirm('GithubService is already running. Stop search first?')) {
      return true;
    }
    return false;
  }
  return true;
}
