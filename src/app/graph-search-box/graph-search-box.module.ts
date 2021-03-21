import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GraphSearchBoxComponent } from './graph-search-box.component';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [GraphSearchBoxComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  exports: [GraphSearchBoxComponent]
})
export class GraphSearchBoxModule { }
