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
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */

declare(strict_types=1);

namespace Bga\Games\Azure;

use Bga\GameFramework\Components\Deck;
use Bga\Games\Azure\actions\ActPlaceStone;
use Bga\Games\Azure\components\Beasts\BeastManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\notifications\NotifManager;

class Game extends \Bga\GameFramework\Table
{
    public readonly array $QI;
    public readonly array $DOMAINS;
    public readonly array $BEASTS;
    public readonly array $SPACES;

    public Deck $qi_cards;
    public Deck $stone_cards;

    public function __construct()
    {
        parent::__construct();

        require "material/material.inc.php";
        require "material/domains.inc.php";
        require "material/constants.inc.php";

        $this->qi_cards = $this->getNew("module.common.deck");
        $this->qi_cards->init("qi");

        $this->stone_cards = $this->getNew("module.common.deck");
        $this->stone_cards->init("stone");

        $Notify = new NotifManager($this);
        $Notify->addDecorators();

        $this->initGameStateLabels([]);
    }

    public function upgradeTableDb($from_version) {}

    protected function getAllDatas(): array
    {
        $current_player_id = (int) $this->getCurrentPlayerId();

        $BeastManager = new BeastManager($this);
        $QiManager = new QiManager($this);
        $StoneManager = new StoneManager($this);

        $gamedatas = [
            "players" => $this->getCollectionFromDb("SELECT `player_id` `id`, `player_score` `score` FROM `player`"),
            "realm" => $this->globals->get(G_REALM),
            "domainsOrder" => $this->globals->get(G_DOMAINS_ORDER),
            "domainsRotations" => $this->globals->get(G_DOMAINS_ROTATIONS),
            "domainsSides" => $this->globals->get(G_DOMAINS_SIDES),
            "mountains" => $BeastManager->getMountains(),
            "decksCounts" => $QiManager->getDecksCounts(),
            "decks" => $QiManager->getDecks(),
            "handsCounts" => $QiManager->getHandsCounts(),
            "stoneCounts" => $StoneManager->getHandsCounts(),
        ];

        if (!$this->isSpectator()) {
            $gamedatas["hand"] = $QiManager->getHand($current_player_id);
        }

        return $gamedatas;
    }

    protected function setupNewGame($players, $options = [])
    {
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $player_id => $player) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $player_id,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        static::DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reloadPlayersBasicInfos();
        $this->activeNextPlayer();

        $SpaceManager = new SpaceManager($this);
        $SpaceManager->setup();

        $QiManager = new QiManager($this);
        $QiManager->setup();

        $StoneManager = new StoneManager($this);
        $StoneManager->setup();
    }

    protected function zombieTurn(array $state, int $active_player): void
    {
        $state_name = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($state_name) {
                default: {
                        $this->gamestate->nextState("zombiePass");
                        break;
                    }
            }

            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }

    public function debug_setupQi(): void
    {
        $QiManager = new QiManager($this);
        $QiManager->setup();
    }

    public function debug_placeStone(int $x = 5, int $y = 6): void
    {
        $ActPlaceStone = new ActPlaceStone($this);
        $ActPlaceStone->act($x, $y);
    }
}
