import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

import { MarkerService } from '../services/marker.service'

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
    private markers: MarkerService
  ) {}

  onSelect = (e: any) => {
    this.selected = e.target.value;
    console.log(this.selected)
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [43.604652, 1.444209], // Toulouse
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
    this.markers.getMarkers()
  }

  ngAfterViewInit(): void {
    this.initMap()
  }
}
