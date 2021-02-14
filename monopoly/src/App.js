import "./App.css";
import { Component } from "react";
import React from "react";
import $ from "jquery";
import startBtn from "./img/startBtn.png";
import customizeBtn from "./img/customizeBtn.png";
import saveBtn from "./img/saveBtn.png";
import map from "./img/map.png";
import player1 from "./img/player1.png";
import player2 from "./img/player2.png";
import player3 from "./img/player3.png";
import player4 from "./img/player4.png";
import goButton from "./img/goButton.png";
import dice0 from "./img/dice0.gif";
import dice1 from "./img/dice1.png";
import dice2 from "./img/dice2.png";
import dice3 from "./img/dice3.png";
import dice4 from "./img/dice4.png";
import dice5 from "./img/dice5.png";
import dice6 from "./img/dice6.png";
import panel1 from "./img/panel1.png";
import panel2 from "./img/panel2.png";
import panel3 from "./img/panel3.png";
import yesBtn from "./img/yesBtn.png";
import noBtn from "./img/noBtn.png";
import flag1 from "./img/flag1.png";
import flag2 from "./img/flag2.png";
import flag3 from "./img/flag3.png";
import flag4 from "./img/flag4.png";
import flag1_1 from "./img/flag1_1.png";
import flag1_2 from "./img/flag1_2.png";
import flag1_3 from "./img/flag1_3.png";
import flag2_1 from "./img/flag2_1.png";
import flag2_2 from "./img/flag2_2.png";
import flag2_3 from "./img/flag2_3.png";
import flag3_1 from "./img/flag3_1.png";
import flag3_2 from "./img/flag3_2.png";
import flag3_3 from "./img/flag3_3.png";
import flag4_1 from "./img/flag4_1.png";
import flag4_2 from "./img/flag4_2.png";
import flag4_3 from "./img/flag4_3.png";
import menuText from "./img/menuText.png";
import { locationInfo } from "./data/locationInfo.js";

const locationArr = locationInfo;

