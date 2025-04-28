import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private route: Router
  ) {}

  logout() {
    this.authService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.route.navigate(['/sign-in']);
  }
}
