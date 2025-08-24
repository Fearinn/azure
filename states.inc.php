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
    define("ST_BIRD_DISCARD", 5);
    define("ST_GATHER_BOUNTIFUL", 6);
    define("ST_END_SCORE", 98);
    define("ST_END_GAME", 99);

    define("TR_CHECK_BEASTS", "TR_CHECK_BEASTS");
    define("TR_NEXT_PLAYER", "TR_NEXT_PLAYER");
    define("TR_BIRD_DISCARD", "TR_BIRD_DISCARD");
    define("TR_GATHER_BOUNTIFUL", "TR_GATHER_BOUNTIFUL");
    define("TR_END_SCORE", "TR_END_SCORE");
    define("TR_END_GAME", "TR_END_GAME");
}

$machinestates = [
    ST_PLAYER_TURN => GameStateBuilder::create()
        ->name("playerTurn")
        ->description(clienttranslate('${actplayer} must place a common stone'))
        ->descriptionmyturn(clienttranslate('${you} must place a common stone'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args("arg_playerTurn")
        ->action("st_playerTurn")
        ->possibleactions([
            "act_placeStone",
            "act_placeGifted",
        ])
        ->transitions([
            TR_CHECK_BEASTS => ST_CHECK_BEASTS,
            TR_GATHER_BOUNTIFUL => ST_GATHER_BOUNTIFUL,
            TR_END_GAME => ST_END_SCORE,
        ])
        ->updateGameProgression(true)
        ->build(),

    ST_CHECK_BEASTS => GameStateBuilder::create()
        ->name("checkBeasts")
        ->description(clienttranslate('Checking Auspicious Beasts...'))
        ->descriptionmyturn(clienttranslate('Checking Auspicious Beasts...'))
        ->type(StateType::GAME)
        ->action("st_checkBeasts")
        ->transitions([
            TR_NEXT_PLAYER => ST_BETWEEN_PLAYERS,
            TR_BIRD_DISCARD => ST_BIRD_DISCARD,
            TR_END_GAME => ST_END_SCORE,
        ])
        ->build(),

    ST_BIRD_DISCARD => GameStateBuilder::create()
        ->name("birdDiscard")
        ->description(clienttranslate('${actplayer} must discard 2 qi from his hand'))
        ->descriptionmyturn(clienttranslate('${you} must discard 2 qi from your hand'))
        ->type(StateType::ACTIVE_PLAYER)
        ->action("st_birdDiscard")
        ->possibleactions([
            "act_birdDiscard",
        ])
        ->transitions([
            TR_NEXT_PLAYER => ST_BETWEEN_PLAYERS
        ])
        ->build(),

    ST_GATHER_BOUNTIFUL => GameStateBuilder::create()
        ->name("gatherBountiful")
        ->description(clienttranslate('${actplayer} must pick an additional boon ${space_icon}'))
        ->descriptionmyturn(clienttranslate('${you} must pick an additional boon ${space_icon}'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args("arg_gatherBountiful")
        ->action("st_gatherBountiful")
        ->possibleactions([
            "act_gatherBountiful",
        ])
        ->transitions([
            TR_CHECK_BEASTS => ST_CHECK_BEASTS,
            TR_END_GAME => ST_END_SCORE,
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
            TR_END_GAME => ST_END_SCORE,
        ])
        ->build(),

    98 => GameStateBuilder::endScore()->build(),
];
