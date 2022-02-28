import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})

export class MarkerService {
  constructor(
    private http: HttpClient
  ) {}

  public getMarkers = () => {
    this.http.get(environment.url_markers).subscribe(
      (response: any) => {
        console.log(response)
      }, 
      (error: any) => {
        console.log(error)
      },
      () => {
        console.log('Http done !')
      }
    )
  }
}
