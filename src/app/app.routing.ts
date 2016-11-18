import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ZonesComponent } from './zones/zones.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'zones', component: ZonesComponent },
  { path: '**', component: HomeComponent }
  
  
];

export const routing = RouterModule.forRoot(routes);
