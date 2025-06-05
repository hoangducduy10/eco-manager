import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InternsComponent } from './components/interns/interns.component';
import { MeetingsComponent } from './components/meetings/meetings.component';
import { ProductsComponent } from './components/products/products.component';
import { AssignmentsComponent } from './components/assignments/assignments.component';
import { LoginComponent } from './components/login/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';
import { ScoresComponent } from './components/scores/scores.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { FileManagementComponent } from './components/file-management/file-management.component';

export const routes: Routes = [
  // Auth routes
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: LoginComponent },
  { path: 'sign-up', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'interns',
    component: InternsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'meetings',
    component: MeetingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'assignments',
    component: AssignmentsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'scores',
    component: ScoresComponent,
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    component: EmployeesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'files',
    component: FileManagementComponent,
    canActivate: [authGuard],
  },
];
