import { Injectable } from '@angular/core';
import { HereDecoder } from './HERE/hereDecoder'

@Injectable({
  providedIn: 'root'
})

export class HereService {
  private hereDecoder: HereDecoder;

  constructor() { 
    this.hereDecoder = new HereDecoder()
  }

  public decode(encoded: string) {
    return this.hereDecoder.decode(encoded)
  }
}
