import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, of } from 'rxjs';
import {
  dematerialize,
  filter,
  map,
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

  request$ = this.pageNumber$.pipe(
    switchMap((pageNumber) =>
      this.getPage(pageNumber).pipe(
        materialize(),
        filter((notification) => notification.kind !== 'C'),
      ),
    ),
    share(),
  );

  // NOTE: this version does not trigger new requests when filter changes
  data$ = combineLatest([this.request$, this.itemFilter$]).pipe(
    filter(([notification]) => notification.kind === 'N'),
    map(([notification, filter]) => {
      // filter data here
      const data = notification.value;
      return { data, filter };
    }),
  );

  error$ = this.request$.pipe(
    filter((notification) => notification.kind === 'E'),
    dematerialize(),
    catchError((err) => of(err)),
  );

  // this will cause an error for page 5
  private getPage(page: number) {
    return of({
      items: [`item for page ${page}`, `and another`, `and another`],
      page,
    }).pipe(
      tap(() => {
        if (page === 5) {
          throw new Error('Could not fetch page');
        }
      }),
    );
  }
}
