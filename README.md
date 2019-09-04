After playing uno with some people on discord, I thought it'd be a fun little project to create a simple bot that plays the game automatically -- maybe even give it a slight strategic advantage. I decided to use a site called unofreak as the game host due to its simplicity and multiplayer capacity. **Please note that it is highly likely that I made mistakes and there are probably better ways for this to be written. I'm open to corrections a suggestions.**
To prevent skidding, I left out a few unimportant bits of code (mostly structural).

## Step 1 - Reconnaissance
Before beginning, I needed to understand how the service worked. I started up a private game and began digging.
The first thing I noticed was a structure for card IDs:
`<button class="cbtn" onclick="sendcard('116');" style="background-image:url(https://cdn1.cf/images/116.png);" id="cbtnh"></button>`
ID 116 renders a blue 6, while ID 132 renders a red 2 -- I noticed a pattern.
All blue cards have a 1 in the second position, all red cards have a 3, and so son.
The foramat is as follows:
**First digit**: card type (1 = number card, 2 = "special" colored card, 3 = wildcard)
**Second digit**: card color (0 for wildcards, 1 for blue, 2 for green, 3 for red, 4 for yellow)
**Third digit**: card number or "special" id (1 for wild with no pickup, 2 for wild +4 pickup, 1 for colored +2, 2 for colored reverse, 3 for colored skip)

Second I noticed some nicely exposed functions I could access to work the game programmatically.
Calling a function named sendcard() with an aforementioned card ID would play the card.
Passing in 'uno' as a parameter would make the player pick a card from the deck.
Passing 'calluno' as a parameter does as you might expect.
After playing a wildcard, the color can be set by passing in a color name to the sendcard function. i.e sendcard('BLUE');
Calling the SendMessage() function pushes the #chatmsg input to the chat box. That could be fun later.

## Step 2 - Events
The first step in actually creating the bot was having it determine when it was its turn.
I had originally thought to check the header text (.gt div) for changes with the DOMSubtreeModified event, but I'd have to listen on the parent, which fires so many events that the event would fire unnecessarily. I decided instead to use the player menu on the right, checking for the turn color on our player.
![https://tinyimg.io/i/bM4AQjL.png](https://tinyimg.io/i/bM4AQjL.png)

![https://tinyimg.io/i/xI3UFEO.png](https://tinyimg.io/i/xI3UFEO.png)

Nice! 

## Step 3 - Reading Basic Game State
To make things a little neater I made a separate game state class.
The first piece of state information I would need is a list of cards in the player's inventory.
The problem with this is that there's very little structural separation between the active card and the player's inventory, I decided to just skip the first two entries (where one is the active card and the other is the deck icon).
![https://tinyimg.io/i/uTEXWWW.png](https://tinyimg.io/i/uTEXWWW.png)
Gives us the expected output. 
![https://tinyimg.io/i/42UMBBh.png](https://tinyimg.io/i/42UMBBh.png) ![https://tinyimg.io/i/zO4kHWK.png](https://tinyimg.io/i/zO4kHWK.png)
Nice.

Finding the active card is similar, we can just use the first entry of the cbtn class.
![https://tinyimg.io/i/yh2cRWp.png](https://tinyimg.io/i/yh2cRWp.png)

I'll need to add more data to this when I begin more intelligent card picking methods, but this will do to start.

## Step 4 - Basic Card Playing
I'll start with basic, unintelligent plays just to get the ball rolling. It'll grab the card color and digit and arbitrarily play a card with no eye to strategy.
Fortunately this should be relatively easy with the work I've already done. I can check the current card, loop through my deck to find one playable, and use the SendCard function to play it. I'll also check my card inventory length to call uno when I have two cards remaining at the beginning of a turn.
![http://tinyimg.io/i/edLiP9f.png](http://tinyimg.io/i/edLiP9f.png)
![http://tinyimg.io/i/XNKrs3H.png](http://tinyimg.io/i/XNKrs3H.png)
![http://tinyimg.io/i/yzSY92z.png](http://tinyimg.io/i/yzSY92z.png)

Now this works... sorta, but it's as good as a random pick. The bot should make intelligent decisions.

## Step 5 - Basic Intelligence; Inventory Sorting
I should be able to separate cards by specific criteria in the inventory so that I can easily find a card to play.
For this I'll make another class called InventorySorter. This sorter should first find playable cards, then find matches by color, number, or type.
The code for this is relatively straightforward so I'll omit it for brevity.
For this first version of the bot, cards will be chosen by level of priority.
## Play order: 

1. Non-wildcard picks (+2 cards)
1. Turn skippers or direction changers
1. Matching colors or numbers (depending on matching cards in inventory)
1. Wildcards (if no other cards are available)
I had to add a few more methods to the sorter to get this to function properly.
![http://tinyimg.io/i/heny5HJ.png](http://tinyimg.io/i/heny5HJ.png)
The "playCard" function just calls the site's sendcard function with some extra debugging information. I'll probably remove it for consistency.

## Step 6 - The test -- Don Carlos Jr., Uno Extraordinaire 
[video=streamable]https://streamable.com/unb19[/video]
https://streamable.com/unb19

## Goals & Final Notes
Uno is largely a game of chance, so my only wish is that the bot has an equal chance of winning as the average human opponent (i.e 50% in a 1-on-1).
There are many strategy changes that could be made to improve the bot, so I'll be trying out new tactics as I test it.
In the future I'll add card counting and decision weighting to aid picks.
