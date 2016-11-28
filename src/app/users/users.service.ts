import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class UsersService {
	userUrl = '/Api/Users/';

    constructor(private http: Http) { }

	getUsers(conf): Observable<any> {
		let pageNumber = conf.first/ conf.rows + 1;
		return this.http.get(
			`${this.userUrl}?limit=${conf.rows}&page=${pageNumber}&skip=${conf.first}`) 
			.map(res => res.json());
	}

	deleteuser(user): Observable<any> {
		return this.http.delete(`${this.userUrl}${user.id}`) .map(res => res.json());
	}

    createuser(user): Observable<any> {
		let bodyString = JSON.stringify(user); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.post(this.userUrl, bodyString, options) // ...using post request
				.map((res:Response) => res.json()) // ...and calling .json() on the response to return data
				.catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
    
	}

	edituser(user): Observable<any> {
		let bodyString = JSON.stringify(user); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.put(`${this.userUrl}${user.id}`, bodyString, options) // ...using post request
				.map((res:Response) => res.json()) // ...and calling .json() on the response to return data
				.catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
    
	}
    
}