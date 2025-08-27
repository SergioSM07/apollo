import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet
  ],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('front-apollo');
}
