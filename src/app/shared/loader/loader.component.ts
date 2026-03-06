import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    MatProgressBarModule,
    NgIf, AsyncPipe
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  isLoading$ = this.loaderService.loading$;

  constructor(private loaderService: LoaderService) {}
}