function sleep(time) {
  //For readability
  return new Promise((resolve) => setTimeout(resolve, time));
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: [10000, 10000], //This is the default balance of players
      position: [0, 0], //This is the initialize position of the players
      direction: [true, true], //Initially, all players move in a same direction, if false, the direction reversed
      restriction: [0, 0], //Stop moving, the values represent the number of frozen rounds
      turn: 0, //Indicate who is in turn. 0 is 1P, 1 is 2P...
      roundLeft: -1,
      sellProperty: false, //Allow selling property or not
      event: null //All of the activities other than moving
    };
  }

  saveBtnClick(a, b, c, d) {
    //In the customize page, save the setting
    if (a === "2") {
      //When chosing 2 players
      this.setState({
        balance: [b, b],
        position: [0, 0],
        direction: [true, true],
        restriction: [0, 0]
      });
    } else if (a === "3") {
      //When chosing 2 players
      this.setState({
        balance: [b, b, b],
        position: [0, 0, 0],
        direction: [true, true, true],
        restriction: [0, 0, 0]
      });
      $("#player3").show(); //Add player3
    } else {
      //When chosing 4 players
      this.setState({
        balance: [b, b, b, b],
        position: [0, 0, 0, 0],
        direction: [true, true, true, true],
        restriction: [0, 0, 0, 0]
      });
      $("#player3").show(); //Add player3
      $("#player4").show(); //Add player4
    }
    if (c <= 500) {
      // the number of the rounds
      this.setState({ roundLeft: c });
    } else {
      //if more than 500, the number of rounds will be unlimited
      this.setState({ roundLeft: -1 });
    }
    this.setState({ sellProperty: d });
    $("#settingMenu").hide();
    $("#mainMenu").show(); //Go back to the main menu
  }

  async goBtnClick() {
    //Animation
    $("#tip").hide();
    $("#goButton").hide();
    let dice0 = $("#dice0");
    dice0.show(); //Show the GIF -- rolling the dice
    await sleep(1000);
    dice0.hide(); //After a few second it will hide automatically
    let point = this.roll(); //Call the function to get a random number (L123)
    $("#dice" + point).show(); //Show the dice(point).png -- dice1,dice2, ...dice6
    await this.updatePosition(point);
    await sleep(500); //For user experience, set the time different
    await this.triggerEvent(); //When movement is finished, call the function to judge whether the event triggered
  }

  roll() {
    //get the random number from 1 to 6
    return Math.floor(Math.random() * 6 + 1);
  }

  async updatePosition(point) {
    //Move and update the position
    let currentPosition = this.state.position[this.state.turn]; //1P's position or 2P's position or ...
    if (this.state.direction[this.state.turn]) {
      for (let i = 0; i < point; i++) {
        currentPosition++;
        if (currentPosition > 39) {
          //Initialise the value of the position when player move a circle
          currentPosition = 0;
        }
        await sleep(500);
        this.move(currentPosition); //call the jquery function to move the player (L156)
      }
    } else {
      for (let i = 0; i < point; i++) {
        //move reversely
        currentPosition--;
        if (currentPosition < 0) {
          currentPosition = 39;
        }
        await sleep(500);
        this.move(currentPosition);
      }
    }
    let newPosition = this.state.position;
    newPosition[this.state.turn] = currentPosition;
    this.setState({ position: newPosition });
  }

  move(destination) {
    $("#location" + destination).append($("#player" + (this.state.turn + 1)));
  }

  async judgeStatus() {
    //Judge the status of the game playing ... (the game is over or the game is still...)

    let currentBalance = this.state.balance;
    for (let i = 0; i < currentBalance.length; i++) {
      if (this.state.restriction[i] !== -1) {
        if (currentBalance[i] <= 0) {
          //Bankruptcy
          if (this.state.sellProperty) {
            //If bankruptcy is proposed, the properties will be sold to maintain balance.
            let playerProperty = locationArr.filter(this.findProperty(i)); // Filter the property owned by someone (1P/2P/3P/4P)
            while (currentBalance[i] <= 0 && playerProperty.length !== 0) {
              let randomLocation =
                playerProperty[
                  Math.floor(Math.random() * playerProperty.length)
                ].location;
              locationArr[randomLocation].owner = -1; //The location will back to no owner
              let refund = locationArr[randomLocation].price;
              for (let i = 0; i < locationArr[randomLocation].level; i++) {
                locationArr[randomLocation].fine /= 2;
                refund += locationArr[randomLocation].price;
              }
              locationArr[randomLocation].level = 0;
              currentBalance[i] += Math.floor(refund / 2);
              $("#message").html(
                "Player" +
                  (i + 1) +
                  " goes bankrupt, randomly sells a property at half price"
              );
              $(".messageBoxBtn").hide();
              await sleep(500);
              $("#messageBox").show();
              await sleep(2000);
              $("#messageBox").hide();
              this.setState({ balance: currentBalance });
              playerProperty = locationArr.filter(this.findProperty(i));
            }
          }
          //Finally determine whether the player is out
          if (currentBalance[i] <= 0) {
            let newRestriction = this.state.restriction;
            newRestriction[i] = -1;
            this.setState({ restriction: newRestriction });
            $("#message").html("Player" + (i + 1) + " is out");
            $(".messageBoxBtn").hide();
            $("#messageBox").show();
            await sleep(2000);
            $("#messageBox").hide();
            $("#player" + (i + 1)).hide();
            //reclaim the assets of the players who are out of the game
            for (let j = 0; j < locationArr.length; j++) {
              if (locationArr[j].owner === i) {
                locationArr[j].owner = -1;
              }
            }
          }
        }
      }
    }
    //Determine the number of remaining players, if there is only one player left, this player wins
    let restriction = this.state.restriction;
    let aliveNum = 0;
    for (let i = 0; i < restriction.length; i++) {
      if (restriction[i] !== -1) {
        aliveNum++;
      }
    }
    if (aliveNum === 1) {
      for (let i = 0; i < restriction.length; i++) {
        if (restriction[i] !== -1) {
          aliveNum = i;
        }
      }
      $("#message").html("Player" + (aliveNum + 1) + " Win!"); //aliveNum began with 0, not 1
      $(".messageBoxBtn").hide();
      $("#yesBtn").css("left", "50%");
      $("#yesBtn").show();
      $("#goButton").css("pointer-events", "none");
      $("#messageBox").show();
      this.setState({ event: this.finish.bind(this) });
    }
    await this.updateTurn();
    if (this.state.roundLeft !== -1) {
      //if it is not choosing the infinite
      if (this.state.roundLeft === 0) {
        //Settlement after the game is over
        let balance = this.state.balance;
        let max = Math.max.apply(null, balance);
        let count = 0;
        for (let i = 0; i < balance.length; i++) {
          if (balance[i] === max) {
            count++;
          }
        }
        if (count === 1) {
          $("#message").html("Player" + (balance.indexOf(max) + 1) + " Win!");
          $(".messageBoxBtn").hide();
          $("#yesBtn").css("left", "50%");
          $("#yesBtn").show();
          $("#goButton").css("pointer-events", "none");
          $("#messageBox").show();
          this.setState({ event: this.finish.bind(this) });
        } else {
          $("#message").html("Nobody wins");
          $(".messageBoxBtn").hide();
          $("#yesBtn").css("left", "50%");
          $("#yesBtn").show();
          $("#goButton").css("pointer-events", "none");
          $("#messageBox").show();
          this.setState({ event: this.finish.bind(this) });
        }
      }
    }
    $(".dice").hide();
    $("#tip").show();
    $("#goButton").show();
  }

  async updateTurn() {
    let newTurn = this.state.turn + 1;
    if (newTurn > this.state.balance.length - 1) {
      newTurn = 0;
      //When choosing infinite, update the number of rounds
      if (this.state.roundLeft !== -1) {
        let newRoundLeft = this.state.roundLeft;
        newRoundLeft -= 1;
        await this.setState({ roundLeft: newRoundLeft });
      }
    }
    await this.setState({ turn: newTurn });
    if (this.state.restriction[newTurn] > 0) {
      let newRestriction = this.state.restriction;
      newRestriction[newTurn] -= 1;
      this.setState({ restriction: newRestriction });
      $("#message").html(
        "Player" +
          (newTurn + 1) +
          "Movement is prohibited this round, " +
          this.state.restriction[newTurn] +
          " round(s) remaining"
      );
      $(".messageBoxBtn").hide();
      $("#messageBox").show();
      await sleep(2000);
      $("#messageBox").hide();
      await this.updateTurn();
    } else if (this.state.restriction[newTurn] === -1) {
      await this.updateTurn();
    }
  }

  async triggerEvent() {
    //Trigger random event
    let player = this.state.turn;
    let position = this.state.position[player];
    let newBalance;
    switch (position) {
      case 0:
        //Starting position
        $("#message").html("Reach the starting position, obtain €500");
        $(".messageBoxBtn").hide();
        $("#messageBox").show();
        await sleep(2000);
        $("#messageBox").hide(); //show the message box a few second and it will disappear automatically
        newBalance = this.state.balance;
        newBalance[player] += 500;
        this.setState({ balance: newBalance });
        await this.judgeStatus(); //call the function to judge the game status
        break;
      case 10:
        //Hospital, balance will be substracted
        $("#message").html("Please pay €300 for your regular check-ups.");
        $(".messageBoxBtn").hide();
        $("#messageBox").show();
        await sleep(2000);
        $("#messageBox").hide(); //show the message box a few second and it will disappear automatically
        newBalance = this.state.balance;
        newBalance[player] -= 300;
        this.setState({ balance: newBalance }); //set the state
        await this.judgeStatus();
        break;
      case 20:
        //random event, when at the top left corner, which will trigger another events randomly
        let randomNum;
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            //Stolen
            randomNum = Math.floor(Math.random() * 251 + 50);
            $("#message").html("You were stolen，[€" + randomNum + "] loss");
            $(".messageBoxBtn").hide();
            $("#messageBox").show();
            await sleep(2000);
            $("#messageBox").hide();
            newBalance = this.state.balance;
            newBalance[player] -= randomNum;
            this.setState({ balance: newBalance });
            await this.judgeStatus();
            break;
          case 1:
            //Pick up money
            randomNum = Math.floor(Math.random() * 251 + 50);
            $("#message").html("Picked up[€" + randomNum + "]");
            $(".messageBoxBtn").hide();
            $("#messageBox").show();
            await sleep(2000);
            $("#messageBox").hide();
            newBalance = this.state.balance;
            newBalance[player] += randomNum;
            this.setState({ balance: newBalance });
            await this.judgeStatus();
            break;
          case 2:
            //Move reversely
            $("#message").html("Picked up[€200]");
            $(".messageBoxBtn").hide();
            $("#messageBox").show();
            await sleep(2000);
            $("#messageBox").hide();
            let newDirection = this.state.direction;
            newDirection[player] = false;
            this.setState({ direction: newDirection });
            await this.judgeStatus();
            break;
          case 3:
            //Fall into a pit
            $("#message").html("Fall into a pit, hospitalized for 2 days");
            $(".messageBoxBtn").hide();
            $("#messageBox").show();
            await sleep(2000);
            $("#messageBox").hide();
            let newRestriction = this.state.restriction;
            newRestriction[player] += 2;
            this.setState({ restriction: newRestriction });
            let newPosition = this.state.position;
            newPosition[player] = 10;
            this.setState({ position: newPosition });
            this.move(10);
            await this.judgeStatus();
            break;
          default:
            //Random collapse in earthquake
            let playerProperty = locationArr.filter(this.findProperty(player));
            if (playerProperty.length !== 0) {
              $("#message").html("An earthquake destroyed your house!");
              $(".messageBoxBtn").hide();
              $("#messageBox").show();
              await sleep(2000);
              $("#messageBox").hide();
              let randomLocation =
                playerProperty[
                  Math.floor(Math.random() * playerProperty.length)
                ].location;

              if (locationArr[randomNum].level === 0) {
                locationArr[randomLocation].owner = -1;
              } else {
                locationArr[randomLocation].level -= 1;
                locationArr[randomLocation].fine /= 2;
              }
            } else {
              $("#message").html("Nothing happened");
              $(".messageBoxBtn").hide();
              $("#messageBox").show();
              await sleep(2000);
              $("#messageBox").hide();
            }
            await this.judgeStatus();
        }
        break;
      case 30:
        //Jail
        $("#message").html("Drunk driving, imprisoned for 2 days.");
        $(".messageBoxBtn").hide();
        $("#messageBox").show();
        await sleep(2000);
        $("#messageBox").hide();
        let newRestriction = this.state.restriction;
        newRestriction[player] += 2; //stop moving two rounds
        this.setState({ restriction: newRestriction }); //update the restriction
        if (this.state.balance[player] > 500) {
          await sleep(500);
          $("#message").html("Would you pay €500 bail getting released?");
          $(".messageBoxBtn").show();
          $("#messageBox").show();
          this.setState({ event: this.jailEvent.bind(this) });
        }
        break;
      default:
        //the other spots
        if (locationArr[position].owner === -1) {
          //The position can be bought
          $("#message").html(
            "Would you like to buy this location? [Cost €" +
              locationArr[position].price +
              "]"
          );
          $(".messageBoxBtn").show();
          $("#messageBox").show(); //buy or not
          this.setState({ event: this.buyEvent.bind(this) });
        } else if (locationArr[position].owner === player) {
          //Nothing happened temporarily
          if (locationArr[position].level <= 3) {
            //The property can be upgraded if the level is not max
            $("#message").html(
              "Would you like to upgrade this house？ [Cost €" +
                locationArr[position].price +
                "]"
            );
            $(".messageBoxBtn").show();
            $("#messageBox").show(); //upgraded or not
            this.setState({ event: this.updateEvent.bind(this) });
          }
        } else {
          //Toll
          $("#message").html(
            "Pass by someone's land, pay[€" + locationArr[position].fine + "]"
          );
          $(".messageBoxBtn").hide();
          $("#messageBox").show();
          newBalance = this.state.balance;
          newBalance[player] -= locationArr[position].fine;
          newBalance[locationArr[position].owner] += locationArr[position].fine;
          await sleep(2000);
          this.setState({ balance: newBalance });
          $("#messageBox").hide();
          await this.judgeStatus();
        }
    }
  }

  async noBtnClick() {
    //if the no button is clicked, close the message box
    $("#messageBox").hide();
    await this.judgeStatus();
  }

  async updateEvent() {
    let player = this.state.turn;
    let position = this.state.position[player];
    locationArr[position].level += 1;
    locationArr[position].fine *= 2;
    let newBalance = this.state.balance;
    newBalance[player] -= locationArr[position].price;
    this.setState({ balance: newBalance });
    $("#messageBox").hide();
    await this.judgeStatus();
  }

  async buyEvent() {
    let player = this.state.turn;
    let position = this.state.position[player];
    locationArr[position].owner = player;
    let newBalance = this.state.balance;
    newBalance[player] -= locationArr[position].price; //the price of this location (into the json)
    this.setState({ balance: newBalance });
    $("#messageBox").hide();
    await this.judgeStatus();
  }

  async jailEvent() {
    //pay bail to get released
    let player = this.state.turn;
    let newBalance = this.state.balance;
    newBalance[player] -= 500;
    this.setState({ balance: newBalance });
    let newRestriction = this.state.restriction;
    newRestriction[player] -= 2;
    this.setState({ restriction: newRestriction });
    $("#messageBox").hide();
    await this.judgeStatus();
  }

  finish() {
    window.location.reload();
  }

  findProperty(owner) {
    // Get the player property
    return function (location) {
      return location.owner === owner;
    };
  }

  render() {
    return (
      <div className="App">
        <header id="background" className="App-header">
          <Menu saveBtnClick={this.saveBtnClick.bind(this)} />
          <div id="gameDiv">
            <Map
              goBtnClick={this.goBtnClick.bind(this)}
              turn={this.state.turn}
              roundLeft={this.state.roundLeft}
              noBtnClick={this.noBtnClick.bind(this)}
              yesBtnClick={this.state.event}
            />
            <Panel balance={this.state.balance} />
          </div>
        </header>
      </div>
    );
  }
}

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numOfPlayer: "2",
      initialCapital: 10000,
      maxRound: 550,
      sellProperty: false
    };
  }

  async startBtnClick() {
    $("#menu").hide();
    $("#gameDiv").show();
  }

  customizeBtn() {
    $("#mainMenu").hide();
    $("#settingMenu").show();
  }

  sbPlayerChange(input) {
    this.setState({ numOfPlayer: input.target.value });
  }

  sbMoneyChange(input) {
    this.setState({ initialCapital: input.target.value });
  }

  sbMaxRoundChange(input) {
    this.setState({ maxRound: input.target.value });
  }

  txPlayerChange(input) {
    let newValue = input.target.value;
    newValue = newValue.replace(/[^0-9]|^0{1,}/g, "");
    if (newValue > 4) {
      newValue = 4;
    } else if (newValue < 2) {
      newValue = 2;
    }
    this.setState({ numOfPlayer: newValue });
  }

  txMoneyChange(input) {
    let newValue = input.target.value;
    newValue = newValue.replace(/[^0-9]|^0{1,}/g, "");
    if (newValue > 20000) {
      newValue = 20000;
    }
    this.setState({ initialCapital: newValue });
  }

  txMaxRoundChange(input) {
    //renew the input type value to state (The Max Round in Customize page)
    let newValue = input.target.value;
    newValue = newValue.replace(/[^0-9]|^0{1,}/g, "");
    if (newValue > 500) {
      //upperbound
      newValue = 550;
    }
    this.setState({ maxRound: newValue });
  }

  moneyBlur(input) {
    if (input.target.value < 200) {
      this.setState({ initialCapital: 200 });
    }
  }

  maxRoundBlur(input) {
    if (input.target.value < 1) {
      //bottombound
      this.setState({ maxRound: 1 });
    }
  }

  showMaxRound() {
    if (this.state.maxRound > 500) {
      return "infinite";
    } else {
      return this.state.maxRound;
    }
  }

  checkBoxClick() {
    this.setState({ sellProperty: $("#sellProperty").prop("checked") });
  }

  render() {
    const saveBtnClick = this.props.saveBtnClick;
    return (
      <div id="menu">
        <div id="mainMenu">
          <img
            id="startBtn"
            src={startBtn}
            alt=""
            onClick={this.startBtnClick.bind(this)}
          />
          <img
            id="customizeBtn"
            src={customizeBtn}
            alt=""
            onClick={this.customizeBtn.bind(this)}
          />
        </div>
        <div id="settingMenu">
          <img id="menuText" src={menuText} alt="" />
          <input
            id="sbPlayer"
            type="range"
            min="2"
            max="4"
            value={this.state.numOfPlayer}
            onChange={this.sbPlayerChange.bind(this)}
          />
          <input
            id="txPlayer"
            type="text"
            value={this.state.numOfPlayer}
            onChange={this.txPlayerChange.bind(this)}
          />
          <input
            id="sbMoney"
            type="range"
            min="200"
            max="20000"
            step="100"
            value={this.state.initialCapital}
            onChange={this.sbMoneyChange.bind(this)}
          />
          <input
            id="txMoney"
            type="text"
            value={this.state.initialCapital}
            onChange={this.txMoneyChange.bind(this)}
            onBlur={this.moneyBlur.bind(this)}
          />
          <input
            id="sbMaxRound"
            type="range"
            min="1"
            max="550"
            step="1"
            value={this.state.maxRound}
            onChange={this.sbMaxRoundChange.bind(this)}
          />
          <input
            id="txMaxRound"
            type="text"
            value={this.showMaxRound()}
            onChange={this.txMaxRoundChange.bind(this)}
            onBlur={this.maxRoundBlur.bind(this)}
          />
          <input
            id="sellProperty"
            type="checkbox"
            onClick={this.checkBoxClick.bind(this)}
          />
          <img
            id="saveBtn"
            src={saveBtn}
            alt=""
            onClick={saveBtnClick.bind(
              this,
              this.state.numOfPlayer,
              this.state.initialCapital,
              this.state.maxRound,
              this.state.sellProperty
            )}
          />
        </div>
      </div>
    );
  }
}

