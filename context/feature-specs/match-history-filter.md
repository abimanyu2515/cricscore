As the no of matches are keep on increasing the users cannot scroll down forever to take a look at previously played matches. Implement a filter feature that enables year-wise and month-wise filtering of matches. When the user selects an year and month the match history in player profile should display matches played in selected month.

## Implementation

- By default display last 3 matches player by the respective player.
- If and only the user selects a particular month, the matches of the month shall be displayed.
- The feature should be implemented inside the /player/[id]/profile, beside the "// MATCH HISTORY" justified between then a button containing "{ThreeDecreasingLineFilterIcon} Filter".
- After the button, a dialog with 2 select boxes month and year.
- Wire the required data and props for the match history filter implementation.

## Check When Done

- Whether the filter contains the checkboxes.
- All the matches are wired and displayed per date.
- No TypeScript Errors.
- No lint errors.