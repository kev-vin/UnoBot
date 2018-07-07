class GameState 
{
    findInventoryItems() 
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
    findActiveCard() 
    {
        var cards = document.getElementsByClassName("cbtn");
        for(var i=0; i<cards.length; i++)
        {
            card = cards[i];
            if(card.getAttribute('style').includes("margin:0"))
            {
                return card.getAttribute('style').match(/images\/([0-9]{3}).png/)[1];
            }
        }
    }
}

class InventorySorter 
{
    findCardByColor(inventory, color) 
    {

    }
    findCardByNumber(inventory, number) 
    {

    }
    findCardByType(inventory, type)
    {
        
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
                processTurn(false);
            }
        }
        else
        {
            inTurn = false;
        }
    }
});

function processTurn(picked = false)
{
    var state = new GameState();

    var activeCard = state.findActiveCard();
    console.log("Turn started with active card " + activeCard);
    var inventory = state.findInventoryItems();

    if(inventory.length == '2')
    {
        sendcard('calluno');
    }
    var type = activecard[0]; //index 0 = type
    var color = activeCard[1]; //index 1 = color
    var number = activeCard[2] //index 2 = number
    var play = '';
    for(var i=0; i<inventory.length; i++)
    {
        switch(type)
        {
            case '1': //number card, match color or number
                if(inventory[i][1] == color || inventory[i][2] == number)
                {
                    play = inventory[i];
                    return;
                }
                break;
            case '3': //wildcard, match only color
                if(inventory[i][1] == color)
                {
                    console.log("Played card: " + inventory[i]);
                    sendcard(inventory[i]);
                    return;
                }
                break;
        }
        if(inventory[i][1] == color || inventory[i][2] == number)
        {
            console.log("Played card: " + inventory[i]);
            sendcard(inventory[i]);
            return;
        }
    }

    if(play)
    {
        console.log("Played card: " + inventory[i]);
        sendcard(inventory[i]);
        return;
    }
    else if(!picked) //no playable card, pick from deck (if havent already)
    {
        sendcard('uno');
        console.log("Picked card from deck");
        //re-call turn process function to process with new card
        processTurn(true);
        return;
    }
    console.log("Still no playable cards, turn over.");
    
}
