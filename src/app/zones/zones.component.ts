import { Component, OnInit } from '@angular/core';
import { ZonesService } from './zones.service';
@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
  providers: [ZonesService]
})
export class ZonesComponent implements OnInit {
  
  departamentos: any[] = [];
  dptoIdActive;
  provincias: any[] = [];
  provActive;
  distritos: any[] = [];
  dstoActive;
  
  constructor(private zonesService: ZonesService) { }

  ngOnInit() {
    this.zonesService.getDepartamentos().subscribe(response => {
      this.departamentos = response.results.list;
    },
    err => console.log(err))
  }

  showProvincias (departamento) {
    this.dptoIdActive = departamento.coddpto;
    this.zonesService.getProvincias(this.dptoIdActive).subscribe(response => {
      this.provincias = response.results.list;
    })

  }

  showDistritos (provincia) {
    this.provActive = provincia.codprov;
    this.zonesService.getDistritos(this.dptoIdActive, this.provActive)
      .subscribe(response => { this.distritos = response.results.list;})

  }

}