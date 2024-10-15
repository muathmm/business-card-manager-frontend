import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SplashService {
  private splashShown: boolean = false;

  constructor() {}

  hasShownSplash(): boolean {
    return this.splashShown;
  }

  setSplashShown(value: boolean): void {
    this.splashShown = value;
  }
}
