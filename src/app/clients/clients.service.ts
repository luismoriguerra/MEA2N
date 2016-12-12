import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class ClientsService {
	clientUrl = '/Api/Clients/';

    constructor(private http: Http) { }

	getClients(conf): Observable<any> {
		let pageNumber = conf.first/ conf.rows + 1;
		return this.http.get(
			`${this.clientUrl}?limit=${conf.rows}&page=${pageNumber}&skip=${conf.first}`) 
			.map(res => res.json());
	}

	deleteClient(client): Observable<any> {
		return this.http.delete(`${this.clientUrl}${client.id}`) .map(res => res.json());
	}

    createClient(client): Observable<any> {
		let bodyString = JSON.stringify(client); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.post(this.clientUrl, bodyString, options) // ...using post request
				.map((res:Response) => res.json()) // ...and calling .json() on the response to return data
				.catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
    
	}

	editClient(client): Observable<any> {
		let bodyString = JSON.stringify(client); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.put(`${this.clientUrl}${client.id}`, bodyString, options) // ...using post request
				.map((res:Response) => res.json()) // ...and calling .json() on the response to return data
				.catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
    
	}
    
}