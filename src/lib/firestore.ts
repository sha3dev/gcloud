/**
 * PgService
 */

/**
 * imports: externals
 */

import Logger from "@sha3dev/logger";
import { CollectionReference, Firestore as FirestoreClient } from "@google-cloud/firestore";

/**
 * imports: internals
 */

/**
 * module: initializations
 */

const logger = new Logger("firestore");

/**
 * types
 */

export type FirestoreOptions = {
  projectId: string;
  credentials: {
    clientEmail: string;
    privateKey: string;
  };
};

/**
 * consts
 */

/**
 * exports
 */

export default class Firestore {
  /**
   * private: attributes
   */

  private client: FirestoreClient;

  /**
   * private: properties
   */
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

  constructor(options: FirestoreOptions) {
    const { projectId, credentials } = options;
    const { clientEmail, privateKey } = credentials;
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(`invalid firestore credentials: project id, client email or private key are missing`);
    }
    logger.info(`initializing firestore (client_email: ${clientEmail})`);
    this.client = new FirestoreClient({projectId, credentials: { client_email: clientEmail, private_key: privateKey } });
  }

  /**
   * public: methods
   */

  public getCollection<T>(collectionName: string): CollectionReference<T> {
    return this.client.collection(collectionName) as CollectionReference<T>;
  }

  public getDocument(collectionName: string, documentKey: string) {
    const collection = this.getCollection(collectionName);
    const document = collection.doc(documentKey);
    return document;
  }
}
