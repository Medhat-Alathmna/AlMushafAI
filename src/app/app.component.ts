import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    const saved = localStorage.getItem('lang');
    this.translate.use(saved || 'en');
  }
}

