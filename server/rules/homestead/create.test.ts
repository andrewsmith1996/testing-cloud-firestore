import * as firebase from '@firebase/testing';

import {
  COLLECTIONS,
  documentPath,
  generateMockDocument,
  generateMockUpdateDocument,
  generateId,
  generateUserId,
} from '../../test-helpers/contants';
import {
  Firestore,
  getAdminApp,
  setup,
  teardown,
} from '../../test-helpers/firestore-helpers';

const COLLECTION = COLLECTIONS.HOMESTEADS;
const DOC_ID = generateId();
const USER_ID = generateUserId();

describe('/homesteads/create', () => {
  let db: Firestore;

  describe('authenticated', () => {
    beforeAll(async () => {
      db = await setup(USER_ID, {
        [documentPath(COLLECTIONS.USERS, USER_ID)]: generateMockDocument(),
      });
    });

    afterAll(() => teardown());

    test('disallow if a homestead has already been created', async () => {
      const adminDb = getAdminApp();
      await adminDb
        .collection(COLLECTIONS.USERS)
        .doc(USER_ID)
        .update({ ownedHomestead: generateId() });

      const document = db.collection(COLLECTION).doc(DOC_ID);
      await firebase.assertFails(document.set(generateMockUpdateDocument()));
    });

    test('allow if a homestead has not already been created', async () => {
      const adminDb = getAdminApp();
      await adminDb
        .collection(COLLECTIONS.USERS)
        .doc(USER_ID)
        .update({ ownedHomestead: '' });

      const document = db.collection(COLLECTION).doc(DOC_ID);
      await firebase.assertSucceeds(document.set(generateMockUpdateDocument()));
    });
  });

  describe('unauthenticated', () => {
    beforeAll(async () => {
      db = await setup();
    });

    afterAll(() => teardown());

    test('disallow', async () => {
      const document = db.collection(COLLECTION).doc(DOC_ID);
      await firebase.assertFails(document.set(generateMockUpdateDocument()));
    });
  });
});
