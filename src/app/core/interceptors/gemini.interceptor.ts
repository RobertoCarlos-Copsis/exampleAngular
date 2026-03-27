import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class GeminiInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Inject token for Gemini API requests
    if (request.url.includes(environment.gemini.baseUrl)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${environment.gemini.token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.error('[GeminiInterceptor] Error de autenticación - Token expirado o inválido', error);
          // Here you could trigger a state reset or redirect to login
        }
        return throwError(() => error);
      })
    );
  }
}
