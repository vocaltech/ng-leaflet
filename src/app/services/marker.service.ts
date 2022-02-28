import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import * as L from 'leaflet';

import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})

export class MarkerService {
  constructor(
    private http: HttpClient
  ) {}

  public getMarkers = (map: L.Map) => {
    this.http.get(environment.url_markers).subscribe(
      (response: any) => {
        this.addMarkersToMap(response, map);
      }, 
      (error: any) => {
        console.log(error)
      },
      () => {
        console.log('Http done !')
      }
    )
  }

  private addMarkersToMap(res: any, map: L.Map) {
    for (const feature of res.features) {
      const long = feature.geometry.coordinates[0]
      const lat = feature.geometry.coordinates[1]
      const marker = L.marker([lat, long])
      marker.addTo(map);
    }
  }
}
