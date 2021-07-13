import { OpenCriticClient } from "open-critic-node";
import { PlatformType } from "open-critic-node/dist/client/enums/platform-type";
import { writeFileSync } from "fs";

/**
 * This manager will use the OpenCriticNode Lib to obtain a mapping of all game IDs that we can then use to get game data for each ID later.
 */
export class GamesIDManager {
  /**
   * A reference to the active Client SDK.
   * @private
   */
  private client: OpenCriticClient;

  /**
   * Default Constructor
   */
  constructor() {
    this.client = new OpenCriticClient();
  }

  /**
   * This is the entry-point for the manager that should be called to scrape all data from the API.
   */
  public async getAllGamesData(): Promise<any> {
    try {
      await this.getAllPlaystation5Games();
    } catch (error) {
      // We only throw an error at this level if a fatal error occurs. Otherwise, we'll catch small HTTP errors in each method below.
      console.error(error.message);
      return null;
    }
  }

  /**
   * This will use the API to get all Playstation 5 games.
   * @private
   */
  private async getAllPlaystation5Games(): Promise<void> {
    try {
      // We use this to determine if we need to keep calling the API for the next page or not.
      // If a request returns 0 items--then we can break out.
      let lastItemsCount = -1;

      // The current page for querying the API.
      let page = 0;

      // A placeholder for all of the game IDs we want to store.
      let gameIds = [];

      while (lastItemsCount !== 0) {
        const games = await this.client.getGames({
          page,
          platforms: [PlatformType.SONY_PLAYSTATION_5],
        });
        lastItemsCount = games.length;
        if (lastItemsCount) {
          games.forEach((summary) => {
            console.log(`[${summary.name}]`);
            gameIds.push({
              id: summary.id,
              name: summary.name,
            });
          });
          page++;
        } else {
          console.log(
            `PS5 games retrieval ended at page [${page}] with total games at [${gameIds.length}]`
          );
        }
      }
      // Write the game IDs to a JSON file for us to parse later.
      writeFileSync(
        `./data/ps5_game_ids_${new Date().valueOf()}.json`,
        JSON.stringify(gameIds),
        {
          encoding: "utf-8",
        }
      );
    } catch (error) {
      console.error(error.message);
    }
  }
}
