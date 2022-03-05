import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import * as L from 'leaflet';

import { PopupService } from './popup.service'

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

  public getGeoJsonMarkers = (urlSource: string, map: L.Map, filter: string) => {
    this.http.get(urlSource).subscribe(
      (response: any) => {
        this.addGeoJsonMarkersToMap(response, map, filter);
      }, 
      (error: any) => {
        console.log(error)
      },
      () => {
        console.log('Http done !')
      }
    )
  }

  /*
   * HERE decoded format:
   * 
   *  43.540239,1.489477,43.54019,1.48932,43.540130000000005,1.48911...
   * 
   */
  public addMarkersToMapFromHereDecoder(hereDecoded: number[][]) {
    hereDecoded.map((latLng: number[]) => {
      const [lat, lng] = latLng;
      L.marker([lat, lng]).addTo(this.markerGroup)
    })
  }

  private addGeoJsonMarkersToMap(res: any, map: L.Map, filter: string) {
    const filteredRes: Array<any> = res.features.filter((feature: any) => feature.properties.category === filter)

    if (filteredRes.length === 0) { // show all markers
      this.createGeoJsonMarkers(res.features, map)
    } else { // show filteredRes
     this.createGeoJsonMarkers(filteredRes, map)
    }

    this.markerGroup.addTo(map);
  }

  private createGeoJsonMarkers = (arr: Array<any>, map: L.Map) => {
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

    // polyline test
    const latlngs: L.LatLngExpression[] = [
      [43.64852254222897, 1.371213504464113],
      [43.63397084151468, 1.4845919600499258]
    ]

    const polyline = L.polyline(latlngs, { color: 'red' })
    polyline.addTo(map)

  }
}
