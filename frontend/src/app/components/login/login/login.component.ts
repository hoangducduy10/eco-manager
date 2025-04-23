import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TokenService } from '../../../services/token.service';
import { LoginDTO } from '../../../dtos/user/login.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;

  loginData: LoginDTO = {
    phone_number: '',
    password: '',
  };
  rememberMe: boolean = true;
  showModal = false;
  modalMessage = '';
  modalClass = '';
  modalIcon = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  createAccount() {
    this.router.navigate(['/register']);
  }

  login() {
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        const { token } = response;

        this.tokenService.setToken(token);

        this.showSuccessModal();

        setTimeout(() => {
          this.hideModal();
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error: any) => {
        this.showErrorModal(error);
      },
    });
  }

  private showSuccessModal() {
    this.modalMessage = 'Login successfully!';
    this.modalClass = 'text-success';
    this.modalIcon = 'fa fa-check-circle fa-3x';
    this.showModal = true;
  }

  private showErrorModal(error: any) {
    this.modalMessage =
      error.status == 401
        ? 'An error occurred. Please try again later!'
        : 'Wrong phone number or password!';
    this.modalClass = 'text-danger';
    this.modalIcon = 'fa fa-times-circle fa-3x';
    this.showModal = true;

    setTimeout(() => {
      this.hideModal();
    }, 2000);
  }

  private hideModal() {
    this.showModal = false;
  }
}
