import { Component, OnInit, ViewChild } from '@angular/core';
import {ClientsService} from "./clients.service"
import { IClient, Client } from './client';


@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  providers: [ClientsService]
})

export class ClientsComponent  {
  constructor( private clientsService: ClientsService) {}
  @ViewChild('dt') dataTable: any;

  refreshTable() {
    this.dataTable.reset();
  }
  
  clientList : any[] = [];
  totalRecords: number = 0;
  client: IClient = new Client();

  nexPage(conf) {
    this.clientsService.getClients(conf).subscribe(response => {
      this.clientList = response.results.list;
      this.totalRecords = response.results.count;
    })
  }

  isShowDeleteDialogDisplayed = false;
  showDeleteDialog (item: IClient) {
    this.isShowDeleteDialogDisplayed = true;
    this.client = item;
  }
  deleteClient(client) {
    this.isShowDeleteDialogDisplayed = false;
    this.clientsService.deleteClient(client).subscribe(response => {
      this.refreshTable();
    });
  }

  isCreatedDialogDisplayed = false;
  showDialogCreateClient() {
    this.client = new Client();
    this.isCreatedDialogDisplayed = true;
  }
  createClient () {

    if (!this.client.description) return;
    if (!this.client.legacy_id) return;

    this.isCreatedDialogDisplayed = false;
    this.clientsService.createClient(this.client).subscribe(response => {
      this.refreshTable();
    });
  }




}