import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfoBoxComponent } from './user-info-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [UserInfoBoxComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  exports: [UserInfoBoxComponent]
})
export class UserInfoBoxModule { }
