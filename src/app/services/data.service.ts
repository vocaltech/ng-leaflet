import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class DataService implements Resolve<any> {
  constructor(
    private http: HttpClient
  ) {}

  resolve() {
    throw new Error('Method not implemented.');
  }
}
