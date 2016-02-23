var Resource;
(function (Resource) {
    Resource[Resource["Brick"] = 0] = "Brick";
    Resource[Resource["Lumber"] = 1] = "Lumber";
    Resource[Resource["Wool"] = 2] = "Wool";
    Resource[Resource["Grain"] = 3] = "Grain";
    Resource[Resource["Ore"] = 4] = "Ore";
    Resource[Resource["SIZE"] = 5] = "SIZE";
    Resource[Resource["Dust"] = 6] = "Dust";
    Resource[Resource["Water"] = 7] = "Water";
    Resource[Resource["ANY"] = 8] = "ANY"; //Used for harbor 3:1
})(Resource || (Resource = {}));
var DevCard;
(function (DevCard) {
    DevCard[DevCard["Knight"] = 0] = "Knight";
    DevCard[DevCard["Monopoly"] = 1] = "Monopoly";
    DevCard[DevCard["RoadBuilding"] = 2] = "RoadBuilding";
    DevCard[DevCard["YearOfPlenty"] = 3] = "YearOfPlenty";
    DevCard[DevCard["VictoryPoint"] = 4] = "VictoryPoint";
    DevCard[DevCard["SIZE"] = 5] = "SIZE";
})(DevCard || (DevCard = {}));
var Construction;
(function (Construction) {
    Construction[Construction["Road"] = 0] = "Road";
    Construction[Construction["Settlement"] = 1] = "Settlement";
    Construction[Construction["City"] = 2] = "City";
    Construction[Construction["DevCard"] = 3] = "DevCard";
    Construction[Construction["SIZE"] = 4] = "SIZE";
})(Construction || (Construction = {}));
var MoveType;
(function (MoveType) {
    MoveType[MoveType["INIT"] = 0] = "INIT";
    MoveType[MoveType["INIT_BUILD"] = 1] = "INIT_BUILD";
    MoveType[MoveType["ROLL_DICE"] = 2] = "ROLL_DICE";
    MoveType[MoveType["BUILD_ROAD"] = 3] = "BUILD_ROAD";
    MoveType[MoveType["BUILD_SETTLEMENT"] = 4] = "BUILD_SETTLEMENT";
    MoveType[MoveType["BUILD_CITY"] = 5] = "BUILD_CITY";
    MoveType[MoveType["BUILD_DEVCARD"] = 6] = "BUILD_DEVCARD";
    MoveType[MoveType["KNIGHT"] = 7] = "KNIGHT";
    MoveType[MoveType["MONOPOLY"] = 8] = "MONOPOLY";
    MoveType[MoveType["YEAR_OF_PLENTY"] = 9] = "YEAR_OF_PLENTY";
    MoveType[MoveType["TRADE"] = 10] = "TRADE";
    MoveType[MoveType["ROBBER_EVENT"] = 11] = "ROBBER_EVENT";
    MoveType[MoveType["ROBBER_MOVE"] = 12] = "ROBBER_MOVE";
    MoveType[MoveType["ROB_PLAYER"] = 13] = "ROB_PLAYER";
    MoveType[MoveType["TRANSACTION_WITH_BANK"] = 14] = "TRANSACTION_WITH_BANK";
    MoveType[MoveType["END"] = 15] = "END";
    MoveType[MoveType["WIN"] = 16] = "WIN";
    MoveType[MoveType["SIZE"] = 17] = "SIZE";
})(MoveType || (MoveType = {}));
function numberResourceCards(player) {
    var total = 0;
    for (var i = 0; i < Resource.SIZE; i++) {
        total += player.resources[i];
    }
    return total;
}
function stealFromPlayer(playerStealing, playerStolen) {
    // no cards to steal
    if (numberResourceCards(playerStolen) == 0)
        return;
    // pick random card from other player's hand - from 1 to number of cards
    var cardIndex = Math.floor(Math.random() * numberResourceCards(playerStolen)) + 1;
    // take from other player, add to stealer
    var currentNumber = 0;
    for (var i = 0; i < Resource.SIZE; i++) {
        currentNumber = playerStolen.resources[i];
        if (cardIndex <= currentNumber) {
            playerStolen.resources[i]--;
            playerStealing.resources[i]++;
            return;
        }
        cardIndex -= currentNumber;
    }
}
function canAffordConstruction(player, construct) {
    switch (construct) {
        case Construction.Road:
            if (player.resources[Resource.Brick] >= 1 && player.resources[Resource.Lumber] >= 1)
                return true;
            break;
        case Construction.Settlement:
            if (player.resources[Resource.Brick] >= 1 && player.resources[Resource.Lumber] >= 1 &&
                player.resources[Resource.Wool] >= 1 && player.resources[Resource.Grain] >= 1)
                return true;
            break;
        case Construction.City:
            if (player.resources[Resource.Grain] >= 2 && player.resources[Resource.Ore] >= 3)
                return true;
            break;
        case Construction.DevCard:
            if (player.resources[Resource.Wool] >= 1 && player.resources[Resource.Grain] >= 1 && player.resources[Resource.Ore] >= 1)
                return true;
            break;
        default:
            return false;
            break;
    }
    return false;
}
function hasSufficientConstructsToBuild(player, construct, bank) {
    switch (construct) {
        case Construction.Road:
            if (player.construction[Construction.Road] < 15)
                return true;
            break;
        case Construction.Settlement:
            if (player.construction[Construction.Settlement] < 5)
                return true;
            break;
        case Construction.City:
            if (player.construction[Construction.City] < 4 && player.construction[Construction.Settlement] > 0)
                return true;
            break;
        case Construction.DevCard:
            for (var i = 0; i < bank.devCards.length; i++) {
                if (bank.devCards[i] > 0) {
                    return true;
                }
            }
            break;
        default:
            return false;
            break;
    }
    return false;
}
function canBuildRoadLegally(player, board, row, col, edge, initial) {
    if (edge < 0 || edge > 5)
        return false;
    if (row < 0 || row > gameLogic.ROWS || col < 0 || col > gameLogic.COLS)
        return false;
    // edge must be empty - no other roads
    if (board[row][col].edges[edge] >= 0)
        return false;
    var adjHex = getHexAdjcentToEdge(row, col, edge);
    // both hexes cannot be water
    if (board[row][col].label == Resource.Water && board[adjHex[0]][adjHex[1]].label == Resource.Water) {
        return false;
    }
    // player owns adjacent road in current hex or adjacent road in adjacent hex
    if (board[row][col].edges[((edge + 1) % 6 + 6) % 6] == player.id ||
        board[row][col].edges[((edge - 1) % 6 + 6) % 6] == player.id ||
        board[adjHex[0]][adjHex[1]].edges[((edge + 3 + 1) % 6 + 6) % 6] == player.id ||
        board[adjHex[0]][adjHex[1]].edges[((edge + 3 - 1) % 6 + 6) % 6] == player.id) {
        // check if other player's settlement/city is inbetween existing road and proposed road
        // cannot build through player's settlement/city, even with connecting road
        // building CC on same hex
        if (board[row][col].edges[((edge + 1) % 6 + 6) % 6] == player.id &&
            ((board[row][col].vertices[edge] == Construction.Settlement ||
                board[row][col].vertices[edge] == Construction.City) &&
                board[row][col].vertexOwner[edge] != player.id)) {
            return false;
        }
        // building CW on same hex
        if (board[row][col].edges[((edge - 1) % 6 + 6) % 6] == player.id &&
            ((board[row][col].vertices[((edge - 1) % 6 + 6) % 6] == Construction.Settlement ||
                board[row][col].vertices[((edge - 1) % 6 + 6) % 6] == Construction.City) &&
                board[row][col].vertexOwner[((edge - 1) % 6 + 6) % 6] != player.id)) {
            return false;
        }
        // building CC on adj. hex
        if (board[adjHex[0]][adjHex[1]].edges[((edge + 3 - 1) % 6 + 6) % 6] == player.id &&
            ((board[row][col].vertices[edge] == Construction.Settlement ||
                board[row][col].vertices[edge] == Construction.City) &&
                board[row][col].vertexOwner[edge] != player.id)) {
            return false;
        }
        // building CW on adj. hex
        if (board[adjHex[0]][adjHex[1]].edges[((edge + 3 + 1) % 6 + 6) % 6] == player.id &&
            ((board[row][col].vertices[((edge - 1) % 6 + 6) % 6] == Construction.Settlement ||
                board[row][col].vertices[((edge - 1) % 6 + 6) % 6] == Construction.City) &&
                board[row][col].vertexOwner[((edge - 1) % 6 + 6) % 6] != player.id)) {
            return false;
        }
        return true;
    }
    // can build road off own existing settlement (for initial roads)
    if (initial) {
        if ((board[row][col].vertices[edge] == Construction.Settlement && board[row][col].vertexOwner[edge] == player.id) ||
            (board[row][col].vertices[(edge + 1) % 6] == Construction.Settlement && board[row][col].vertexOwner[(edge + 1) % 6] == player.id))
            return true;
    }
    return false;
}
function canBuildSettlementLegally(player, board, row, col, vertex, initial) {
    if (vertex < 0 || vertex > 5)
        return false;
    if (row < 0 || row > gameLogic.ROWS || col < 0 || col > gameLogic.COLS)
        return false;
    // proposed vertex must be empty - no other settlement/city
    if (board[row][col].vertices[vertex] != -1)
        return false;
    // one of the 3 hexes must be land
    // TODO: is Water sufficient with "ANY" being allowed?
    var _a = getHexesAdjacentToVertex(row, col, vertex), hex1 = _a[0], hex2 = _a[1];
    if (board[row][col].label == Resource.Water &&
        board[hex1[0]][hex1[1]].label == Resource.Water &&
        board[hex2[0]][hex2[1]].label == Resource.Water) {
        return false;
    }
    // needs adjacent road to build on if not initial settlements
    if (!initial && !hasAdjacentRoad(player, board, row, col, vertex))
        return false;
    // new settlement has to be 2+ vertices away from another settlement/city
    if (hasNearbyConstruct(board, row, col, vertex))
        return false;
    return true;
}
function canUpgradeSettlement(player, board, row, col, vertex) {
    if (vertex < 0 || vertex > 5)
        return false;
    if (row < 0 || row > gameLogic.ROWS || col < 0 || col > gameLogic.COLS)
        return false;
    // proposed vertex must be empty - no other settlement/city
    if (board[row][col].vertices[vertex] == Construction.Settlement &&
        board[row][col].vertexOwner[vertex] == player.id)
        return true;
    return false;
}
// *****************
// Helper functions for player-based functions
// *****************
function hasAdjacentRoad(player, board, row, col, vertex) {
    if (board[row][col].edges[vertex] = player.id)
        return true;
    if (board[row][col].edges[(vertex + 1) % 6] = player.id)
        return true;
    var _a = getHexesAdjacentToVertex(row, col, vertex), hex1 = _a[0], hex2 = _a[1];
    if (board[hex1[0]][hex1[1]].edges[hex1[3]] == player.id)
        return true;
    if (board[hex1[0]][hex1[1]].edges[(hex1[3] + 1) % 6] == player.id)
        return true;
    if (board[hex2[0]][hex2[1]].edges[hex2[3]] == player.id)
        return true;
    if (board[hex2[0]][hex2[1]].edges[(hex2[3] + 1) % 6] == player.id)
        return true;
    return false;
}
function hasNearbyConstruct(board, row, col, vertex) {
    if (board[row][col].vertices[vertex] == Construction.Settlement ||
        board[row][col].vertices[vertex] == Construction.City)
        return true;
    if (board[row][col].vertices[(vertex + 1) % 6] == Construction.Settlement ||
        board[row][col].vertices[(vertex + 1) % 6] == Construction.City ||
        board[row][col].vertices[((vertex - 1) % 6 + 6) % 6] == Construction.Settlement ||
        board[row][col].vertices[((vertex - 1) % 6 + 6) % 6] == Construction.City)
        return true;
    var _a = getHexesAdjacentToVertex(row, col, vertex), hex1 = _a[0], hex2 = _a[1];
    if (board[hex1[0]][hex1[1]].vertices[(hex1[3] + 1) % 6] == Construction.Settlement ||
        board[hex1[0]][hex1[1]].vertices[(hex1[3] + 1) % 6] == Construction.City ||
        board[hex1[0]][hex1[1]].vertices[((hex1[3] - 1) % 6 + 6) % 6] == Construction.Settlement ||
        board[hex1[0]][hex1[1]].vertices[((hex1[3] - 1) % 6 + 6) % 6] == Construction.City)
        return true;
    if (board[hex2[0]][hex2[1]].vertices[(hex2[3] + 1) % 6] == Construction.Settlement ||
        board[hex2[0]][hex2[1]].vertices[(hex2[3] + 1) % 6] == Construction.City ||
        board[hex2[0]][hex2[1]].vertices[((hex2[3] - 1) % 6 + 6) % 6] == Construction.Settlement ||
        board[hex2[0]][hex2[1]].vertices[((hex2[3] - 1) % 6 + 6) % 6] == Construction.City)
        return true;
    return false;
}
// return [row, col] pair that shares edge with original edge
function getHexAdjcentToEdge(row, col, edge) {
    // TODO: add check for new row/col out of bounds
    if (edge == 0)
        return [row, col + 1];
    if (edge == 1 && row % 2 == 0)
        return [row - 1, col + 1];
    if (edge == 1 && row % 2 == 1)
        return [row - 1, col];
    if (edge == 2 && row % 2 == 0)
        return [row - 1, col];
    if (edge == 2 && row % 2 == 1)
        return [row - 1, col - 1];
    if (edge == 3)
        return [row, col - 1];
    if (edge == 4 && row % 2 == 0)
        return [row + 1, col];
    if (edge == 4 && row % 2 == 1)
        return [row + 1, col - 1];
    if (edge == 5 && row % 2 == 0)
        return [row + 1, col + 1];
    if (edge == 5 && row % 2 == 1)
        return [row + 1, col];
    // default - shouldn't happen though
    return [-1, -1];
}
// will return 2 hexes in [row, col, vertex] that share the original vertex
function getHexesAdjacentToVertex(row, col, vertex) {
    // TODO: add check for new row/col hexes out of bounds
    if (vertex == 0 && row % 2 == 0)
        return [[row, col + 1, 2], [row - 1, col + 1, 4]];
    if (vertex == 0 && row % 2 == 1)
        return [[row, col + 1, 2], [row - 1, col, 4]];
    if (vertex == 1 && row % 2 == 0)
        return [[row - 1, col, 5], [row - 1, col + 1, 3]];
    if (vertex == 1 && row % 2 == 1)
        return [[row - 1, col - 1, 5], [row - 1, col, 3]];
    if (vertex == 2 && row % 2 == 0)
        return [[row, col - 1, 0], [row - 1, col, 4]];
    if (vertex == 2 && row % 2 == 1)
        return [[row, col - 1, 0], [row - 1, col - 1, 4]];
    if (vertex == 3 && row % 2 == 0)
        return [[row, col - 1, 5], [row + 1, col, 1]];
    if (vertex == 3 && row % 2 == 1)
        return [[row, col - 1, 5], [row + 1, col - 1, 1]];
    if (vertex == 4 && row % 2 == 0)
        return [[row + 1, col, 0], [row + 1, col + 1, 2]];
    if (vertex == 4 && row % 2 == 1)
        return [[row + 1, col - 1, 0], [row + 1, col, 2]];
    if (vertex == 5 && row % 2 == 0)
        return [[row + 1, col + 1, 1], [row, col + 1, 3]];
    if (vertex == 5 && row % 2 == 1)
        return [[row + 1, col, 1], [row, col + 1, 3]];
    // default - shouldn't happen though
    return [[-1, -1, -1], [-1, -1, -1]];
}
/**
 * Constants definitions
 */
