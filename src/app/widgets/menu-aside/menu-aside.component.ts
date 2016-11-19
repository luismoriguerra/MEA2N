import { Component, OnInit } from '@angular/core';
import {User} from "../../models/user";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'menu-aside',
  templateUrl: 'menu-aside.component.html',
  styleUrls: ['menu-aside.component.css']
})
export class MenuAsideComponent implements OnInit {
  private current_user: User = new User({
      firstname: "WEBER",
      lastname: "Antoine",
      email: "weber.antoine.pro@gmail.com",
      avatar_url: "public/assets/img/user2-160x160.jpg"
    })
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
      "sublinks": [
        {
          "title": "Ubicación Geografica",
          "icon": "circle-o",
          "link": ['/zonas'],
        },
        {
          "title": "Clientes",
          "icon": "circle-o",
          "link": ['/clientes'],
        },
        {
          "title": "Clientes Internos",
          "icon": "circle-o",
          "link": ['/clientes-internos'],
        }
      ]
    }
  ];

  constructor(
    private _user_serv : UserService,
    public router: Router ){
    //recuperation de l'url courrante
    this.router.events.subscribe((evt) => this.current_url = evt.url );

    //se connecter au modification du user courant
    this._user_serv.current_user.subscribe((user: User) => this.current_user = user);

  }

  ngOnInit() {}

}
