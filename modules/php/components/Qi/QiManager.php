<?php

namespace Bga\Games\Azure\components\Qi;

use Bga\Games\Azure\components\CardManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\Notif;
use Bga\Games\Azure\stats\StatManager;

class QiManager extends CardManager
{
    use Notif;

    public function __construct(Game $game)
    {
        parent::__construct(
            $game,
            $game->qi_cards,
            "qi"
        );
    }

    public function setupVisibleDecks(): void
    {
        foreach ($this->QI as $domain_id => $qi) {
            $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='deck-{$domain_id}' 
            WHERE card_type_arg={$domain_id} AND card_location='deck-0' LIMIT 9");
        }
    }

    public function setupHands(): void
    {
        $players = $this->game->loadPlayersBasicInfos();

        $active_player_id = (int) $this->game->getActivePlayerId();

        foreach ($players as $player_id => $player) {
            $cardsNbr = $active_player_id === $player_id ? 2 : 3;
            $this->deck->pickCards($cardsNbr, "deck-0", $player_id);
        }
    }

    public function setup(): void
    {
        $qiCards = [];

        foreach ($this->QI as $domain_id => $qi) {
            $qiCards[] = ["type" => (string) $qi["name"], "type_arg" => (int) $domain_id, "nbr" => 12];
        }

        $this->deck->createCards($qiCards, "deck-0");
        $this->setupVisibleDecks();
        $this->deck->shuffle("deck-0");

        $this->setupHands();
    }

    public function getDeckCount(int $domain_id): int
    {
        return $this->deck->countCardInLocation("deck-{$domain_id}");
    }

    public function getDecksCounts(): array
    {
        $decksCounts = [];

        $decksCounts[0] = $this->getDeckCount(0);

        foreach ($this->QI as $domain_id => $qi) {
            $decksCounts[$domain_id] = $this->getDeckCount($domain_id);
        }

        return $decksCounts;
    }

    public function getDeck(int $domain_id): array
    {
        $deck = $this->deck->getCardsInLocation("deck-{$domain_id}");
        return array_values($deck);
    }

    public function getDecks(): array
    {
        $decks = [];

        $decks[0] = $this->getDeck(0);

        foreach ($this->QI as $domain_id => $qi) {
            $decks[$domain_id] = $this->getDeck($domain_id);
        }

        return $decks;
    }

    public function countByDomain(int $player_id, int $domain_id): int
    {
        return $this->game->getUniqueValueFromDB("SELECT COUNT(card_id) FROM {$this->dbTable} 
        WHERE card_location='hand' AND card_type_arg={$domain_id} AND card_location_arg={$player_id}");
    }

    public function discardByDomain(
        int $player_id,
        int $nbr,
        int $domain_id
    ): void {
        if ($nbr === 0) {
            return;
        }

        $sql = "SELECT card_id id FROM {$this->dbTable} WHERE card_location='hand' 
        AND card_location_arg={$player_id} AND card_type_arg={$domain_id} LIMIT $nbr";

        $card_ids = $this->game->getObjectListFromDB($sql, true);
        $this->deck->moveCards($card_ids, "deck-{$domain_id}");

        $cards = $this->deck->getCards($card_ids);

        $this->notifAll(
            "discardQi",
            clienttranslate('${player_name} pays ${nbr_log} ${qi_label} card(s) ${qi_icon}'),
            [
                "i18n" => ["qi_label"],
                "preserve" => ["domain_id"],
                "cards" => array_values($cards),
                "nbr" => $nbr,
                "handCount" => $this->getHandCount($player_id),
                "nbr_log" => $nbr,
                "qi_label" => $this->QI[$domain_id]["label"],
                "qi_icon" => "",
                "domain_id" => $domain_id,
            ],
            $player_id,
        );

        $StatManager = new StatManager($this->game);
        $StatManager->inc($player_id, STAT_QI_USED, $nbr);
    }

    public function discardCards(int $player_id, array $cards): void
    {
        $cardsByDomain = [
            1 => [],
            2 => [],
            3 => [],
            4 => []
        ];

        foreach ($cards as $card) {
            $card_id = (int) $card["id"];
            $domain_id = (int) $card["type_arg"];
            $this->deck->moveCard($card_id, "deck-{$domain_id}");

            $cardsByDomain[$domain_id][] = $this->deck->getCard($card_id);
        }

        foreach ($cardsByDomain as $domain_id => $cards) {
            if (!$cards) {
                continue;
            }

            $nbr = count($cards);


            $this->notifAll(
                "discardQi",
                clienttranslate('${player_name} discards ${nbr_log} ${qi_label} card(s) ${qi_icon}'),
                [
                    "i18n" => ["qi_label"],
                    "preserve" => ["domain_id"],
                    "cards" => array_values($cards),
                    "nbr" => $nbr,
                    "handCount" => $this->getHandCount($player_id),
                    "nbr_log" => $nbr,
                    "qi_label" => $this->QI[$domain_id]["label"],
                    "qi_icon" => "",
                    "domain_id" => $domain_id,
                ],
                $player_id,
            );
        }
    }

    public function gather(
        int $player_id,
        int $domain_id,
        int $nbr
    ): void {
        if ($nbr === 0) {
            return;
        }

        $cards = $this->deck->pickCards($nbr, "deck-{$domain_id}", $player_id);

        $this->notifAll(
            "gatherQi",
            clienttranslate('${player_name} gathers ${nbr_log} ${qi_label} card(s) ${qi_icon}'),
            [
                "i18n" => ["qi_label"],
                "preserve" => ["domain_id"],
                "cards" => array_values($cards),
                "nbr" => $nbr,
                "handCount" => $this->getHandCount($player_id),
                "nbr_log" => $nbr,
                "qi_label" => $this->QI[$domain_id]["label"],
                "qi_icon" => "",
                "domain_id" => $domain_id,
            ],
            $player_id,
        );
    }

    public function draw(int $player_id, int $nbr): void
    {
        $cards = $this->deck->pickCards($nbr, "deck-0", $player_id);

        $this->notifAll(
            "drawQi",
            clienttranslate('${player_name} draws ${nbr_log} card(s) from the hidden deck'),
            [
                "nbr_log" => $nbr,
                "nbr" => $nbr,
                "handCount" => $this->getHandCount($player_id),
            ],
            $player_id
        );

        foreach ($cards as $card_id => $card) {
            $domain_id = (int) $card["type_arg"];

            $this->notifPlayer(
                $player_id,
                "drawQiPrivate",
                clienttranslate('You draw a ${qi_label} card from the hidden deck ${qi_icon}'),
                [
                    "i18n" => ["qi_label"],
                    "preserve" => ["domain_id"],
                    "cards" => [$card],
                    "handCount" => $this->getHandCount($player_id),
                    "qi_label" => $this->QI[$domain_id]["label"],
                    "qi_icon" => "",
                    "domain_id" => $domain_id,
                ]
            );
        }
    }

    public function autoreshuffle(): void
    {
        $cardCounts = [];
        foreach ($this->DOMAINS as $domain_id => $domain) {
            $picked = $this->deck->pickCardsForLocation(2, "deck-{$domain_id}", "deck-0");
            $cardCounts[$domain_id] = count($picked);
        }

        $this->deck->shuffle("deck-0");

        $this->notifAll(
            "reshuffleQi",
            clienttranslate('The hidden deck is depleted. 2 cards of each visible deck are shuffled back to it'),
            [
                "cardCounts" => $cardCounts,
            ]
        );
    }
}
