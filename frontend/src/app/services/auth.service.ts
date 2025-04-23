import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RegisterDTO } from '../dtos/user/register.dto';
import { Observable } from 'rxjs';
import { LoginDTO } from '../dtos/user/login.dto';
import { UserResponse } from '../reponses/user/user.response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBaseUrl = environment.apiBaseUrl;
  private apiRegister = `${environment.apiBaseUrl}/auth/register`;
  private apiLogin = `${environment.apiBaseUrl}/auth/login`;
  private apiConfig = {
    headers: this.createHeaders(),
  };

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  login(loginDTO: LoginDTO): Observable<any> {
    return this.http.post(this.apiLogin, loginDTO, this.apiConfig);
  }

  saveUserToLocalStorage(userResponse?: UserResponse) {
    try {
      if (userResponse == null || !userResponse) {
        return;
      }

      const userResponseJSON = JSON.stringify(userResponse);
      localStorage.setItem('user', userResponseJSON);
      console.log('User saved to local storage:', userResponseJSON);
    } catch (error) {
      console.error('Error saving user to local storage: ', error);
    }
  }

  getUserFromLocalStorage(): UserResponse | null {
    try {
      const userResponseJSON = localStorage.getItem('user');
      if (userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back into an object
      const userResponse = JSON.parse(userResponseJSON!);

      return userResponse;
    } catch (error) {
      console.log('Error retrieving user from local storage: ', error);
      return null;
    }
  }

  removeUserFromLocalStorage() {
    try {
      localStorage.removeItem('user');
      console.log('User removed from local storage');
    } catch (error) {
      console.error('Error removing user from local storage: ', error);
    }
  }
}
