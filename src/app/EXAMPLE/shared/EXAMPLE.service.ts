import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { EXAMPLE } from './EXAMPLE.model';

@Injectable()
export class EXAMPLEService {

	constructor(private http: Http) { }

	getList(): Observable<EXAMPLE[]> {
		return this.http.get('/api/list').map(res => res.json() as EXAMPLE[]);
	}
}