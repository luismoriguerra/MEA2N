import { Component, OnInit, ViewChild } from '@angular/core';
import {UsersService} from "./users.service"

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UsersService]
})
export class UsersComponent implements OnInit {

  constructor(private userService: UsersService) { }

  userList = [];
  totalRecords: number = 0;


  @ViewChild('dt') dataTable: any;
  refreshTable() {
    this.dataTable.reset();
  }
  nexPage(conf) {
    this.userService.getUsers(conf).subscribe(response => {
      this.userList = response.results.list;
      this.totalRecords = response.results.count;
      console.log(this.userList)
    })
  }

  showDialogPermission () {
    
  }


  ngOnInit() {
  }

  create() {

  }
  editRow(row) {
  
  }
  deleteRow(row) {

  }

}