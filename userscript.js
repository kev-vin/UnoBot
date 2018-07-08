// ==UserScript==
// @name         Uno Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically play uno
// @author       Kevin "1x1x1x1"
// @match        https://play.unofreak.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';
    if(window.location.href == "https://play.unofreak.com/")
    {
        //check for open games
        var lobbies = document.getElementsByClassName("lobbyr");
        for(var i=0; i<lobbies.length; i++)
        {
            var lobby = lobbies[i];
            if(lobby.childNodes[3].innerText == "Public" && lobby.childNodes[2].innerText == "Waiting")
            {
                //join it
                console.log("joining lobby");
                $(lobby.childNodes[4].childNodes[0]).trigger("click");
                return;
            }
        }
        console.log("no lobbies to join. refreshing in 5 seconds");
        setTimeout(function() {
           window.location.reload();
        }, 5000);
    }
})();

class GameState
{
    static findInventoryItems()
    {
        var allCards = document.getElementsByClassName("cbtn");
        var temp = [];
        for(var i=2; i<allCards.length; i++)
        {
            //get card ID by parsing the image URL
            var cardID = allCards[i].getAttribute('style').match(/images\/([0-9]{3}).png/)[1]; //uses getAttribute to get the style as a string so i can regex it
            temp.push(cardID);
        }
        return temp;
    }
    static findActiveCard()
    {
        var cards = document.getElementsByClassName("cbtn");
        for(var i=0; i<cards.length; i++)
        {
            var card = cards[i];
            if(card.getAttribute('style').includes("margin:0 10px 0 0"))
            {
                console.log(card);
                return card.getAttribute('style').match(/images\/([0-9]{3}).png/)[1];
            }
        }
    }
    static findPlayerList()
    {
        var menu = document.getElementsByClassName("vmenu")[0];
        var players = [];
        for(var i=0; i<menu.childNodes.length; i++)
        {
            var player = menu.childNodes[i];
            if(player.childNodes[0].getAttribute("style") != "height:24px;margin-top:-5px;")
            {
                players.push(player);
            }
        }
        return players;
    }
}

class InventorySorter
{
    constructor(inventory, activecard)
    {
        //find playable cards
        this.rawcards = inventory;
        var playable = [];
        for(var i=0; i<inventory.length; i++)
        {
            var card = inventory[i];
            if(activecard[0] == '1' || activecard[0] == '2') //can match color or numb/id for these types
            {
                if(card[1] == activecard[1] /*matching color*/ || (card[0] == activecard[0] && card[2] == activecard[2]) /*matchin id and type*/)
                {
                    playable.push(card);
                }
            }
            else
            {
                //wildcard, can only match color
                if(card[1] == activecard[1])
                {
                    playable.push(card);
                }
            }
            //always add OUR wildcards
            if(card[0] == '3')
            {
                playable.push(card);
            }
        }
        this.inventory = playable;
    }
    findCardsByColor(color, inv=this.inventory)
    {
        var cards = [];
        for(var i=0; i<inv.length; i++)
        {
            //normal or colored special
            if((inv[i][0] == '1' || inv[i][0] == '2') && inv[i][1] == color)
            {
                cards.push(inv[i])
            }
        }
        return cards;
    }
    findCardsByNumber(number)
    {
        var cards = [];
        for(var i=0; i<this.inventory.length; i++)
        {
            //normal cards only
            if(this.inventory[i][0] == '1' && this.inventory[i][2] == number)
            {
                cards.push(this.inventory[i])
            }
        }
        return cards;
    }
    findCardsByType(type)
    {
        var cards = [];
        for(var i=0; i<this.inventory.length; i++)
        {
            //cards of input type
            if(this.inventory[i][0] == type)
            {
                cards.push(this.inventory[i]);
            }
        }
        return cards;
    }
    findSpecialsById(id)
    {
        var cards = [];
        for(var i=0; i<this.inventory.length; i++)
        {
            //special
            if(this.inventory[i][0] == '2' && this.inventory[i][2] == id)
            {
                cards.push(this.inventory[i]);
            }
        }
        return cards;
    }
    findBestColor()
    {
        var bestcolor = {color: '1', count: 0};
        for(var i=1; i<=4; i++)
        {
            var count = this.findCardsByColor(i.toString(), this.rawcards).length;
            if(count > bestcolor.count)
            {
                bestcolor.color = i.toString();
                bestcolor.count = count;
            }
        }
        return bestcolor.color;
    }
    colorFromId(color)
    {
        var dictionary = {
            '1' : "BLUE",
            '2' : "GREEN",
            '3' : "RED",
            '4' : "YELLOW"
        }
        return dictionary[color];
    }
}


