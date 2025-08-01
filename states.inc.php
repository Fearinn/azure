<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Azure implementation : © Matheus Gomes matheusgomesforwork@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * Azure game states description
 *
 */

use Bga\GameFramework\GameStateBuilder;
use Bga\GameFramework\StateType;

if (!defined("ST_PLAYER_TURN")) {
    define("ST_PLAYER_TURN", 2);
    define("ST_CHECK_BEASTS", 3);
    define("ST_BETWEEN_PLAYERS", 4);

    define("TR_NEXT_PLAYER", "nextPlayer");
}

$machinestates = [
    ST_PLAYER_TURN => GameStateBuilder::create()
        ->name("playerTurn")
        ->description(clienttranslate('${actplayer} must place a stone on a space'))
        ->descriptionmyturn(clienttranslate('${you} must place a stone on a space'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args("arg_playerTurn")
        ->possibleactions([
            "act_placeStone",
        ])
        ->transitions([
            TR_NEXT_PLAYER => ST_BETWEEN_PLAYERS,
        ])
        ->build(),

    ST_BETWEEN_PLAYERS => GameStateBuilder::create()
        ->name("betweenPlayers")
        ->description(clienttranslate("Finishing turn..."))
        ->type(StateType::GAME)
        ->action("st_betweenPlayers")
        ->updateGameProgression(true)
        ->transitions([
            TR_NEXT_PLAYER => ST_PLAYER_TURN,
            "endScore" => 98,
        ])
        ->build(),

    98 => GameStateBuilder::endScore()->build(),
];
