import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ApiService } from './shared';
import { routing } from './app.routing';

import { removeNgStyles, createNewHosts } from '@angularclass/hmr';

import { AppHeaderComponent } from "./widgets/app-header";
import { MenuAsideComponent } from "./widgets/menu-aside";
import { MessagesBoxComponent} from "./widgets/messages-box";
import { NotificationBoxComponent } from "./widgets/notification-box";
import { TasksBoxComponent } from "./widgets/tasks-box";
import { UserBoxComponent } from "./widgets/user-box";
let AdminLTEComponents = [
  AppComponent,
  AppHeaderComponent,
  MenuAsideComponent,
  MessagesBoxComponent,
  NotificationBoxComponent,
  TasksBoxComponent,
  UserBoxComponent
];

// http://www.primefaces.org/primeng/#/button
import {InputTextModule, DialogModule, ButtonModule, DataTableModule,SharedModule} from 'primeng/primeng';
const primeModules = [
  DialogModule,
  InputTextModule,
  ButtonModule,
  DataTableModule,SharedModule

];

import { UserService } from "./services/user.service";
import { MessagesService } from "./services/messages.service";
import { ZonesComponent } from './zones/zones.component';
import { RecordsComponent } from './records/records.component';
import { InternalClientsComponent } from './internal-clients/internal-clients.component';
import { ClientsComponent } from './clients/clients.component';


let services =  [
  UserService,
  MessagesService
];

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    routing,
   ...primeModules,
     
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
     ...AdminLTEComponents,
    ZonesComponent,
    RecordsComponent,
    InternalClientsComponent,
    ClientsComponent
],
  providers: [
    ApiService,
    ...services
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) {}
  hmrOnInit(store) {
    console.log('HMR store', store);
  }
  hmrOnDestroy(store) {
    let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // remove styles
    removeNgStyles();
  }
  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
