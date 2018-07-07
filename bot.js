class GameState {

    get inventory() {
       return this.findInventoryItems(); 
    }
    get activecard() {
        return this.findActiveCard();
    }
    findInventoryItems() {
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
    findActiveCard() {
        return document.getElementsByClassName("cbtn")[0].getAttribute('style').match(/images\/([0-9]{3}).png/)[1];
    }
}

var playerName = document.querySelector("#messageForm1 > font > b").innerText.replace(":", "");
var inTurn = false;

var menuElement = document.getElementById("playerdata");
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
                processTurn();
            }
        }
        else
        {
            inTurn = false;
        }
    }
});

function processTurn()
{
    console.log("Turn started");
    var state = new GameState();
    
}
