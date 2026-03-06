import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { CommonModule } from '@angular/common';
import { LoaderComponent } from "./shared/loader/loader.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    CommonModule,
    LoaderComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'qsas-frontend';

  showHeader = true;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const hiddenRoutes = ['/admin/login', '/apply', '/assessment'];
      this.showHeader = !hiddenRoutes.some(path => this.router.url.startsWith(path));
    });
  }
}