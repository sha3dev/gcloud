/**
 * PgService
 */

/**
 * imports: externals
 */
 import { DownloadResponse, File, Storage as CloudStorage } from '@google-cloud/storage';

/**
 * imports: internals
 */

/**
 * module: initializations
 */

/**
 * types
 */

/**
 * consts
 */

/**
 * exports
 */

export default class Storage {
  /**
   * private: attributes
   */

  /**
   * private: properties
   */

   private _storage: CloudStorage | null = null;

  /**
   * public: properties
   */
  /**
   * private static: methods
   */
  /**
   * private: methods
   */

  /**
   * constructor
   */

  public constructor(private _options: { projectId: string, bucket: string, credentials: { clientEmail: string, privateKey: string }}) {
    const { projectId, credentials } = this._options;
    const { clientEmail, privateKey } = credentials;
    this._storage = new CloudStorage({ projectId, credentials: { client_email: clientEmail, private_key: privateKey } });
  }

  /**
   * public: methods
   */

   public async uploadFile(path: string, content: Buffer): Promise<void> {
    const { bucket } = this._options;
    const file: File | undefined = this._storage?.bucket(bucket).file(path);
    await file?.save(content, {});
  }

  public async downloadFile(path: string): Promise<Buffer | null> {
      const { bucket } = this._options;
      const content: DownloadResponse | undefined = await this._storage?.bucket(bucket).file(path).download();        
      if (content && content[0]) {
          return content[0];
      }
      else {
          return null;
      }
  }

  public async deleteFiles(path: string): Promise<void> {
      const { bucket } = this._options;
      await this._storage?.bucket(bucket).deleteFiles({
          prefix: path,            
      });
  }  
}
