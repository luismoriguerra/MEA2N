import { Component, OnInit } from '@angular/core';

import { EXAMPLE } from './shared/EXAMPLE.model';
import { EXAMPLEService } from './shared/EXAMPLE.service';

@Component({
	selector: 'EXAMPLE',
	templateUrl: 'EXAMPLE.component.html',
	providers: [EXAMPLEService]
})

export class EXAMPLEComponent implements OnInit {
	EXAMPLE: EXAMPLE[] = [];

	constructor(private EXAMPLEService: EXAMPLEService) { }

	ngOnInit() {
		this.EXAMPLEService.getList().subscribe((res) => {
			this.EXAMPLE = res;
		});
	}
}