class Map extends Component {
  showBuilding(location, owner, level) {
    if (owner !== -1) {
      if (location > 0 && location < 10) {
        return (
          <img
            id={"flag" + location}
            src={this.chooseImg(owner, level)}
            className="flagBottom"
            alt=""
          />
        );
      } else if (location > 10 && location < 20) {
        return (
          <img
            id={"flag" + location}
            src={this.chooseImg(owner, level)}
            className="flagLeft"
            alt=""
          />
        );
      } else if (location > 20 && location < 30) {
        return (
          <img
            id={"flag" + location}
            src={this.chooseImg(owner, level)}
            className="flagTop"
            alt=""
          />
        );
      } else if (location > 30 && location < 40) {
        return (
          <img
            id={"flag" + location}
            src={this.chooseImg(owner, level)}
            className="flagRight"
            alt=""
          />
        );
      }
    }
  }

  chooseImg(owner, level) {
    //Different level of the houses
    if (owner === 0) {
      if (level === 0) {
        return flag1;
      } else if (level === 1) {
        return flag1_1;
      } else if (level === 2) {
        return flag1_2;
      } else {
        return flag1_3;
      }
    } else if (owner === 1) {
      if (level === 0) {
        return flag2;
      } else if (level === 1) {
        return flag2_1;
      } else if (level === 2) {
        return flag2_2;
      } else {
        return flag2_3;
      }
    } else if (owner === 2) {
      if (level === 0) {
        return flag3;
      } else if (level === 1) {
        return flag3_1;
      } else if (level === 2) {
        return flag3_2;
      } else {
        return flag3_3;
      }
    } else {
      if (level === 0) {
        return flag4;
      } else if (level === 1) {
        return flag4_1;
      } else if (level === 2) {
        return flag4_2;
      } else {
        return flag4_3;
      }
    }
  }

