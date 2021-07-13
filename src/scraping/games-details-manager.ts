import { OpenCriticClient } from "open-critic-node";
import { writeFileSync, readFileSync } from "fs";

/**
 * This manager will use the OpenCriticNode Lib to get the details for games by their IDs.
 */
export class GamesDetailsManager {
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
  public async getAllGamesDetails(): Promise<any> {
    try {
      // First read the JSON file with the IDs in it to get the initial data set.
      const gameIds = JSON.parse(
        readFileSync("./data/ps5_game_ids_1626144940579.json", {
          encoding: "utf-8",
        })
      );

      // Pass the data to the handler that will get the game details and build a new array.
      await this.processGameIds(gameIds);
    } catch (error) {
      // We only throw an error at this level if a fatal error occurs. Otherwise, we'll catch small HTTP errors in each method below.
      console.error(error.message);
      return null;
    }
  }

  /**
   * This will use the API to get all Playstation 5 games details from the list that we give it.
   * @private
   */
  private async processGameIds(
    gameIds: { name: string; id: number }[]
  ): Promise<void> {
    try {
      // A placeholder for all of the games we want to store.
      let gameDetails = [];

      for (const game of gameIds) {
        const details = await this.client.getGameById(game.id);
        if (details && details.id) {
          // Only keep the data we care about for our data science experiment.
          gameDetails.push({
            id: details.id,
            name: details.name,
            numReviews: details.numReviews,
            score: details.averageScore,
            releaseDate: details.firstReleaseDate,
          });
          console.log(`[${details.name}]`);
        }
      }
      // Write the game IDs to a JSON file for us to parse later.
      writeFileSync(
        `./data/ps5_game_details_${new Date().valueOf()}.json`,
        JSON.stringify(gameDetails),
        {
          encoding: "utf-8",
        }
      );
    } catch (error) {
      console.error(error.message);
    }
  }
}