var tokens = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];
var terrains = [
    Resource.Brick,
    Resource.Brick,
    Resource.Brick,
    Resource.Lumber,
    Resource.Lumber,
    Resource.Lumber,
    Resource.Lumber,
    Resource.Wool,
    Resource.Wool,
    Resource.Wool,
    Resource.Wool,
    Resource.Grain,
    Resource.Grain,
    Resource.Grain,
    Resource.Grain,
    Resource.Ore,
    Resource.Ore,
    Resource.Ore,
    Resource.Dust
];
/**
 * Constants for harbors
 */
var harborPos = [
    [1, 3],
    [1, 4],
    [2, 1],
    [2, 4],
    [3, 1],
    [4, 1],
    [4, 4],
    [5, 3],
    [5, 4]
];
var harbors = [
    {
        trading: Resource.ANY,
        vertices: [1, 2]
    },
    {
        trading: Resource.Ore,
        vertices: [0, 1]
    },
    {
        trading: Resource.Lumber,
        vertices: [1, 2]
    },
    {
        trading: Resource.ANY,
        vertices: [0, 5]
    },
    {
        trading: Resource.ANY,
        vertices: [2, 3]
    },
    {
        trading: Resource.Wool,
        vertices: [3, 4]
    },
    {
        trading: Resource.Brick,
        vertices: [0, 5]
    },
    {
        trading: Resource.Grain,
        vertices: [3, 4]
    },
    {
        trading: Resource.ANY,
        vertices: [4, 5]
    }
];
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 7;
    gameLogic.COLS = 7;
    gameLogic.NUM_PLAYERS = 4;
    function shuffleArray(src) {
        var ret = angular.copy(src);
        for (var j = void 0, x = void 0, i = ret.length; i; j = Math.floor(Math.random() * i), x = ret[--i], ret[i] = ret[j], ret[j] = x)
            ;
        return ret;
    }
    function isSea(row, col) {
        if (row === 0 || col === 0 || row === gameLogic.ROWS - 1 || col === gameLogic.COLS - 1) {
            return true;
        }
        else if (row === 1 || row === 5) {
            if (col === 1 || col > 4) {
                return true;
            }
        }
        else if (row === 2 || row === 4) {
            if (col > 4) {
                return true;
            }
        }
        return false;
    }
    function assignRollNum(board) {
        var visited = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            visited[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                visited[i][j] = i === 0 || j === 0 || i === gameLogic.ROWS - 1 || j === gameLogic.COLS - 1;
            }
        }
        var dir = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1] //left
        ];
        var r = 1;
        var c = 1;
        var tokenPtr = 0;
        var dirPtr = 0;
        while (!visited[r][c]) {
            visited[r][c] = true;
            if (board[r][c].label !== Resource.Water && board[r][c].label !== Resource.Dust) {
                board[r][c].rollNum = tokens[tokenPtr++];
            }
            if (visited[r + dir[dirPtr][0]][c + dir[dirPtr][1]]) {
                dirPtr = (dirPtr + 1) % dir.length;
            }
            r += dir[dirPtr][0];
            c += dir[dirPtr][1];
        }
        return board;
    }
    function assignHarbor(row, col) {
        for (var i = 0; i < harborPos.length; i++) {
            if (harborPos[i][0] === row && harborPos[i][1] === col) {
                return harbors[i];
            }
        }
        return null;
    }
    function getInitialBoard() {
        var board = [];
        //Shuffle & terrains
        var newTerrains = shuffleArray(terrains);
        var terrainPtr = 0;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                var edges = [-1, -1, -1, -1, -1, -1];
                var vertices = [-1, -1, -1, -1, -1, -1];
                var vertexOwner = [-1, -1, -1, -1, -1, -1];
                var label = isSea(i, j) ? Resource.Water : newTerrains[terrainPtr++];
                var hex = {
                    label: label,
                    edges: edges,
                    vertices: vertices,
                    vertexOwner: vertexOwner,
                    rollNum: -1,
                    harbor: assignHarbor(i, j),
                    hasRobber: label === Resource.Dust
                };
                board[i][j] = hex;
            }
        }
        return assignRollNum(board);
    }
    function getInitialArray(size) {
        var ret = [];
        for (var i = 0; i < size; i++) {
            ret[i] = 0;
        }
        return ret;
    }
    function getInitialPlayers() {
        var players = [];
        for (var i = 0; i < gameLogic.NUM_PLAYERS; i++) {
            players[i] = {
                id: i,
                points: 0,
                resources: getInitialArray(Resource.SIZE),
                devCards: getInitialArray(DevCard.SIZE),
                knightsPlayed: 0,
                longestRoad: 0,
                construction: getInitialArray(Construction.SIZE)
            };
        }
        return players;
    }
    function getInitialBank() {
        var bank = {
            resources: getInitialArray(Resource.SIZE),
            devCards: getInitialArray(DevCard.SIZE)
        };
        //Assign total size of resources/devCards in bank according to rules
        for (var i = 0; i < Resource.SIZE; i++) {
            bank.resources[i] = 19;
        }
        for (var i = 0; i < DevCard.SIZE; i++) {
            switch (i) {
                case DevCard.Knight:
                    bank.devCards[i] = 14;
                    break;
                case DevCard.Monopoly:
                    bank.devCards[i] = 2;
                    break;
                case DevCard.RoadBuilding:
                    bank.devCards[i] = 2;
                    break;
                case DevCard.YearOfPlenty:
                    bank.devCards[i] = 2;
                    break;
                case DevCard.VictoryPoint:
                    bank.devCards[i] = 5;
                    break;
                default:
                    break;
            }
        }
        return bank;
    }
    function getInitialAwards() {
        return {
            longestRoad: {
                player: -1,
                length: 4
            },
            largestArmy: {
                player: -1,
                num: 2
            }
        };
    }
    function getInitialRobber(board) {
        var row = -1;
        var col = -1;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j].hasRobber) {
                    row = i;
                    col = j;
                    break;
                }
            }
        }
        return { row: row, col: col };
    }
    function getInitialState() {
        var board = getInitialBoard();
        var robber = getInitialRobber(board);
        return {
            board: board,
            dices: [1, 1],
            players: getInitialPlayers(),
            bank: getInitialBank(),
            awards: getInitialAwards(),
            robber: robber,
            diceRolled: false,
            devCardsPlayed: false,
            delta: null,
            moveType: MoveType.INIT,
            eventIdx: -1,
            building: null
        };
    }
    gameLogic.getInitialState = getInitialState;
    /**
     * Validation logics
     */
    /**
     * XXX: MUST have the same ordering as MoveType has
     */
    var validateHandlers = [
        null,
        null,
        checkRollDice,
        checkBuildRoad,
        checkBuildSettlement,
        checkBuildCity,
        checkBuildDevCards,
        checkPlayDevCard,
        checkPlayDevCard,
        checkPlayDevCard,
        null,
        checkRobberEvent,
        checkRobberMove,
        null,
        checkTradeResourceWithBank
    ];
    function checkRollDice(prevState, nextState, idx) {
        if (prevState.diceRolled) {
            throw new Error('Dices already rolled');
        }
    }
    function checkResourcesToBuild(player, consType, bank) {
        if (!canAffordConstruction(player, consType)) {
            throw new Error('Insufficient resources to build ' + consType);
        }
        if (!hasSufficientConstructsToBuild(player, consType, bank)) {
            throw new Error('Has no enough constructions to build ' + consType);
        }
    }
    function checkBuildRoad(prevState, nextState, idx) {
        checkResourcesToBuild(prevState.players[idx], Construction.Road, prevState.bank);
        var building = nextState.building;
        var player = nextState.players[idx];
        if (!canBuildRoadLegally(player, prevState.board, building.hexRow, building.hexCol, building.vertexOrEdge, building.init)) {
            throw new Error('Cannot build road legally!');
        }
    }
    function checkBuildSettlement(prevState, nextState, idx) {
        checkResourcesToBuild(prevState.players[idx], Construction.Settlement, prevState.bank);
        var building = nextState.building;
        var player = nextState.players[idx];
        if (!canBuildSettlementLegally(player, prevState.board, building.hexRow, building.hexCol, building.vertexOrEdge, building.init)) {
            throw new Error('Cannot build settlement legally!');
        }
    }
    function checkBuildCity(prevState, nextState, idx) {
        checkResourcesToBuild(prevState.players[idx], Construction.City, prevState.bank);
        var building = nextState.building;
        var player = nextState.players[idx];
        if (!canUpgradeSettlement(player, prevState.board, building.hexRow, building.hexCol, building.vertexOrEdge)) {
            throw new Error('Cannot build city legally!');
        }
    }
    /**
    * XXX: Assuming UI will disable this feature when bank has no dev cards
    */
    function checkBuildDevCards(prevState, nextState, idx) {
        if (!prevState.diceRolled) {
            throw new Error('Need to roll dices first');
        }
        checkResources(nextState.players[idx].resources);
    }
    function checkPlayDevCard(prevState, nextState, idx) {
        if (prevState.devCardsPlayed) {
            throw new Error('Already played development cards');
        }
        //Check when playing year of plenty
        try {
            checkResources(nextState.bank.resources);
        }
        catch (e) {
            throw new Error('Bank Error: ' + e.message);
        }
    }
    function checkRobberEvent(prevState, nextState, idx) {
        var prevSum = 0;
        var nextSum = 0;
        for (var i = 0; i < Resource.SIZE; i++) {
            prevSum += prevState.players[idx].resources[i];
            nextSum += nextState.players[idx].resources[i];
        }
        if (prevSum > 7 && nextSum > prevSum / 2) {
            throw new Error('Need to toss half of resource cards');
        }
    }
    function checkRobberMove(prevState, nextState, idx) {
        if (angular.equals(prevState.robber, nextState.robber)) {
            throw new Error('Need to move robber');
        }
    }
    function checkResources(resources) {
        for (var i = 0; i < Resource.SIZE; i++) {
            if (resources[i] < 0) {
                throw new Error('Insufficient resources: ' + Resource[i]);
            }
        }
    }
    function findTradingRatio(board, trading, idx) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j].harbor === null || board[i][j].harbor.trading !== Resource.ANY ||
                    board[i][j].harbor.trading !== trading) {
                    continue;
                }
                var harbor = board[i][j].harbor;
                for (var v = 0; v < 6; v++) {
                    if (board[i][j].vertexOwner[v] === idx &&
                        (harbor.vertices[0] === v || harbor.vertices[1] === v)) {
                        return board[i][j].harbor.trading === Resource.ANY ? 3 : 2;
                    }
                }
            }
        }
        return 4;
    }
    function checkTradeResourceWithBank(prevState, nextState, idx) {
        if (!prevState.diceRolled) {
            throw new Error('Need to roll dices first');
        }
        var selling = { item: Resource.Dust, num: 0 };
        var buying = { item: Resource.Dust, num: 0 };
        checkResources(nextState.players[idx].resources);
        for (var i = 0; i < Resource.SIZE; i++) {
            if (nextState.players[idx].resources[i] < prevState.players[idx].resources[i]) {
                if (selling.item !== Resource.Dust) {
                    throw new Error('Need to use same resources for trading');
                }
                selling = {
                    item: i,
                    num: prevState.players[idx].resources[i] - nextState.players[idx].resources[i]
                };
            }
            if (nextState.players[idx].resources[i] > prevState.players[idx].resources[i]) {
                if (buying.item !== Resource.Dust) {
                    throw new Error('One resource per trade');
                }
                buying = {
                    item: i,
                    num: nextState.players[idx].resources[i] - prevState.players[idx].resources[i]
                };
            }
        }
        if (selling.item === buying.item) {
            throw new Error('Cannot trade the same resources');
        }
        if (buying.num * findTradingRatio(nextState.board, buying.item, idx) !== selling.num) {
            throw new Error('Wrong trading ratio');
        }
    }
    function checkMoveOk(stateTransition) {
        var prevState = stateTransition.stateBeforeMove;
        var nextState = stateTransition.move.stateAfterMove;
        var prevIdx = nextState.moveType === MoveType.ROBBER_EVENT ?
            prevState.eventIdx : stateTransition.turnIndexBeforeMove;
        //TODO: What are these for, exactly?
        var nextIdx = stateTransition.move.turnIndexAfterMove;
        var delta = stateTransition.move.stateAfterMove.delta;
        if (nextState.moveType !== MoveType.INIT && nextState.moveType !== MoveType.WIN) {
            if (nextState.moveType >= MoveType.SIZE || validateHandlers[nextState.moveType] === null) {
                throw new Error('Unknown move!');
            }
            else {
                validateHandlers[nextState.moveType](prevState, nextState, prevIdx);
            }
        }
    }
    gameLogic.checkMoveOk = checkMoveOk;
    /**
     * create move logics
     */
    var createMoveHandlers = [
        noop,
        onBuilding,
        onRollDice,
        onBuilding,
        onBuilding,
        onBuilding,
        onBuilding,
        onKnight,
        onMonopoly,
        onYearOfPlenty,
        null,
        onRobberEvent,
        onRobberMove,
        onRobPlayer,
        onTradingWithBank,
        onEndTurn,
        noop,
    ];
    function countScores(state) {
        var scores = [];
        for (var i = 0; i < gameLogic.NUM_PLAYERS; i++) {
            scores[i] = 0;
        }
        for (var i = 0; i < gameLogic.NUM_PLAYERS; i++) {
            //Count scores from construction
            var player = state.players[i];
            for (var c = 0; c < Construction.SIZE; c++) {
                switch (c) {
                    case Construction.Settlement:
                        scores[i] += 1;
                        break;
                    case Construction.City:
                        scores[i] += 2;
                        break;
                    default:
                        //noop
                        break;
                }
            }
            //Count scores from victory point cards
            scores[i] += player.devCards[DevCard.VictoryPoint];
        }
        //Add scores if awards assigned
        if (state.awards.longestRoad.player !== -1) {
            scores[state.awards.longestRoad.player] += 2;
        }
        if (state.awards.largestArmy.player !== -1) {
            scores[state.awards.largestArmy.player] += 2;
        }
        return scores;
    }
    function noop(move, turnIdx) {
        //TODO
        return null;
    }
    function onRollDice(move, turnIdx) {
        //TODO
        return null;
    }
    function onBuilding(move, turnIdx) {
        var buildingMove = move;
        //TODO
        return null;
    }
    function onKnight(move, turnIdx) {
        //TODO
        return null;
    }
    function onMonopoly(move, turnIdx) {
        var monopolyMove = move;
        //TODO
        return null;
    }
    function onYearOfPlenty(move, turnIdx) {
        var yearOfPlentyMove = move;
        //TODO
        return null;
    }
    function onRobberEvent(move, turnIdx) {
        var robberEventMove = move;
        //TODO
        return null;
    }
    function onRobberMove(move, turnIdx) {
        var robberMove = move;
        //TODO
        return null;
    }
    function onRobPlayer(move, turnIdx) {
        var robPlayerMove = move;
        //TODO
        return null;
    }
    function onTradingWithBank(move, turnIdx) {
        var tradeWithBankMove = move;
        //TODO
        return null;
    }
    function onEndTurn(move, turnIdx) {
        var stateBeforeMove = angular.copy(move.currState);
        stateBeforeMove.delta = null;
        var scores = countScores(stateBeforeMove);
        var hasWinner = false;
        for (var i = 0; i < gameLogic.NUM_PLAYERS; i++) {
            if (scores[i] >= 10) {
                hasWinner = true;
                break;
            }
        }
        var stateAfterMove = {
            board: angular.copy(stateBeforeMove.board),
            dices: angular.copy(stateBeforeMove.dices),
            players: angular.copy(stateBeforeMove.players),
            bank: angular.copy(stateBeforeMove.bank),
            robber: angular.copy(stateBeforeMove.robber),
            awards: angular.copy(stateBeforeMove.awards),
            diceRolled: false,
            devCardsPlayed: false,
            moveType: hasWinner ? MoveType.WIN : MoveType.INIT,
            eventIdx: -1,
            building: null,
            delta: stateBeforeMove
        };
        return {
            endMatchScores: scores,
            turnIndexAfterMove: (turnIdx + 1) % gameLogic.NUM_PLAYERS,
            stateAfterMove: stateAfterMove
        };
    }
    function createMove(turnIndexBeforeMove, move) {
        //TODO
        return createMoveHandlers[move.moveType](move, turnIndexBeforeMove);
    }
    gameLogic.createMove = createMove;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map