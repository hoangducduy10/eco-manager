import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterDTO } from '../../dtos/user/register.dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm;

  registerData: RegisterDTO = {
    name: '',
    phone_number: '',
    password: '',
    retype_password: '',
    role_id: 1,
  };
  showModal = false;
  modalMessage = '';
  modalClass = '';
  modalIcon = '';

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    if (this.registerForm.valid) {
      this.registerData = {
        ...this.registerData,
        ...this.registerForm.value,
        role_id: 1,
      };
      this.authService.register(this.registerData).subscribe({
        complete: () => {
          this.showSuccessModal();
          setTimeout(() => {
            this.hideModal();
            this.router.navigate(['/sign-in']);
          }, 2000);
        },
        error: (error: any) => {
          this.showErrorModal(error);
          setTimeout(() => {
            this.hideModal();
          }, 2000);
        },
      });
    }
  }

  checkPasswordMatch() {
    if (this.registerData.password !== this.registerData.retype_password) {
      this.registerForm.controls['retype_password'].setErrors({
        passwordNotMatch: true,
      });
    } else {
      this.registerForm.controls['retype_password'].setErrors(null);
    }
  }

  private showSuccessModal() {
    this.modalMessage = 'Register successfully!';
    this.modalClass = 'text-success';
    this.modalIcon = 'fa fa-check-circle fa-3x';
    this.showModal = true;
  }

  private showErrorModal(error: any) {
    this.modalMessage =
      error.status == 401
        ? 'Register failed!'
        : 'Invalid data or phone number already exists!';
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
