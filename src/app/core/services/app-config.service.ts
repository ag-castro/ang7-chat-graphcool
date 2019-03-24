import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  constructor(
    private http: HttpClient
  ) {
    this.getDifference();
  }

  public timeDifference: number;

  getDifference(): void {
    if (!this.timeDifference) {
      this.http.get('http://worldclockapi.com/api/json/utc/now')
        .pipe(take(1))
        .subscribe(res => {
          this.timeDifference = new Date(res['currentDateTime']).getTime() - Date.now();
        });
    }
  }

}
