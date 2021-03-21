import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowingGraphComponent } from './following-graph.component';
import { UserInfoBoxModule } from '../user-info-box/user-info-box.module';



@NgModule({
  declarations: [FollowingGraphComponent],
  imports: [
    CommonModule,
    UserInfoBoxModule,
  ],
  exports: [FollowingGraphComponent]
})
export class FollowingGraphModule { }
