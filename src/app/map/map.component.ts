import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

import { MarkerService } from '../services/marker.service'
import { PopupService } from '../services/popup.service';

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
    private popupService: PopupService
  ) {}

  onSelect = (e: any) => {
    this.selected = e.target.value;

    // remove all markers from the map
    this.markerService.clearMarkers()

    // show the filtered markers
    const filter = this.selected;
    console.log(`filter: ${filter}`)
    this.markerService.getMarkers(this.map, filter)
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
    this.initMap()

    const filter = '';
    this.markerService.getMarkers(this.map, filter)
  }
}
