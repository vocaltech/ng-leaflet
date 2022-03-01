import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PopupService {

  constructor() { }

  makePoiPopup(data: any): string {
    return `` +
    `<div>${data.geometry.coordinates[1]}, ${data.geometry.coordinates[0]}</div>` +
    `<div>name: ${data.properties.name}</div>` +
    `<div>category: ${data.properties.category}</div>`
  }
}
