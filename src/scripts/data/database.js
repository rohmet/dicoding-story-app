import { openDB } from "idb";

const DATABASE_NAME = "story-app-db";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "saved-stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: "id",
    });
  },
});

const Database = {
  /**
   * CREATE: Menyimpan story
   */
  async putStory(story) {
    if (!Object.hasOwn(story, "id")) {
      throw new Error("`id` is required to save.");
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  /**
   * READ (Single): Mendapatkan satu story
   */
  async getStoryById(id) {
    if (!id) {
      throw new Error("`id` is required.");
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  /**
   * READ (All): Mendapatkan semua story
   */
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  /**
   * DELETE: Menghapus story
   */
  async removeStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default Database;
