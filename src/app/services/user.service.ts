import {User} from "../models/user";
import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';

@Injectable()
export class UserService{
  public current_user: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor() {}

  public setCurrentUser(user: User){
    this.current_user.next(new User({
      firstname: "WEBER",
      lastname: "Antoine",
      email: "weber.antoine.pro@gmail.com",
      avatar_url: "public/assets/img/user2-160x160.jpg"
    }));
  }
}
