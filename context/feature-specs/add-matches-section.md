Implement the Matches section for the team to view their results (no need of live or fixtures). The sql schema for the matches table is given in the db/schema.sql.

## Implementationv

### Matches Section UI

- The route shall be created and named as `/matches` and this route all also should be protected with access pin like `/leaderboard`, `/add-score`, `/profile`.

- The top-left of the page should contain the "BACK" button like all other pages.

- Then a heading named with "MATCHES OVERVIEW" below the heading a grid component should displayed with the following attributes Matches Played, Won, Loss, Win Percentage.

- Then a small section that has "// MATCH RESULTS" heading, AddMatchDialog to add new matche and a MatchHistoryFilterDialog to filter the matches by months and year.

- The AddMatchDialog can have Team 1 name default as Thunderbolts, team 1 score with a text input, overs played by team 1 as text input, Team 2 name as text input, team 2 score with a text input, overs played by team 2 as text input, location as text input, match type with a selection box option "PRACTICE MATCH".

- Following that the MatchResults Component (grid 1 col for sm, grid 3 cols for xl) to display the MatchResultCard.

- The MatchResultCard contains the following, match_result_desc, team_1 (default THUNDERBOLTS), score_1, overs_played_1, team_2, score_2, overs_played_2, location, and match_type.

- The card shall look like every prop is non-optional:
    - top of the card contains the match_result_desc
    - team_1 capitalized
    - score_1 along overs_played_1 within brackets
    - team_2 capitalized
    - score_2 along with overs_played_2 within brackets
    - location with match_date separated by pipe
    - match_type

### Backend Workflow

- The matches table created and can be referred in db/schema.sql

- The both GET function for displaying matched and POST for adding new match results are done in this route (api/matches).

- In the AddMatchDialog user enters data and the data should be stored in the matches table 

- When the user opens the matches route the GET should retrieve all the data to be displayed in the UI.

- Create the types for both frontend and backend props in types folder

- Wire the all necessary data properly in order to display in UI.

## Check When Done

- Matches overview grid is wired with all attributes
- adding match dialog is wired and matches can be added
- Whether the filter contains the checkboxes
- All the matches and match data are wired and displayed per date
- No TypeScript Errors
- No lint errors