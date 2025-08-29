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

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\Actions\Types\JsonParam;
use Bga\GameFramework\Actions\Types\StringParam;
use Bga\GameFramework\Components\Deck;
use Bga\Games\Azure\actions\ActBirdDiscard;
use Bga\Games\Azure\actions\ActGatherBountiful;
use Bga\Games\Azure\actions\ActPlaceGifted;
use Bga\Games\Azure\actions\ActPlaceStone;
use Bga\Games\Azure\components\Beasts\Beast;
use Bga\Games\Azure\components\Beasts\BeastManager;
use Bga\Games\Azure\components\Gifted\GiftedCard;
use Bga\Games\Azure\components\Gifted\GiftedManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\notifications\NotifManager;
use Bga\Games\Azure\states\StBetweenPlayers;
use Bga\Games\Azure\states\StBirdDiscard;
use Bga\Games\Azure\states\StCheckBeasts;
use Bga\Games\Azure\states\StEndScore;
use Bga\Games\Azure\states\StGatherBountiful;
use Bga\Games\Azure\states\StPlayerTurn;
use Bga\Games\Azure\stats\StatManager;

class Game extends \Bga\GameFramework\Table
{
    public readonly array $QI;
    public readonly array $DOMAINS;
    public readonly array $BEASTS;
    public readonly array $MOUNTAINS;
    public readonly array $SPACES;
    public readonly array $SERPENTS;
    public readonly array $GIFTED_CARDS;

    public Deck $qi_cards;
    public Deck $stone_cards;
    public Deck $beast_cards;

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

        $this->beast_cards = $this->getNew("module.common.deck");
        $this->beast_cards->init("beast");

        $Notify = new NotifManager($this);
        $Notify->addDecorators();

        $this->initGameStateLabels([]);
    }

    public function getGameProgression(): int
    {
        $StoneManager = new StoneManager($this);
        $placedStones = $StoneManager->getPlaced();

        $progression = (count($placedStones) / 28) * 99;
        return (int) round($progression);
    }

    // States

    public function arg_playerTurn(): array
    {
        $StPlayerTurn = new StPlayerTurn($this);
        return $StPlayerTurn->getArgs();
    }

    public function st_playerTurn(): void
    {
        $StPlayerTurn = new StPlayerTurn($this);
        $StPlayerTurn->act();
    }

    public function st_checkBeasts(): void
    {
        $StCheckBeasts = new StCheckBeasts($this);
        $StCheckBeasts->act();
    }

    public function st_birdDiscard(): void
    {
        $StBirdDiscard = new StBirdDiscard($this);
        $StBirdDiscard->act();
    }

    public function arg_gatherBountiful(): array
    {
        $StGatherBountiful = new StGatherBountiful($this);
        return $StGatherBountiful->getArgs();
    }

    public function st_gatherBountiful(): void
    {
        $StGatherBountiful = new StGatherBountiful($this);
        $StGatherBountiful->act();
    }

    public function st_betweenPlayers(): void
    {
        $StBetweenPlayers = new StBetweenPlayers($this);
        $StBetweenPlayers->act();
    }

    public function stEndScore(): void
    {
        $StEndScore = new StEndScore($this);
        $StEndScore->act();
    }

    // Player Actions

    public function act_placeStone(
        #[IntParam(min: 1, max: 6)] int $x,
        #[IntParam(min: 1, max: 6)] int $y
    ): void {
        $ActPlaceStone = new ActPlaceStone($this);
        $ActPlaceStone->act($x, $y);
    }

    public function act_placeGifted(
        #[IntParam(min: 1, max: 6)] int $x,
        #[IntParam(min: 1, max: 6)] int $y
    ): void {
        $ActPlaceGifted = new ActPlaceGifted($this);
        $ActPlaceGifted->act($x, $y);
    }

    public function act_birdDiscard(
        #[JsonParam] array $cards
    ): void {
        $ActBirdDiscard = new ActBirdDiscard($this);
        $ActBirdDiscard->act($cards);
    }

    public function act_gatherBountiful(
        #[StringParam(enum: ["qi", "wisdom"])] string $boon
    ): void {
        $ActGatherBountiful = new ActGatherBountiful($this);
        $ActGatherBountiful->act($boon);
    }

    public function upgradeTableDb($from_version) {}

    protected function getAllDatas(): array
    {
        $SpaceManager = new SpaceManager($this);
        if (!$this->globals->get(G_SERPENTS)) {
            $SpaceManager->setupSerpents();
        }

        $current_player_id = (int) $this->getCurrentPlayerId();

        $BeastManager = new BeastManager($this);
        $QiManager = new QiManager($this);
        $StoneManager = new StoneManager($this);
        $GiftedManager = new GiftedManager($this);

        $gamedatas = [
            "players" => $this->getCollectionFromDb("SELECT `player_id` `id`, `player_score` `score` FROM `player`"),
            "BEASTS" => $this->BEASTS,
            "QI" => $this->QI,
            "realm" => $this->globals->get(G_REALM),
            "domainsOrder" => $this->globals->get(G_DOMAINS_ORDER),
            "domainsRotations" => $this->globals->get(G_DOMAINS_ROTATIONS),
            "domainsSides" => $this->globals->get(G_DOMAINS_SIDES),
            "placedBeasts" => $BeastManager->getPlaced(),
            "activeBeasts" => $BeastManager->getActive(),
            "decksCounts" => $QiManager->getDecksCounts(),
            "handsCounts" => $QiManager->getHandsCounts(),
            "placedStones" => $StoneManager->getPlaced(),
            "stoneCounts" => $StoneManager->getHandsCounts(),
            "giftedCard" => $GiftedManager->getGiftedCard(),
            "giftedStones" => $StoneManager->getGifted(),
            "bonds" => $SpaceManager->getPlayersBonds(),
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

        $GiftedManager = new GiftedManager($this);
        $GiftedManager->setup();

        $SpaceManager = new SpaceManager($this);
        $SpaceManager->setup();

        $QiManager = new QiManager($this);
        $QiManager->setup();

        $StoneManager = new StoneManager($this);
        $StoneManager->setup();

        $BeastManager = new BeastManager($this);
        $BeastManager->setup();

        $StatManager = new StatManager($this);
        $StatManager->init();
    }

    protected function zombieTurn(array $state, int $active_player): void
    {
        $state_name = $state["name"];
        $this->gamestate->jumpToState(ST_END_GAME);
    }

    public function debug_gainFavor(int $domain_id): void
    {
        $player_id = (int) $this->getCurrentPlayerId();
        $Beast = new Beast($this, $domain_id);
        $Beast->gainFavor($player_id);
    }
}
