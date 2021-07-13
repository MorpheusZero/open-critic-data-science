import { readFileSync, writeFileSync } from "fs";

/**
 * Parsing the data we have collected in ways that charts can read them for data plotting.
 */
export class DataAnalyzer {
  /**
   * Will read through all of the score data for PS5 games and map out data points.
   */
  public static analyzeScoreDataByYear(): void {
    try {
      // Get the data we want to parse
      const detailData = JSON.parse(
        readFileSync("./data/ps5_game_details_1626146338471.json", {
          encoding: "utf-8",
        })
      );
      console.log(`Preparing to analyze [${detailData.length}] games...`);

      let labels = [];
      let scores = [];

      // The data is formatted like this.
      // {"id":163,"name":"Grand Theft Auto V","numReviews":83,"score":95.91025641025641,"releaseDate":"2014-11-18T00:00:00.000Z"}
      for (const detail of detailData) {
        // Parse out the year of the release data
        const releaseDateYear = new Date(detail.releaseDate).getFullYear();
        if (!labels.includes(releaseDateYear) && releaseDateYear > 1900) {
          labels.push(releaseDateYear);
        }

        // Get the score floor and add it to scores
        const scoreFormatted = Math.floor(detail.score);
        if (scoreFormatted > 0) {
          scores.push({
            year: releaseDateYear,
            score: scoreFormatted,
          });
        }
      }

      // Reorder Years in ASC order
      labels = labels
        .sort(function (a, b) {
          return b - a;
        })
        .reverse();

      // Loop through each score and for each years worth of data, we want to average the scores and set an overall average for that release year.
      let releaseYearDataScores = {};
      for (const score of scores) {
        if (!releaseYearDataScores.hasOwnProperty(score.year.toString())) {
          releaseYearDataScores[score.year.toString()] = [];
        }
        releaseYearDataScores[score.year.toString()].push(score.score);
      }

      // Finally lets go through each releaseYearDataScores and average all of the data per year label--and post just that one number to the finalScores array for charting.
      let finalScores = [];

      Object.keys(releaseYearDataScores).forEach((key) => {
        const average =
          releaseYearDataScores[key].reduce(function (sum, value) {
            return sum + value;
          }, 0) / releaseYearDataScores[key].length;
        finalScores.push(average);
      });

      // Lastly write a new data file for the visualizer to load when we view the web page.
      let DATA_SCRIPT = "window.PS5DATA = { LABELS: null, SCORES: null }; \n\n";
      DATA_SCRIPT += `window.PS5DATA.LABELS = [${labels}]; \n\n`;
      DATA_SCRIPT += `window.PS5DATA.SCORES = [${finalScores}];`;
      writeFileSync("./public/ps5_data.js", DATA_SCRIPT, {
        encoding: "utf-8",
      });
    } catch (error) {
      console.error(error.message);
    }
  }
}
