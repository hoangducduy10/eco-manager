import { Component, OnInit } from '@angular/core';
import { UserResponse } from '../../reponses/user/user.response';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  userResponse?: UserResponse | null;
  currentDate: any;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private route: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userResponse = this.authService.getUserFromLocalStorage();
    this.currentDate = new Date();
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  logout() {
    this.authService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse = null;
    this.route.navigate(['/sign-in']);
  }

  confirmLogout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn đăng xuất?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logout();
      }
    });
  }
}
