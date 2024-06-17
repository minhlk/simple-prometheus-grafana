import express from 'express';
import client from 'prom-client';

// START Collect metric
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
const rockCount = new client.Counter({
    name: 'rock_count',
    help: 'Number of rocks'
})
const paperCount = new client.Counter({
    name: 'paper_count',
    help: 'Number of papers'
})
const scissorsCount = new client.Counter({
    name: 'scissors_count',
    help: 'Number of scissors'
})
const playCount = new client.Counter({
    name: 'play_count',
    help: 'Number of play'
})
register.registerMetric(rockCount)
register.registerMetric(paperCount)
register.registerMetric(scissorsCount);
register.registerMetric(playCount);
collectDefaultMetrics({ register });
// END Collect metric

const app = express();

app.get('/play', function(req, res) {
    let times = req.query.times ?? 3;
    let [rock, paper, scissors] = [0,0,0]
    playCount.inc(Number(times));
    for (let i = 0; i < times; i++) {
        let rand = Math.floor((Math.random() * 10) % 3);
        if (rand == 0) {
            rockCount.inc(1)
            rock++
        } else if (rand == 1) {
            paperCount.inc(1);
            paper++
        } else {
            scissorsCount.inc(1);
            scissors++
        }
    }
    res.status(200).json({rock: rock, paper: paper, scissors, scissors});
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-type', register.contentType);
    res.end(await register.metrics())
})

//START logging to File through Fluentd
import { FluentClient } from '@fluent-org/logger';

// The 2nd argument can be omitted. Here is a default value for options.
const logger = new FluentClient('fluentd.test', {
    socket: {
        host: 'fluentd',
        port: 24224,
        timeout: 3000, // 3 seconds
    }
});

app.get('/logs', (req, res) => {
    let message = 'Random Number: ' + Math.floor(Math.random() * 10)
    logger.emit('follow', {from: 'userA', to: 'userB', message: message});
    res.send(message)
})

app.listen(3001, () => {
    console.log('Listen on port 3001');
});