import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions  } from '@angular/http';

@Injectable()
export class AuthenticatedUserService {
  
  baseUrl:string = "/Api/Auth";
  currentUser: any = {};

  constructor(private http: Http) {
    
    this.getCurrentUser().subscribe(loggedUser => {
        this.currentUser = loggedUser;
        console.log(loggedUser);
        console.log("current user loaded");
    })

  }

  getCurrentUser () {
    return this.http.get(this.baseUrl).map(res => res.json());
  }

  get fullName () {
    return  `${this.currentUser.name} ${this.currentUser.last_name}`; 
  }

  allowedPages () {
    let list = [];

    if (this.isAllowed("AREAS", "_view")) list.push({title:"Areas", icon: "circle-o", link: ["/areas"] });
    if (this.isAllowed("CLIENTS", "_view")) list.push({title:"clientes", icon: "circle-o", link: ["/clientes"] });
    if (this.isAllowed("DOCUMENT_TYPE", "_view")) list.push({title:"tipos de documento", icon: "circle-o", link: ["/tipos-de-documento"] });
    if (this.isAllowed("EMPLOYEES", "_view")) list.push({title:"empleados", icon: "circle-o", link: ["/empleados"] });
    if (this.isAllowed("INTERNAL_CLIENTS", "_view")) list.push({title:"clientes internos", icon: "circle-o", link: ["/clientes-internos"] });
    if (this.isAllowed("OFFICES", "_view")) list.push({title:"oficinas", icon: "circle-o", link: ["/oficinas"] });
    if (this.isAllowed("RECORDS", "_view")) list.push({title:"registros", icon: "circle-o", link: ["/registros"] });
    if (this.isAllowed("USERS", "_view")) list.push({title:"usuarios", icon: "circle-o", link: ["/usuarios"] });
    if (this.isAllowed("ZONES", "_view")) list.push({title:"zonas", icon: "circle-o", link: ["/zonas"] });


    return list;
  }


  isAllowed (table: string, permission) {
    if ( this.currentUser === 2) return true;

    table = table.toUpperCase();

    return this.currentUser.restrictions &&
          this.currentUser.restrictions[table] &&
          this.currentUser.restrictions[table][permission] &&
          this.currentUser.restrictions[table][permission] === 1; 
  }



}
