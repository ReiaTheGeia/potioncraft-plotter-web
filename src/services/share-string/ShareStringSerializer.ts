import { injectable, singleton } from "microinject";
import pako from "pako";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";

import { PlotItem } from "../plotter/types";

@injectable()
@singleton()
export class ShareStringSerializer {
  serialize(items: readonly PlotItem[]): string {
    const encoded = pako.deflate(JSON.stringify(items));
    const data = new Uint8Array(1 + encoded.length);
    data.set(encoded, 1);
    new DataView(data.buffer).setUint8(0, 0);
    return encodeBase64(data);
  }

  deserialize(shareString: string): PlotItem[] {
    const array = decodeBase64(shareString);
    const dv = new DataView(array);
    const version = dv.getUint8(0);
    const data = array.slice(1);

    if (version === 0) {
      const decoded = JSON.parse(pako.inflate(data, { to: "string" })) as any[];
      if (!Array.isArray(decoded)) {
        return [];
      }
      return decoded.map((item) => this._deserializePlotItemV0(item));
    }

    throw new Error(`Unknown shareString version ${version}.`);
  }

  private _deserializePlotItemV0(item: any): PlotItem {
    if (item.type === "set-position" && item.position) {
      return {
        type: "set-position",
        x: item.position.x,
        y: item.position.y,
      };
    }

    return item;
  }
}