if(window.location.href == "https://play.unofreak.com/game")
{
    var playerName = document.querySelector("#messageForm1 > font > b").innerText.replace(":", "");
    var inTurn = false;

    var menuElement = document.getElementById("playerdata");

    setInterval(function() {
        if(document.body.innerText.includes("This game has ended"))
        {
            window.location.href = "https://play.unofreak.com";
        }
    }, 5000);

    menuElement.addEventListener('DOMSubtreeModified', function(event)
    {
        var currentTurn = menuElement.querySelector("li[style='background:#fdf8c3;']");
        if(currentTurn !== null)
        {
            if(currentTurn.innerText.includes(playerName))
            {
                if(!inTurn) //inTurn makes sure the event isnt called more than once in a turn
                {
                    inTurn = true;
                    setTimeout(function() {
                        var activeCard = GameState.findActiveCard();
                        processTurn(activeCard, false, false);
                    }, 500);
                }
            }
            else
            {
                inTurn = false;
            }
        }
    });

    function processTurn(activeCard, picked = false, called=false)
    {
        console.log("Turn started with active card " + activeCard);
        var inventory = GameState.findInventoryItems();

        if(!called)
        {
            if(inventory.length == '2')
            {
                sendcard('calluno');
                console.log("Called uno");
                //let that process, then go again
                setTimeout(function() {
                    processTurn(activeCard, false, true);
                }, 2000)
                return;
            }
        }
        var type = activeCard[0]; //index 0 = type
        var color = activeCard[1]; //index 1 = color
        var number = activeCard[2] //index 2 = number/id

        var sorter = new InventorySorter(inventory, activeCard); //finds playable cards in constructor

        //first priority is +2
        var playablePicks = sorter.findSpecialsById('1')
        if(playablePicks.length > 0)
        {
            console.log("Found first priority +2");
            playCard(playablePicks[0]); //todo: change to be color-conscious

            //it'll be his turn again in 1v1, re-process
            if(GameState.findPlayerList().length == 2)
            {
                setTimeout(function() {
                    processTurn(playablePicks[0], picked, called);
                }, 2000);
            }
            return;
        }

        //then skippers or direction changes
        var playableSkips = sorter.findCardsByType('2'); //assume no picks bc that is in above check
        if(playableSkips.length > 0)
        {
            console.log("Found second priority skip or direction");
            playCard(playableSkips[0]); //todo: change to be color-conscious

            //it'll be his turn again in 1v1, re-process
            if(GameState.findPlayerList().length == 2)
            {
                setTimeout(function() {
                    processTurn(playableSkips[0], picked, called);
                }, 2000);
            }
            return;
        }

        //after specials, always play the current color first
        var playableCurrent = sorter.findCardsByColor(color);
        if(playableCurrent.length > 0)
        {
            console.log("Found matching color");
            playCard(playableCurrent[0]);

            //it'll be his turn again in 1v1, re-process
            return;
        }
        else
        {
            //find the best-suited color change if a matching card exists
            var changePossibilities = sorter.findCardsByNumber(number);
            var bestCard = {cardid: "", count: 0};
            for(var i=0; i<changePossibilities.length; i++)
            {
                var possibility = changePossibilities[i];
                var count = sorter.findCardsByColor(possibility[1]).length;
                if(count > bestCard.count)
                {
                    bestCard.cardid = possibility;
                    bestCard.count = count;
                }
            }
            if(bestCard.cardid != "")
            {
                //we found a suitable card. lets play it
                console.log("Found best card with " + bestCard.count + " matching color cards");
                playCard(bestCard.cardid);
                return;
            }
        }

        //nothing else here, see if any wildcards.
        var playableWild = sorter.findCardsByType('3');
        if(playableWild.length > 0)
        {
            console.log("Playing wildcard");
            playCard(playableWild[0]); //todo: determine best wild (according to pick number)

            setTimeout(function() { //todo: check web request to see when it finishes instead of just waiting
                //set color
                var bestcolor = sorter.findBestColor();
                console.log("Best color determined to be " + bestcolor + " ("+sorter.colorFromId(bestcolor)+")");
                sendcard(sorter.colorFromId(bestcolor));

                //it'll be his turn again in 1v1, re-process
                if(GameState.findPlayerList().length == 2)
                {
                    playableWild[0][1] = bestcolor;
                    setTimeout(function() {
                        processTurn(playableWild[0], picked, called);
                    }, 2000);
                }
            }, 2000);
            return;
        }

        if(!picked) //no playable card, pick from deck (if havent already)
        {
            sendcard('uno');
            console.log("Picked card from deck");
            //re-call turn process function to process with new card
            setTimeout(function() {
                processTurn(activeCard, true, called);
            }, 1500);
            return;
        }
        console.log("Still no playable cards, turn over.");

    }
    function playCard(card)
    {
        console.log("Played card: " + card);
        sendcard(card);
    }

    processTurn();
}
