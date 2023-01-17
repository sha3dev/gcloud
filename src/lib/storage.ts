/**
 * imports: externals
 */

import Logger from "@sha3dev/logger";
import { Storage } from "@google-cloud/storage";
import os from "os";
import fs from "fs-extra";
import path from "path";
import axios from "axios";
import crypto from "crypto";

/**
 * imports: internals
 */

/**
 * module: initializations
 */

const logger = new Logger("gcloud");

/**
 * types
 */

export type StorageOptions = {
  bucketName: string;
  keyFilename?: string | null;
  googleProjectId?: string | null;
  googleClientEmail?: string | null;
  googlePrivateKey?: string | null;
  defaultMetadata?: Record<string, string>;
};

/**
 * consts
 */

const DEFAULT_CACHE_CONTROL = { cacheControl: "public, max-age=86400" }; // one day
const WORK_FOLDER = path.join(os.tmpdir(), "storage-work-folder");

/**
 * export
 */

export default class {
  /**
   * private: attributes
   */

  private storage: Storage;

  /**
   * constructor
   */

  constructor(private options: StorageOptions) {
    fs.ensureDirSync(WORK_FOLDER);
    fs.emptyDirSync(WORK_FOLDER);
    if (
      options.googleProjectId &&
      options.googleClientEmail &&
      options.googlePrivateKey
    ) {
      this.storage = new Storage({
        projectId: options.googleProjectId,
        credentials: {
          client_email: options.googleClientEmail,
          private_key: options.googlePrivateKey
        }
      });
    } else if (options.keyFilename) {
      this.storage = new Storage({
        keyFilename: options.keyFilename
      });
    } else {
      throw new Error(`credentials not found in storage options`);
    }
  }

  /**
   * private: methods
   */

  private listFiles(dirPath: string, result: string[] = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
        this.listFiles(`${dirPath}/${file}`, result);
      } else {
        result.push(`${dirPath}/${file}`);
      }
    });
    return result;
  }

  /**
   * public: methods
   */

  async upload(
    filename: string,
    destination: string,
    metadata: Record<string, unknown> = {}
  ) {
    return this.storage.bucket(this.options.bucketName).upload(filename, {
      destination,
      metadata: {
        ...DEFAULT_CACHE_CONTROL,
        ...(this.options.defaultMetadata || {}),
        ...metadata
      }
    });
  }

  async uploadData(
    data: string,
    destination: string,
    metadata: Record<string, unknown> = {}
  ) {
    const filename = crypto.randomBytes(16).toString("hex");
    const tmp = path.join(WORK_FOLDER, filename);
    await fs.writeFile(tmp, data);
    const result = await this.upload(tmp, destination, metadata);
    await fs.removeSync(tmp);
    return result;
  }

  async uploadFolder(srcLocalFolder: string, destination: string) {
    const files = this.listFiles(srcLocalFolder);
    await Promise.all(
      files.map(async (fileFullPath) => {
        const fileName = fileFullPath.replace(srcLocalFolder, "");
        const destinationStoragePath = `${destination}${fileName}`;
        await this.upload(fileFullPath, destinationStoragePath);
      })
    );
  }

  async deleteByPrefix(prefix: string) {
    logger.debug(`deleting by prefix: ${prefix}`);
    return this.storage.bucket(this.options.bucketName).deleteFiles({ prefix });
  }

  // eslint-disable-next-line class-methods-use-this
  async download(url: string, filename?: string) {
    const responseType = filename ? "stream" : "text";
    const response = await axios.get(url, { responseType });
    if (filename) {
      const writer = fs.createWriteStream(filename);
      response.data.pipe(writer);
      logger.debug(`downloading ${url} to ${filename}...`);
      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }
    return response.data;
  }

  async copy(items: { src: string; dest: string }[]) {
    await Promise.all(
      items.map((item) =>
        this.storage
          .bucket(this.options.bucketName)
          .file(item.src)
          .copy(item.dest)
      )
    );
  }
}
