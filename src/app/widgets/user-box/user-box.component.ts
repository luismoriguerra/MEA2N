import { Component, OnInit } from '@angular/core';
import {AuthenticatedUserService} from '../../shared/authenticated-user.service';


@Component({
  selector: '.userBox',
  templateUrl: 'user-box.component.html',
  styleUrls: ['user-box.component.css']
})
export class UserBoxComponent implements OnInit {
  

    constructor( private authenticatedUser: AuthenticatedUserService ){
      //se connecter au modif du user courant
    }

    public ngOnInit(){
      //reception des données par les services
      /*this._user_serv.current_user.subscribe((user: User)=>{
        this.current_user = user;
      });*/
    }
}
