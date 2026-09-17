import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environment/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).tokenValue;
  if (token && req.url !== environment.authProfileUrl) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
