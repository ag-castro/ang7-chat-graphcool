import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import {takeWhile} from 'rxjs/operators';
import { ErrorService } from '../../../core/services/error.service';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  configs = {
    isLogin: true,
    actionText: 'Acessar Conta',
    buttonActionText: 'Criar Conta',
    isLoading: false
  };

  private nameControl = new FormControl(
    null, [Validators.required, Validators.minLength(5)]
  );

  private alive = true;

  constructor(
    public authService: AuthService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();
    const userData = this.authService.getRememberMe();
    if (userData) {
      this.email.setValue(userData.email);
      this.password.setValue(userData.password);
    } else {
      this.email.setValue(null);
      this.password.setValue(null);
    }
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmit(): void {
    this.configs.isLoading = true;
    const operation = (this.configs.isLogin)
      ? this.authService.signInUser(this.loginForm.value)
      : this.authService.signUpUser(this.loginForm.value);

    operation.pipe(
      takeWhile(() => this.alive)
    ).subscribe(
      res => {
        this.authService.setRememberMe(this.loginForm.value);
        const redirect: string = this.authService.redirectURL || '/dashboard';
        console.log('route redirecting...', redirect);
        this.router.navigate([redirect]);
        this.authService.redirectURL = null;
        this.configs.isLoading = false;
      },
      err => {
        console.log(err);
        this.configs.isLoading = false;
        this.snackBar.open(this.errorService.getErrorMessage(err), 'Ok', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      },
      () => console.log('Obs Completado!')
    );
  }

  onKeepSigned(): void {
    this.authService.toggleKeepSigned();
  }

  onRememberMe(): void {
    this.authService.toggleRememberMe();
  }

  changeAction(): void {
    this.configs.isLogin = !this.configs.isLogin;
    this.configs.actionText = !this.configs.isLogin ? 'Criar Conta' : 'Acessar Conta';
    this.configs.buttonActionText = !this.configs.isLogin ? 'Já tenho uma conta' : 'Criar Conta';
    !this.configs.isLogin ? this.loginForm.addControl('name', this.nameControl) : this.loginForm.removeControl('name');
  }

  get name(): FormControl {
    return this.loginForm.get('name') as FormControl;
  }

  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }
  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  ngOnDestroy(): void {
    this.alive = false;
  }


}
