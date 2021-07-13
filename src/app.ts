import { DataAnalyzer } from "./analyze/data-analyzer";

/**
 * An Async function to start the process off.
 */
const run = async () => {
  // ## Uncomment this to get fresh game IDs from the scraper.
  // const gamesIdManager = new GamesIDManager();
  // await gamesIdManager.getAllGamesData();
  // ## Uncomment this to get fresh game details from the scraper.
  // const gamesDetailsManager = new GamesDetailsManager();
  // await gamesDetailsManager.getAllGamesDetails();

  DataAnalyzer.analyzeScoreDataByYear();
};

run()
  .then(() => {
    console.log("Process Complete!");
  })
  .catch((error) => {
    console.log(error.message);
  });
