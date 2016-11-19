import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ZonesComponent } from './zones/zones.component';
import { RecordsComponent } from './records/records.component';
import { InternalClientsComponent } from './internal-clients/internal-clients.component';
import { ClientsComponent } from './clients/clients.component';

const routes: Routes = [
  { path: '', component: RecordsComponent },
  { path: 'zonas', component: ZonesComponent },
  { path: 'registros', component: RecordsComponent },
  { path: 'clientes', component: ClientsComponent },
  { path: 'clientes-internos', component: InternalClientsComponent },
  { path: '**', component: HomeComponent }
  
  
];

export const routing = RouterModule.forRoot(routes);
