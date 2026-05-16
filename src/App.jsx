import { useEffect, useState } from 'react';

import axios from 'axios';

import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [token, setToken] = useState('');

    const [map, setMap] = useState([]);

    const [marches, setMarches] = useState([]);

    const [selectedTile, setSelectedTile] = useState(null);

    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const [chatMessages, setChatMessages] = useState([]);

    const [chatInput, setChatInput] = useState('');

    const [notifications, setNotifications] = useState([]);

    const [playerId, setPlayerId] = useState(null);

    const [allianceId] = useState(1);

    useEffect(() => {

        socket.on('connect', () => {

            console.log('Socket connected');

            socket.emit(
                'joinAllianceRoom',
                allianceId
            );

            if (playerId) {

                socket.emit(
                    'joinPlayerRoom',
                    playerId
                );
            }
        });

        socket.on('allianceMessage', (data) => {

            setChatMessages((prev) => [
                ...prev,
                data
            ]);
        });

        socket.on('notification', (data) => {

            setNotifications((prev) => [
                data.message,
                ...prev
            ]);

            alert(data.message);
        });

        return () => {

            socket.off('allianceMessage');

            socket.off('notification');
        };

    }, [playerId]);

    useEffect(() => {

        if (!token) return;

        const interval = setInterval(() => {

            loadMap();

            loadMarches();

        }, 3000);

        return () => clearInterval(interval);

    }, [token]);

    const login = async () => {

        try {

            const res = await axios.post(
                'http://localhost:3000/auth/login',
                {
                    username,
                    password
                }
            );

            setToken(res.data.token);

            const profile =
                await axios.get(
                    'http://localhost:3000/player/profile',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${res.data.token}`
                        }
                    }
                );

            setPlayerId(
                profile.data.player.id
            );

            socket.emit(
                'joinPlayerRoom',
                profile.data.player.id
            );

            alert('Login successful');

        } catch (err) {

            console.log(err);

            alert('Login failed');
        }
    };

    const loadMap = async () => {

        try {

            const res = await axios.get(
                'http://localhost:3000/map',
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMap(res.data.map);

        } catch (err) {

            console.log(err);
        }
    };

    const loadMarches = async () => {

        try {

            const res = await axios.get(
                'http://localhost:3000/march/all',
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMarches(res.data.marches);

        } catch (err) {

            console.log(err);
        }
    };

    const getTileColor = (tile) => {

        const hasMarch =
            marches.find(
                (march) =>
                    march.targetX === tile.x &&
                    march.targetY === tile.y
            );

        if (hasMarch) {
            return 'orange';
        }

        if (tile.player) {
            return 'red';
        }

        if (tile.tileType === 'forest') {
            return 'green';
        }

        if (tile.tileType === 'stone') {
            return 'gray';
        }

        if (tile.tileType === 'gold') {
            return 'gold';
        }

        return '#444';
    };

    const selectTile = async (tile) => {

        setSelectedTile(tile);

        if (tile.player) {

            try {

                const res = await axios.get(
                    `http://localhost:3000/player/${tile.player.id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setSelectedPlayer(
                    res.data.player
                );

            } catch (err) {

                console.log(err);
            }

        } else {

            setSelectedPlayer(null);
        }
    };

    const attackPlayer = async () => {

        try {

            const attackerTile =
                map.flat().find(
                    (tile) =>
                        tile.player &&
                        tile.player.username === username
                );

            if (!attackerTile) {

                alert(
                    'Your city was not found on map'
                );

                return;
            }

            const res = await axios.post(
                'http://localhost:3000/march/create',

                {
                    startX:
                        attackerTile.x,

                    startY:
                        attackerTile.y,

                    targetX:
                        selectedTile.x,

                    targetY:
                        selectedTile.y,

                    troopType:
                        'Infantry',

                    troopAmount: 100,

                    defenderId:
                        selectedPlayer.id
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                `March started. Travel time: ${res.data.travelSeconds}s`
            );

            loadMarches();

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data?.error ||
                'Attack failed'
            );
        }
    };

    const sendAllianceMessage = () => {

        if (!chatInput) return;

        socket.emit(
            'allianceMessage',
            {
                allianceId,

                player: username,

                message: chatInput
            }
        );

        setChatInput('');
    };

    return (

        <div
            style={{
                padding: 20,
                background: '#111',
                color: 'white',
                minHeight: '100vh'
            }}
        >

            <h1>KOA MMO Live Map</h1>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) =>
                    setUsername(e.target.value)
                }
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <br /><br />

            <button onClick={login}>
                Login
            </button>

            <button
                onClick={loadMap}
                style={{ marginLeft: 10 }}
            >
                Load Map
            </button>

            <hr />

            <div
                style={{
                    display: 'flex',
                    gap: 20
                }}
            >

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(100, 20px)',

                        gap: 1,

                        overflow: 'scroll',

                        maxHeight: '80vh',

                        border: '1px solid white',

                        padding: 5
                    }}
                >

                    {map.flat().map((tile, index) => (

                        <div
                            key={index}

                            onClick={() =>
                                selectTile(tile)
                            }

                            title={
                                tile.player
                                    ? tile.player.username
                                    : tile.tileType
                            }

                            style={{
                                width: 20,
                                height: 20,

                                cursor: 'pointer',

                                background:
                                    getTileColor(tile),

                                border:
                                    '1px solid #222'
                            }}
                        />

                    ))}

                </div>

                <div style={{ width: 350 }}>

                    {selectedPlayer && (

                        <div
                            style={{
                                marginBottom: 20,
                                padding: 10,
                                border: '1px solid red',
                                background: '#300'
                            }}
                        >

                            <h2>Player City</h2>

                            <p>
                                Username:
                                {selectedPlayer.username}
                            </p>

                            <p>
                                Power:
                                {selectedPlayer.power}
                            </p>

                            <button
                                onClick={attackPlayer}
                                style={{
                                    marginTop: 10,
                                    background:
                                        'darkred',

                                    color: 'white',

                                    padding: 10,

                                    border: 'none',

                                    cursor: 'pointer'
                                }}
                            >
                                Send Attack March
                            </button>

                        </div>
                    )}

                    <div
                        style={{
                            marginBottom: 20,
                            padding: 10,
                            border: '1px solid orange',
                            background: '#221100'
                        }}
                    >

                        <h2>Notifications</h2>

                        {notifications.map(
                            (note, index) => (

                                <p key={index}>
                                    {note}
                                </p>
                            )
                        )}

                    </div>

                    <div
                        style={{
                            padding: 10,
                            border: '1px solid cyan',
                            background: '#002222'
                        }}
                    >

                        <h2>Alliance Chat</h2>

                        <div
                            style={{
                                height: 200,

                                overflowY:
                                    'scroll',

                                background:
                                    '#111',

                                padding: 10,

                                marginBottom: 10
                            }}
                        >

                            {chatMessages.map(
                                (
                                    msg,
                                    index
                                ) => (

                                    <p key={index}>
                                        <strong>
                                            {msg.player}
                                        </strong>

                                        :

                                        {' '}

                                        {msg.message}
                                    </p>
                                )
                            )}

                        </div>

                        <input
                            placeholder="Message"

                            value={chatInput}

                            onChange={(e) =>
                                setChatInput(
                                    e.target.value
                                )
                            }
                        />

                        <button
                            onClick={
                                sendAllianceMessage
                            }

                            style={{
                                marginLeft: 10
                            }}
                        >
                            Send
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default App;