Change the overall stats structure excluding header and tabs. Replace the one-by-one component list with a table for both the batting and bowling sections.

## Implementation
- For both the sections replace the `LeaderBoardList` and `LeaderBoardItem` with a table.
- Wire the data that are need to be included in the table.
- The table should be like a carousel where the name is fixed the overflowing attributes should be scrollable through the right.
- Give a brighter color for the rank 1 (both sections) and default for rest of the players.
- Ensure the table that contains all the following attributes:

### Batting Section
- No of matches played as "Matches", Total no of innings players as "Inns", Total runs scored across all matches as "Runs", Total no of balls faced across all matches as "BF", Batting average as "Avg", Strike Rate of the batsman as "STR", total no of fours hit as "4s" and total no of sixes hit as "6s", The respective player's highest score as "HS", The no of times the batsman has been not out in the innings he has played as "NOs".

### Bowling Section
- No of matches played as "Matches", No of innings bowled as "Inns", total no of wickets taken as "WKTS", The total no of overs bowled as "Overs", The economy of the bowler as "ECO", The overalls given across matches as "Runs Given", no of 3-wickets taken in a single innings as 3WI, no of 5 wickets taken in an innings as 5WI, The best bowled in an innings by the bowler as "BBM".

## Check When Done

- Whether all the columns and rows are evenly arranged.
- All the attributes data are wired.
- No TypeScript Errors.
- No lint errors.