import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphSearchBoxComponent } from './graph-search-box/graph-search-box.component';
import { GraphSearchBoxModule } from './graph-search-box/graph-search-box.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSliderModule } from '@angular/material/slider';
import { OptionsModule } from './options/options.module';
import { FollowingGraphModule } from './following-graph/following-graph.module';
import { UserInfoBoxModule } from './user-info-box/user-info-box.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    GraphSearchBoxModule,
    MatSliderModule,
    OptionsModule,
    FollowingGraphModule,
    UserInfoBoxModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
