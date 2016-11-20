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
  dialogTitle: string;
  isFormDialogDisplayed = false;

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
    this.clientsService.deleteClient(client).subscribe(response => this.refreshTable());
  }

  showDialogCreateClient() {
    this.dialogTitle = "Crear Cliente";
    this.client = new Client();
    this.isFormDialogDisplayed = true;
  }

  ShowDialogEdit (client) {
    this.dialogTitle = "Editar Cliente";
    this.client = client;
    this.isFormDialogDisplayed = true;
  }

  save () {
    if (!this.client.description) return;
    if (!this.client.legacy_id) return;

    this.isFormDialogDisplayed = false;

    if (!this.client.id) {
      this.clientsService.createClient(this.client).subscribe(
        response => this.refreshTable()
      );
    } else {
      this.clientsService.editClient(this.client).subscribe(
        response => this.refreshTable()
      )
    }
  }


}