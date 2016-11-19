import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class ClientsService {

    constructor(private http: Http) { }

	getClients(conf): Observable<any> {
		let pageNumber = conf.first/ conf.rows + 1;

		return this.http.get(
			`/Api/Clients?limit=${conf.rows}&page=${pageNumber}&skip=${conf.first}`) 
			.map(res => res.json());
	}

	deleteClient(client): Observable<any> {
		

		return this.http.delete(
			`/Api/Clients/${client.id}`) 
			.map(res => res.json());
	}

    
    
}