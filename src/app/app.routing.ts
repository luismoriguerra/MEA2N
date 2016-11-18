import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { Zones3Component } from './zones3/zones3.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'zone3', component: Zones3Component}
];

export const routing = RouterModule.forRoot(routes);
