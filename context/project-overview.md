# CricScore

## Overview

CricScore is a Cricket Score Tracker App for a Cricket Team. Here the scores and wickets of each player are entered match-wise, the players can go through match history in profile and overall stats to compare & compete. Admin page is accessible by players who has admin pin to edit or delete players personal or match data.

## Goals

1. The user must be authenticated by 5-digit pin and cookies stored for a 30-day period.
2. Any player who logged in can create a new player and add scores for any existing player
3. Anyone can access any players profile stats and team's overall stats.
4. Accessing admin page and editing existing match data is only done by admins who knows valid 4-digit pin.
5. The admins do not get cookies stored everyone should enter pin whnever they need to access admin page or edit any player's existing match data.

## Core User Flow

1. User enters the valid 6-digit pin.
2. User can checkout existing players and can create new player by clicking Add New Player Card.
3. In Add Player Dialog user enters player name and their role in the team.
4. For existing players, the user can perform two main things, enter score and checkout their individual stats profile.
5. To enter score for a player, the user can single tap the card containing the respective name of the player and enter the valid scores.
6. To access a players individual stats profile by long pressing the name of the respective player, it shows the runs, average, strike rate, wickets, economy and more along with the match history of the respective player.
7. To edit an existing match data of a player the admin should enter the admin after clicking the edit, except match date and match label the other mismatched data can be rectified or deleted.
8. The user can see all the players stats with ranks in the overall stats section with has separate tabs for batting and bowling.
9. Admins can access the admin page with their 4-digit pin, there admins can edit an individual players name and role if it was entered wrong initially or delete the player if their are created by mistake.

## Features

### Add and Manage Players 
- Add new players effortlessly without admin constarints.
- Admins manage all the existing players such as editing names/roles and removing players who were created by mistake.

### Overall Stats
- The statistics of all the players present in the team are brought together in a single place.
- Here other players can compare and compete with their teammates.

### Edit / Delete Existing Match Data
- The previous match data of players can be edited if some of the data are mistakenly entered or missed while scoring.
- Admins can edit the existing data by entering the valid admin pin.
- The match date and match label cannot be changed.
- If the player didn't played the match but there is mentioned they have played we delete the particular match data with delete option.

### Add Player Score
- Anyone who is authenticated with the secret pin can add scores to any existing player.
- If the match label is not entered the scores will not be stored.
- If the sum of singles, doubles, triples, fours and sixes didn't match the overall amount of runs the score will not be stored.

## Scope

### In Scope

- 5-digit pin authentication for valid users and team players
- 4-digit pin verfication for admins to manage existing players and modify exisiting match data.
- Adding new players and adding scores for created and existing players.
- The new scores will not be stored if the sum of singles, doubles, triples, fours and sixes didn't match the overall amount of runs entered.
- Only admins can edit players name/role and edit existing match data. Also even admins cannot change match date and match label once entered initially.
- Overall stats section to list and rank all the players according to their individual stats.
- Single tap on player card to add score and long press to view individual player profile, stats and match history.

## Success Criteria
1. A user or a player enters the app and enter the valid 5-digit pin and cookies stored.
2. A user can single click to enter score and long press to view player stats and match history.
3. A user/player can add scores for any existing player.
4. In the match history cards the user can edit/delete one match data if they are also an admin.
5. Overall stats section to list and rank all the players according to their stats.
6. Admins can manage/modify all the existing players in /admin with valid admin pin.