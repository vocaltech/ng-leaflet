import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

import { MarkerService } from '../services/marker.service'
import { PopupService } from '../services/popup.service';
import { HereService } from '../services/here.service';

import { environment as env } from 'src/environments/environment'

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;

  categories = [
    "shopping mall",
    "hypermarket",
    "basilica"
  ];

  selected: string = '';

  constructor(
    private markerService: MarkerService,
    private popupService: PopupService,
    private hereService: HereService
  ) {}

  onSelect = (e: any) => {
    this.selected = e.target.value;

    // remove all markers from the map
    this.markerService.clearMarkers()

    // show the filtered markers
    const filter = this.selected;
    console.log(`filter: ${filter}`)
    this.markerService.getGeoJsonMarkers(env.url_markers, this.map, filter)
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [43.633614292820766, 1.4370440975651275], // Toulouse , 
      zoom: 13
    })

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
  
    tiles.addTo(this.map);

    this.map.on('click', (e:L.LeafletMouseEvent) => {
      console.log(e.latlng);
      const marker = L.marker([e.latlng.lat, e.latlng.lng])
      marker.addTo(this.map);

      const feature = {
        "geometry": {
          "coordinates": [
            e.latlng.lng,
            e.latlng.lat
          ]
        },
        "properties": {
          "name": "",
          "category": ""
        }
      }

      marker.bindPopup(this.popupService.makePoiPopup(feature));
    })
  }

  // Angular lifecycle
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log('[ngAfterViewInit()]')

    // test HERE API
    const { polyline } = this.hereService.decode("BG-wvhzCqk96ChD5J3DjN8BjS0K36BwC7anG_2BvCnLvCnakDv-BsE7fsEnVkIjS8V_YkD4DsEoBgKoBkIrEoL3IoGvMU3N7BnGvCzF7G_E7GvCUzKArJAzKT_YTzF3DzU_E_T7B7GnGjSnB3DjDzK_J3cvHvRvC3DvCvC3NzZjNkIjI0FnGsErEkDrEkDvHoG7GoG7GoG_OgPrOgPjIkIzF0F_EgFnQ8Q3DsE_EoGnB8BTwCjDsEvCsEjDsEjDgFvCwC7BwC7BkDnB4DT4DAsEnL8GvR0KrEwC_OsJrT8LjN0K3NwMzewgBnGoGrTgU3NsO3S4SjSgPnLwHnLwHvHgFzFsEnLkIr7BopBrYkS3mBofjDT3DUvC8BjD4D7B4DAoGUsEoBkD8BkD8BUwCU4DA4D7B8GgK0FkIsE0FoG0FsEgFoL8L8G8LwHsOkDkI0FgK8GkNgKsY8GoQgFwRkDoL4DwRsEkXsE4XwHsnB8LoiC4I0yB7BoB7BsETgFzKAnG7BvHrE7V_Y7f_nBU7BUvCTvCT7BUrEUjIT7LvC_J3DrJzFrJ_J7G_YvRjIrEnV7L_O7G3DvCjDzFnB3IgZ_5C_OrJrEvCjITtGwD")
    this.markerService.addMarkersToMapFromHereDecoder(polyline)

    // init map and markers
    this.initMap()

    const filter = '';
    this.markerService.getGeoJsonMarkers(env.url_markers, this.map, filter)
  }
}
