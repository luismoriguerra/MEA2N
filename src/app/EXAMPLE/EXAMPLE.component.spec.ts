import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { EXAMPLEComponent } from './EXAMPLE.component';
import { EXAMPLEService } from './shared/EXAMPLE.service';
import { EXAMPLE } from './shared/EXAMPLE.model';

describe('a EXAMPLE component', () => {
	let component: EXAMPLEComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule],
			providers: [
				{ provide: EXAMPLEService, useClass: MockEXAMPLEService },
				EXAMPLEComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([EXAMPLEComponent], (EXAMPLEComponent) => {
		component = EXAMPLEComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});

// Mock of the original EXAMPLE service
class MockEXAMPLEService extends EXAMPLEService {
	getList(): Observable<any> {
		return Observable.from([ { id: 1, name: 'One'}, { id: 2, name: 'Two'} ]);
	}
}
