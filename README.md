# rl-analytics

Rocket League Analytics provides in-game analytics, match history, and statistics tracking for Rocket League players.

Hosted on [Heroku](http://rocketleagueanalytics.herokuapp.com).

## How does it work?
At the start of each Rocket League match they play, the app's users submit a screenshot of the in-game scoreboard, from which the app will extract the usernames of all players involved in the game. Data on those players is scraped from Rocket League statistics website Tracker Network and presented to the user in an easily-consumable fashion to be absorbed whilst playing. Once the match has concluded, the same data is scraped again and the result is calculated by identifying the differences in each player's MVPs, goals, wins, assists, saves, and shots. This match data is stored in a PostgreSQL database, enabling the app to also provide users with match history and statistics tracking over time.

The concept of 'sessions' are used within the app such that users can create and view sessions, and new matches are added to a session. Logged in users can control a session from multiple devices, allowing them to take the screenshots on their phone but view the analytics on a larger screen. Users can also co-host sessions, where any host of a session can edit names and add new matches, which is useful for when playing with friends. All hosts and viewers of a session see the same analytics which update in real-time.

**Warning: The username recognition feature no longer works as my free Google Cloud trial (which was used to extract text from screenshots) has expired.**
