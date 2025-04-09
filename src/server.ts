import mime from 'mime';
import { readFile } from 'fs/promises';
import { basename } from 'node:path';
import {Strapi} from "@/index.ts";

export class ServerStrapi extends Strapi {
  /**
   * @param files list of files names which will be uploaded, example: ['/app/data/cover.js']
   */
  async upload(files: { path: string, filename?: string }[]) {
    const form = new FormData();
    await Promise.all(files.map(async (item) => {
      const fileBuffer = await readFile(item.path);
      const file = new File([fileBuffer], item.filename || basename(item.path), {type: mime.getType(item.path) || 'image/jpeg'});
      form.append( 'files', file);
    }));
    return await this.uploadForm(form);
  }
}
