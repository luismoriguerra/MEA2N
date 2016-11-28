import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class UsersService {
	userUrl = '/Api/Users/';

    constructor(private http: Http) { }

	getUsers(conf): Observable<any> {
		console.log(conf)
		let pageNumber = conf.first/ conf.rows + 1;
		let payload = `${this.userUrl}?limit=${conf.rows}&page=${pageNumber}&skip=${conf.first}`;

		if (conf.sortField) {
			payload = payload + `&sort=${conf.sortField}`
		}

		if (conf.sortOrder) {
			let value = conf.sortOrder == 1 ? "asc": "desc";
			payload = payload + `&sort_dir=${value}`
		}


		return this.http.get(payload).map(res => res.json());
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