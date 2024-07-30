import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MyService } from './my.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe],
  template: `
    <pre>{{ data() | json }}</pre>
    <pre>{{ error() }}</pre>
    <button
      (click)="
        this.myService.pageNumber$.next(this.myService.pageNumber$.value + 1)
      "
    >
      Next page
    </button>
    <button (click)="this.myService.itemFilter$.next('hello')">
      Set filter
    </button>
  `,
  styles: [],
})
export class AppComponent {
  myService = inject(MyService);
  data = toSignal(this.myService.data$);
  error = toSignal(this.myService.error$);
}
