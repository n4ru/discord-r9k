# discord-r9k

Discord R9K is a discord bot created to persuade unique and verbose discussion in a discord channel of your choosing. Simply fill out the configuration and launch the bot to get going. 

## Implementation
Every message is scanned by the bot, and checked against an existing database of message sequences/hashes. Upon finding a match (non-unique message), a role is applied ot the user (a mute role) for `timeout * (timeoutMultiplier ^ nonce)` seconds, and their nonce is increased by 1. If no match is found, all non-alphabetical characters (only the English 26) are stripped, non-unique letters are stripped, and order of the remaining unique letters is preserved. This means that sentences that are too similar and too short ("This is a test" is the same as "This is a set") will trigger the bot, and longer more constructive discussion is required to avoid triggering the bot. Fortunately, because the amount of unique combinations is 26 factorial, it is unlikely for completely different sentences utilizing more than a dozen unique letters. It is unlikely for a sentence longer than ten words to be falsely detected as a duplicate.

## Configuration

### timeout
This must be set to an integer equal to the initial mute you want divided by the timeoutMultiplier. If you want the first timeout to be 4 seconds and your timeoutMultiplier is 2, set this to 2.
### timeoutMultiplier
The amount that the mute is multiplied by each time as an integer. 
### token
Your bot's authorization token, as a string.
### channel
The ID of the channel you want the bot to monitor and take part in, as a string.
### role
The ID of the role you want to apply when a person is muted, and removed when a person is unmuted, as a string.
### drole
The ID of the role you want to apply when a person is unmuted, and removed when a person is muted, as a string. If this is set to `null`, this will be ignored.
### guild
Your server's ID as a string.
### edits
Boolean. Do you want the bot to monitor edited messages? This will very frequently result in edits causing a person to be muted, but disabling this will allow anyone to modify their messages to non-unique content after their initial message.
### anon
Boolean. Do you want to anonymize the database? Setting this to false will allow you to identify some messages sent by the server within the database. Setting this true will slightly increase database size, but is recommended.
### mods
An array of strings containins the user IDs of people you want to be able to use moderator commands in the bot's channel.
### nonce
How often to "decay" the nonce of all users, as an integer denoting number of hours. If this is set to null, decay will be disabled (mutes will always go up and never down).
### decay
The amount by which to decay nonces, as an integer. Every time a decay is triggered, all users have their this amount deducted from their nonces. 

## Moderator Commands
The bot includes some simple moderator commands. To use them, type the command and then tag the user you want to apply the command to.

### !mute
This force mutes a person and increments their nonce, as if they had just triggered the bot with a non-unique message. Users that manage to circumvent the r9k filter can be dissuaded from doing so using this command. Note that already muted users will be freshly muted from this command.
### !unmute
Unmute a user, as if their mute had expired.
### !nonce
Unmute a user and reset their nonce to 1. This essentially hard resets a user as if they just started using the channel, but does not erase their past message sequences/hashes from the database.