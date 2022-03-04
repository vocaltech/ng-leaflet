import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import * as L from 'leaflet';

import { PopupService } from './popup.service'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})

export class MarkerService {
  private markerGroup: L.LayerGroup;

  constructor(
    private http: HttpClient,
    private popupService: PopupService
  ) {
    this.markerGroup = L.layerGroup()
  }

  public clearMarkers = () => {
    this.markerGroup.clearLayers();
  }

  public getMarkers = (map: L.Map, filter: string) => {
    this.http.get(environment.url_markers).subscribe(
      (response: any) => {
        this.addMarkersToMap(response, map, filter);
      }, 
      (error: any) => {
        console.log(error)
      },
      () => {
        console.log('Http done !')
      }
    )
  }

  private addMarkersToMap(res: any, map: L.Map, filter: string) {
    const filteredRes: Array<any> = res.features.filter((feature: any) => feature.properties.category === filter)

    if (filteredRes.length === 0) { // show all markers
      this.createMarkers(res.features, map)
    } else { // show filteredRes
     this.createMarkers(filteredRes, map)
    }

    this.markerGroup.addTo(map);
  }

  private createMarkers = (arr: Array<any>, map: L.Map) => {
    arr.map((feature: any) => {
      const long = feature.geometry.coordinates[0]
      const lat = feature.geometry.coordinates[1]
      const marker = L.marker([lat, long])

      // context menu
      marker.on('contextmenu', event => {
        console.log(event)
      })

      // popup
      marker.bindPopup(this.popupService.makePoiPopup(feature))

      marker.addTo(this.markerGroup);
    })
  }
}
