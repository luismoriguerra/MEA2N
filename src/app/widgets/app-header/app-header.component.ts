import { Component, OnInit } from '@angular/core';
import {AuthenticatedUserService} from '../../shared/authenticated-user.service'

@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  styleUrls: ['app-header.component.css']
})
export class AppHeaderComponent implements OnInit {

  constructor(private authenticatedUser: AuthenticatedUserService) {}

  ngOnInit() {
  }

}
