import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, of } from 'rxjs';
import {
  dematerialize,
  filter,
  materialize,
  share,
  switchMap,
  tap,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  http = inject(HttpClient);

  pageNumber$ = new BehaviorSubject(1);
  itemFilter$ = new BehaviorSubject('');

  request$ = combineLatest([this.pageNumber$, this.itemFilter$]).pipe(
    switchMap(([pageNumber, itemFilter]) =>
      this.getPage(pageNumber, itemFilter).pipe(
        materialize(),
        filter((notification) => notification.kind !== 'C'),
      ),
    ),
    share(),
  );

  data$ = this.request$.pipe(
    filter((notification) => notification.kind === 'N'),
    dematerialize(),
  );

  error$ = this.request$.pipe(
    filter((notification) => notification.kind === 'E'),
    switchMap((notification) => of(notification.error)),
  );

  // this will cause an error for page 5 and 7
  private getPage(page: number, filter: string) {
    return of({
      items: [`item for page ${page}`, `with filter ${filter}`, `and another`],
      page,
      filter,
    }).pipe(
      tap(() => {
        if (page === 5 || page === 7) {
          throw new Error(`Could not fetch page ${page}`);
        }
      }),
    );
  }
}