  showTip(turn, roundLeft) {
    if (roundLeft === -1) {
      return <p id="tip">player{turn + 1}'s turn</p>;
    } else {
      return (
        <p id="tip">
          player{turn + 1}'s turn, {roundLeft} left
        </p>
      );
    }
  }

  render() {
    const goBtnClick = this.props.goBtnClick;
    const turn = this.props.turn;
    const roundLeft = this.props.roundLeft;
    const noBtnClick = this.props.noBtnClick;
    const yesBtnClick = this.props.yesBtnClick;
    return (
      <div id="mapContainer">
        <img id="map" src={map} alt="" />
        <div id="diceContainer">
          <img id="goButton" src={goButton} alt="" onClick={goBtnClick} />
          {this.showTip(turn, roundLeft)}

          <img id="dice0" className="dice" src={dice0} alt="" />
          <img id="dice1" className="dice" src={dice1} alt="" />
          <img id="dice2" className="dice" src={dice2} alt="" />
          <img id="dice3" className="dice" src={dice3} alt="" />
          <img id="dice4" className="dice" src={dice4} alt="" />
          <img id="dice5" className="dice" src={dice5} alt="" />
          <img id="dice6" className="dice" src={dice6} alt="" />
        </div>
        <div id="messageBox">
          <p id="message" />
          <img
            id="yesBtn"
            className="messageBoxBtn"
            src={yesBtn}
            alt=""
            onClick={yesBtnClick}
          />
          <img
            id="noBtn"
            className="messageBoxBtn"
            src={noBtn}
            alt=""
            onClick={noBtnClick}
          />
        </div>
        <div id="location0">
          <img
            id="player4"
            className="player"
            src={player4}
            style={{ display: "none" }}
            alt=""
          />
          <img
            id="player3"
            className="player"
            src={player3}
            style={{ display: "none" }}
            alt=""
          />
          <img id="player2" className="player" src={player2} alt="" />
          <img id="player1" className="player" src={player1} alt="" />
        </div>
        {locationArr.map(
          (s) =>
            s.location !== 0 && (
              <div id={"location" + s.location} key={s.location}>
                {this.showBuilding(s.location, s.owner, s.level)}
              </div>
            )
        )}
      </div>
    );
  }
}
class Panel extends Component {
  //The panel used for showing the players and their balance
  showPanel(balance) {
    let num = balance.length;
    if (num === 2) {
      //When there are 2 players attending
      return (
        <div id="panel">
          <img id="panelImg" src={panel1} alt="" />
          <p className="text" style={{ left: "37%", color: "white" }}>
            €{balance[0]}
          </p>
          <p className="text" style={{ left: "73.5%", color: "white" }}>
            €{balance[1]}
          </p>
        </div>
      );
    } else if (num === 3) {
      //When there are 3 players attending
      return (
        <div id="panel">
          <img id="panelImg" src={panel2} alt="" />
          <p className="text" style={{ left: "37%", color: "white" }}>
            €{balance[0]}
          </p>
          <p className="text" style={{ left: "60%", color: "white" }}>
            €{balance[1]}
          </p>
          <p className="text" style={{ left: "90%", color: "white" }}>
            €{balance[2]}
          </p>
        </div>
      );
    } else {
      //When there are 4 players attending
      return (
        <div id="panel">
          <img id="panelImg" src={panel3} alt="" />
          <p className="text" style={{ left: "24%", color: "white" }}>
            €{balance[0]}
          </p>
          <p className="text" style={{ left: "44.5%", color: "white" }}>
            €{balance[1]}
          </p>
          <p className="text" style={{ left: "69.5%", color: "white" }}>
            €{balance[2]}
          </p>
          <p className="text" style={{ left: "93.5%", color: "white" }}>
            €{balance[3]}
          </p>
        </div>
      );
    }
  }

  render() {
    const balance = this.props.balance;
    return this.showPanel(balance);
  }
}

export default App;
