Create a overlay sidebar in the home page and remove the overall stats button and lock icon from home page. Ensure the sidebar has the following menus Overall Stats(/leaderboard) and Manage Players (/admin).

## Implementation

- I need an overlay sidebar that has an icon and contains the two main menus Overall Stats and Manage Players.
- The sidebar first row should contain Appname and the close sidebar icon then the menus follow.
- The sidebar should accessible from all routes and the sidebar icon should be visibile from all routes on top-right corner.
- For the home page the replace the lock icon with the sidebar icon and make sure Overall Stats button removed then the sidebar contains Overall Stats & Manage Players. Also delete the BottomNav component.
- For the add-score and edit score pages make the name of the players centered and the sidebar menu top-right.
- For the player profile (/profile), just make it in top-right corner.
- For the Overall stats section (/leaderboard), remove the "BACK" button and replace with "// OVERALL STATS". Replace the "// OVERALL STATS" in the right-top with sidebar icon.
- No need of sidebar in /admin.

## Check When Done

- Whether all the sidebar actions are wired.
- No TypeScript Errors.
- No lint errors.