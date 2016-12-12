import { Component } from '@angular/core';

import { ApiService } from './shared';
import {AuthenticatedUserService} from './shared/authenticated-user.service';

import '../style/app.scss';

@Component({
  selector: 'app-root', // <my-app></my-app>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
 

  url = 'https://github.com/preboot/angular2-webpack';



  constructor( private authUser: AuthenticatedUserService) {
    // Do something with api
      
  }
}
