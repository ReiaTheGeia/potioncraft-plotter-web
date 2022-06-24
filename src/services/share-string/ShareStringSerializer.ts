import { injectable, singleton } from "microinject";
import pako from "pako";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";
import {
  encode as encodeSafeBase64,
  decode as decodeSafeBase64,
  isUrlSafeBase64,
} from "url-safe-base64";

import { PlotItem } from "../plotter/types";

@injectable()
@singleton()
export class ShareStringSerializer {
  serialize(items: readonly PlotItem[]): string {
    const json = JSON.stringify(items);
    const encoded = pako.deflate(json);
    const data = new Uint8Array(1 + encoded.length);
    data.set(encoded, 1);
    new DataView(data.buffer).setUint8(0, 0);
    const b64 = encodeBase64(data);
    return encodeSafeBase64(b64);
  }

  deserialize(shareString: string): PlotItem[] {
    if (isUrlSafeBase64(shareString)) {
      shareString = decodeSafeBase64(shareString);
    }

    const array = decodeBase64(shareString);
    const dv = new DataView(array);
    const version = dv.getUint8(0);
    const data = array.slice(1);
    if (version === 0) {
      let zipData: string;
      try {
        zipData = pako.inflate(data, { to: "string" });
      } catch (e: any) {
        // pako throws strings.
        throw new Error("Failed to decode share data: " + e);
      }
      const decoded = JSON.parse(zipData) as any[];
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
