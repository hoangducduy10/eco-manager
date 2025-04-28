import { Component, OnInit } from '@angular/core';
import { UserResponse } from '../../reponses/user/user.response';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  userResponse?: UserResponse | null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.userResponse = this.authService.getUserFromLocalStorage();
  }

  logout() {
    this.authService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse = null;
    this.route.navigate(['/sign-in']);
  }
}
