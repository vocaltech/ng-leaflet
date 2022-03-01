import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

import { MarkerService } from '../services/marker.service'

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
    private markerService: MarkerService
  ) {}

  onSelect = (e: any) => {
    this.selected = e.target.value;
    console.log(this.selected)
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
  }

  // Angular lifecycle
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap()
    this.markerService.getMarkers(this.map)
  }
}
