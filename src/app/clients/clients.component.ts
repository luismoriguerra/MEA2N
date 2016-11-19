import { Component, OnInit, ViewChild } from '@angular/core';
import {ClientsService} from "./clients.service"
import { IClient } from './client';


@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  providers: [ClientsService]
})
export class ClientsComponent implements OnInit {
  @ViewChild('dt') dataTable: any;
  
  clientList : any[] = [];
  totalRecords: number = 0;
  clientActive: IClient;

  nexPage(conf) {
    this.clientsService.getClients(conf).subscribe(response => {
      this.clientList = response.results.list;
      this.totalRecords = response.results.count;
    })
  }

  constructor( private clientsService: ClientsService) { }

  ngOnInit() {}
  
  createNewClient() {

  }
  editClient (item: IClient) {
  }

  isShowDeleteDialogDisplayed = false;
  showDeleteDialog (item: IClient) {
    this.isShowDeleteDialogDisplayed = true;
    this.clientActive = item;
    console.log(this.clientActive)
  }

  deleteClient(client) {
    this.isShowDeleteDialogDisplayed = false;
    console.log(client);
    this.clientsService.deleteClient(client).subscribe(response => {
      this.dataTable.reset();
    });
  }




}