import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class HereService {

 /*
  * Copyright (C) 2019 HERE Europe B.V.
  * Licensed under MIT, see full license in LICENSE
  * SPDX-License-Identifier: MIT
  * License-Filename: LICENSE
  */
  DEFAULT_PRECISION = 5;

  ENCODING_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  DECODING_TABLE = [
      62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1,
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
      36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
  ];

  FORMAT_VERSION = 1;

  ABSENT = 0;
  LEVEL = 1;
  ALTITUDE = 2;
  ELEVATION = 3;
  // Reserved values 4 and 5 should not be selectable
  CUSTOM1 = 6;
  CUSTOM2 = 7;

  Num = typeof BigInt !== "undefined" ? BigInt : Number;

  constructor() { }

  public decode(encoded: string) {
    const decoder = this.decodeUnsignedValues(encoded);
    const header = this.decodeHeader(decoder[0], decoder[1]);

    const factorDegree = 10 ** header.precision;
    const factorZ = 10 ** header.thirdDimPrecision;
    const { thirdDim } = header;

    let lastLat = 0;
    let lastLng = 0;
    let lastZ = 0;
    const res = [];

    let i = 2;
    for (;i < decoder.length;) {
        const deltaLat = this.toSigned(decoder[i]) / factorDegree;
        const deltaLng = this.toSigned(decoder[i + 1]) / factorDegree;
        lastLat += deltaLat;
        lastLng += deltaLng;

        if (thirdDim) {
            const deltaZ = this.toSigned(decoder[i + 2]) / factorZ;
            lastZ += deltaZ;
            res.push([lastLat, lastLng, lastZ]);
            i += 3;
        } else {
            res.push([lastLat, lastLng]);
            i += 2;
        }
    }

    if (i !== decoder.length) {
        throw new Error('Invalid encoding. Premature ending reached');
    }

    return {
        ...header,
        polyline: res,
    };
  }

  private decodeHeader(version: any, encodedHeader: any) {
    if (+version.toString() !== this.FORMAT_VERSION) {
        throw new Error('Invalid format version');
    }
    const headerNumber = +encodedHeader.toString();
    const precision = headerNumber & 15;
    const thirdDim = (headerNumber >> 4) & 7;
    const thirdDimPrecision = (headerNumber >> 7) & 15;
    return { precision, thirdDim, thirdDimPrecision };
  }

  private decodeUnsignedValues(encoded: any) {
    let result = this.Num(0) as bigint;
    let shift = this.Num(0) as bigint;
    const resList: any[] = [];
  
    encoded.split('').forEach((char: any) => {
        const value = this.Num(this.decodeChar(char)) as bigint;
        result |= (value & this.Num(0x1F) as bigint) << shift;
        if ((value & this.Num(0x20) as bigint) === this.Num(0)) {
            resList.push(result);
            result = this.Num(0) as bigint;
            shift = this.Num(0) as bigint;
        } else {
            shift += this.Num(5) as bigint;
        }
    });
  
    if (shift > 0) {
        throw new Error('Invalid encoding');
    }
  
    return resList;
  }

  private decodeChar(char: any) {
    const charCode = char.charCodeAt(0);
    return this.DECODING_TABLE[charCode - 45];
  }

  private toSigned(val: bigint) {
    // Decode the sign from an unsigned value
    let res = val;
    if (res & this.Num(1) as bigint) {
        res = ~res;
    }
    res >>= this.Num(1) as bigint;
    return +res.toString();
  }


}

/*

function encode({ precision = DEFAULT_PRECISION, thirdDim = ABSENT, thirdDimPrecision = 0, polyline }) {
    // Encode a sequence of lat,lng or lat,lng(,{third_dim}). Note that values should be of type BigNumber
    //   `precision`: how many decimal digits of precision to store the latitude and longitude.
    //   `third_dim`: type of the third dimension if present in the input.
    //   `third_dim_precision`: how many decimal digits of precision to store the third dimension.

    const multiplierDegree = 10 ** precision;
    const multiplierZ = 10 ** thirdDimPrecision;
    const encodedHeaderList = encodeHeader(precision, thirdDim, thirdDimPrecision);
    const encodedCoords = [];

    let lastLat = Num(0);
    let lastLng = Num(0);
    let lastZ = Num(0);
    polyline.forEach((location) => {
       const lat = Num(Math.round(location[0] * multiplierDegree));
       encodedCoords.push(encodeScaledValue(lat - lastLat));
       lastLat = lat;

       const lng = Num(Math.round(location[1] * multiplierDegree));
       encodedCoords.push(encodeScaledValue(lng - lastLng));
       lastLng = lng;

       if (thirdDim) {
           const z = Num(Math.round(location[2] * multiplierZ));
           encodedCoords.push(encodeScaledValue(z - lastZ));
           lastZ = z;
       }
    });

    return [...encodedHeaderList, ...encodedCoords].join('');
}

function encodeHeader(precision, thirdDim, thirdDimPrecision) {
    // Encode the `precision`, `third_dim` and `third_dim_precision` into one encoded char
    if (precision < 0 || precision > 15) {
        throw new Error('precision out of range. Should be between 0 and 15');
    }
    if (thirdDimPrecision < 0 || thirdDimPrecision > 15) {
        throw new Error('thirdDimPrecision out of range. Should be between 0 and 15');
    }
    if (thirdDim < 0 || thirdDim > 7 || thirdDim === 4 || thirdDim === 5) {
        throw new Error('thirdDim should be between 0, 1, 2, 3, 6 or 7');
    }

    const res = (thirdDimPrecision << 7) | (thirdDim << 4) | precision;
    return encodeUnsignedNumber(FORMAT_VERSION) + encodeUnsignedNumber(res);
}

function encodeUnsignedNumber(val) {
    // Uses variable integer encoding to encode an unsigned integer. Returns the encoded string.
    let res = '';
    let numVal = Num(val);
    while (numVal > 0x1F) {
        const pos = (numVal & Num(0x1F)) | Num(0x20);
        res += ENCODING_TABLE[pos];
        numVal >>= Num(5);
    }
    return res + ENCODING_TABLE[numVal];
}

function encodeScaledValue(value) {
    // Transform a integer `value` into a variable length sequence of characters.
    //   `appender` is a callable where the produced chars will land to
    let numVal = Num(value);
    const negative = numVal < 0;
    numVal <<= Num(1);
    if (negative) {
        numVal = ~numVal;
    }

    return encodeUnsignedNumber(numVal);
}
*/
