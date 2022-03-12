import { HttpClient } from '@angular/common/http'

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms'

import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators'

import secondsToMinutes from 'date-fns/secondsToMinutes';
import minutesToHours from 'date-fns/minutesToHours';

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

  route_summary =  {
    duration: secondsToMinutes(1102),
    length: 5656 / 1000,
    baseDuration: 768,
    mode: "car",
    departure: {
      name: "Basilique St Sernin",
      time: "2022-03-05T17:53:51+01:00"
    },
    arrival: {
      name: "Centre Commercial Gramont",
      time: "2022-03-05T18:12:13+01:00"
    }
  }

  private selected: string = '';

  // form controls
  departureControl = new FormControl()
  options = ['Toulouse', 'Carcassonne', 'Narbonne', 'Balma', 'Labege']
  //filteredOptions$!: Observable<string[]>
  filteredOptions$!: any[]
  isLoading = false
  errorMsg!: string

  constructor(
    private http: HttpClient,
    private markerService: MarkerService,
    private popupService: PopupService,
    private hereService: HereService
  ) {}

  onChangeDeparture = (e: any) => {
    console.log(`[onChangeDeparture()] departure value: ${e}`)
  }

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

    const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1
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

  private _filter = (value: string): string[] => {
    const filteredVal = value.toLowerCase()
    return this.options.filter(option => option.toLowerCase().includes(filteredVal))
  }

  // Angular lifecycle
  ngOnInit(): void {
    this.departureControl.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(1000),
      tap(() => {
        this.errorMsg = ''
        this.filteredOptions$ = []
        this.isLoading = true
      }),
      switchMap(value => this.http.get(env.url_api_address_fr + '?q=' + value)
        .pipe(
          finalize(() => {
            this.isLoading = false
          })
        )
      )
    )
    .subscribe((data: any) => {
      console.log(data)
    })
  }

  ngAfterViewInit(): void {
    console.log('[ngAfterViewInit()]')

    // init map and markers
    this.initMap()

    const filter = '';
    this.markerService.getGeoJsonMarkers(env.url_markers, this.map, filter)

    // test HERE API
    const { polyline } = this.hereService.decode("BGow4lzC47-3CzHrBrJ7B4D3mBAjDT3DwCjDoB7BkrBsJgPsE0FU3DkSzF8a7GkhB_EsY3D0PvC0K7B8GjD0KjDsJjDkIjD8GwC0KgjBopBoGwHsJoL0oBouB4I0KwCsTsJg8BoGopBwH0tB4D0ZwC0U8GsJoGsJsEwHsEkIwMkXwH4N8G8LgK8Q0FsJwHkI4DsEwCwCoBoBoG0KkN0PgFoGkSgU8GkIwRsTkI4I0KoLgK0K8GwHwCkD8B8BwCkD8BwCwCwC8B8BwCkD8B8B8B8B4I0KsOoQoLkNwH4IoLkN8GwHoLwMwHkIgP8Q0PwR4DsEsToVoLwMkDkD8BwCsO8QoLkNoGkIgKoL4IsJwMsOoGgF8GgF4IgFoakNgFwC8G4D4rB8VgUsJ7GwR_E4NvCsJTgFAoGUoGoB0FwCgF0FkI8LkNgyB84B4S0ZoL0PgFwHwCsE8BsEoBsEoB0FoBsJUwHAkIT4InBwMTgF7BsJ7B8GnBsEvCwHrEgKnLkcrJgZ3Iwb7B4I3DkS7L8nCT4DjI4mBjD8LjD0K_EsO3DgKvCoGjD8G_E4IjIwMzK4N_Y0e3DgF7GsJvH0KvH8L4IkIgKsJsE4D8GoG0F8GoG0K8L0Z8G8QsJgUgFgKgFsJgKkS0FgKsE8GkD4DwCwCA4DwC0FgF8BkDwHwCgF0FwHwCwCgF0F0F0FkIgKoGkIkDsEgFoG0KgP0FkIwM8QkIoL4SwWoL8LgF0F8G8GkSgPoGgFgF4D4DwC8QoLsOwM4S0U8LkNkIkIoG0FwHwH8LoLwH8G8G4IsJwMgKkcsEwRnBsEAsEA0FoB4DwC4DwCwCUkNkDsOkD8G8BgFoBwC8GwMgFgKoGwM0FgKwH4N0FgKoGoL4DoG4D0F0KoQoG4IgF8G4SkX4IgKgFoG4DgF4D0F4DoGwCgFwC0FkDkI4DsJwCwHkDgK8BoGoB0FUsEU4InBsETsEAsEUsEUwCoBkD8BkDwCwCwC8BwCUwCAkDTwCnBkDvC8BvCoB7BoBvCUvCU3DArEoGrE8GjDsOnB8GT0jB3D4DTgU3DgFT0FnBkhBzFsJ7BoG4DU0F4D0FgF8BkDTwCnBkDjDkDsJ4DwRgF8VsEoVgFwboB0F4xDrdT4D7GgU3DsJ7B0FTkDA4D7YiL")
    this.markerService.addMarkersToMapFromHereDecoder(polyline, this.map, false)
  }
}
