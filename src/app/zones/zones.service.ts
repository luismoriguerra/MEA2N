import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class ZonesService {

    constructor(private http: Http) { }

	getDepartamentos(): Observable<any> {
		return this.http.get('/Api/Ubigeo')
            .map(res => res.json());
	}

    getProvincias(deptoId): Observable<any> {
		return this.http.get(`Api/Ubigeo?dpto=${deptoId}&prov=0`)
            .map(res => res.json());
	}

    getDistritos(deptoId, provId): Observable<any> {
		return this.http.get(`Api/Ubigeo?dpto=${deptoId}&prov=${provId}`)
            .map(res => res.json());
	}
    
}