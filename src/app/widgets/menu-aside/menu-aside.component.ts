import { Component, OnInit } from '@angular/core';
import {User} from "../../models/user";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {AuthenticatedUserService} from '../../shared/authenticated-user.service';

@Component({
  selector: 'menu-aside',
  templateUrl: 'menu-aside.component.html',
  styleUrls: ['menu-aside.component.css']
})
export class MenuAsideComponent implements OnInit {

  private current_url: string;
  private links: Array<any> = [
    {
      "title": "Registros",
      "icon": "th",
      "link": ['/']

    },
    {
      "title": "Sistema",
      "icon": "users",
      "sublinks": [ ]
    }
  ];


  constructor(
    private authenticatedUser: AuthenticatedUserService,
    public router: Router ){
    //recuperation de l'url courrante
    this.router.events.subscribe((evt) => this.current_url = evt.url );
   
  }

  ngOnInit() {
    this.authenticatedUser.getCurrentUser().subscribe(response => {
      this.links[1].sublinks = this.authenticatedUser.allowedPages();
    });
    
  }

}
