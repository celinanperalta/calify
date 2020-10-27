import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import '../App.css';
import PlaylistRow from './PlaylistRow';
import UniqueId from 'react-html-id';
import spfetch from '../spfetch';
import fetchPlayer from '../fetchPlayer';

function ListItemLink(props) {
  return <ListItem button component = "a" {...props}/>;
}

class Scheduler extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            time: new Date(),
            rows: [],
            playlists: this.props.data,
            curr: null,
            count: 0,
            playing: false,
            player: null,
            playerState: {},
            handlePlayPlaylist: this.props.handlePlayPlaylist,
            handlePause: this.props.handlePause
        };
    }

    async initPlayer() {
        console.log("INITIALIZING PLAYER");
          // Let's fetch a connected player instance and also add it to `window` for debugging purposes
          const player = (global.player = await fetchPlayer());
          this.setState({
              player
          });
          player.addListener('player_state_changed', playerState =>
              this.setState({
                  playerState
              })
          );
        console.log(player);
    }

    async componentDidMount() {
        this.intervalID = setInterval(
            () => this.tick(),
            1000
        );
        await this.initPlayer();
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    handleGetPlaying = () => {
        const t = new Date().toTimeString().split(' ')[0].substr(0, 8);
        if (this.state.curr !== null && t < this.state.curr.end_time) {
            return;
        }

        const curr = this.state.rows.findIndex((row) => {
            return t >= row.start_time && t <= row.end_time;
        });

        if (curr < 0) {
            this.setState({
                curr: null
            });
        } else {
            this.setState({
                curr: this.state.rows[curr]
            });
        }
    }


    tick() {
        this.setState({
            time: new Date()
        });


        if (this.state.curr === null) {
            this.handleGetPlaying();
        } else {
            const start = this.state.curr.start_time;
            const end = this.state.curr.end_time;
            const curr_time = this.state.time.toTimeString().split(' ')[0].substr(0, 8);

            if (this.state.playing) {
                if (curr_time > end) {
                    this.handleGetPlaying();
                    if (this.state.curr !== null) {
                        this.state.handlePlayPlaylist(this.state.curr.uri)
                        console.log("Current: " + this.state.curr.name);
                        console.log("uri: " + this.state.curr.uri);
                    } else {
                        this.setState({
                            playing: false
                        });
                        this.state.handlePause();
                    }
                }
            } else {
                if (curr_time > start) {
                    this.setState({
                        playing: true
                    });
                    this.state.handlePlayPlaylist(this.state.curr.uri)
                    console.log("Current: " + this.state.curr.name);
                    console.log("uri: " + this.state.curr.uri);
                }
            }
        } 
    }

    setSortedRows = () => {
        const rows = this.sortRowsByTime();
        this.setState({rows : rows})
    }

    sortRowsByTime = () => {
        const rows = this.state.rows.sort((a, b) => {
            const s = a.start_time.localeCompare(b.start_time);
            const e = a.start_time.localeCompare(b.start_time);

            return s || e;
        });

        return rows;
    }

    checkTimeOverlap = () => {
        const rows = this.sortRowsByTime();
        var overlap = false;
        for (var i = 0; i !== rows.length - 1; ++i) {
            if (rows[i].start_time <= rows[i + 1].end_time && rows[i + 1].start_time <= rows[i].end_time) {
                overlap = true;
                console.log("Time conflict for: " + rows[i].start_time + " and " + rows[i + 1].start_time);
            }
        }
        if (!overlap)
            console.log("No conflicts");
    }


    handleAddRow = () => {
        this.setState((prevState, props) => {
            const row = {
                id: this.state.count,
                name: "",
                uri: "",
                start_time: "12:00",
                end_time: "12:30"
            };
            return {
                rows: [...prevState.rows, row]
            };
        });
        this.setState({count: (this.state.count + 1)})
    };

    handleDelete = (id, e) => {
        const copyRows = Object.assign([], this.state.rows);
        const index = this.state.rows.findIndex((row) => {
            return row.id === id
        });
        copyRows.splice(index, 1);
        this.setState({
            rows: copyRows
        });
    }

    handleChange = (id, e) => {
        const index = this.state.rows.findIndex((row) => {
            return row.id === id
        });

        const row = Object.assign({}, this.state.rows[index]);

        const key = e.target.name;
        row[key] = e.target.value;

        if (e.target.name === "name") {
            const playlist = this.state.playlists.findIndex((row) => {
                return row.name === e.target.value
            });
            console.log(this.state.playlists);
            row["uri"] = this.state.playlists[playlist].uri;
        }

        if (e.target.type === "time") {
            const start = row.start_time;
            const end = row.end_time;
            if (end < start) {
                row.end_time = row.start_time;
            }
        }

        const rows = Object.assign([], this.state.rows);
        rows[index] = row;

        this.setState({
            rows: rows
        });

       
    }


    handlePlayPreviousTrack = () => this.state.player.previousTrack();
    handlePlayNextTrack = () => this.state.player.nextTrack();
    handleResume = () => this.state.player.resume();
    handlePause = () => this.state.player.pause();
    
    render() {

    return (
      <Card className="Scheduler">
            <CardContent>
                <Typography gutterTop centered variant="h5" component="h2"> {this.state.time.toTimeString()} </Typography>
                <br></br>
                <Grid container spacing={3}> 
                    <Grid item xs={3}>
                        <Button
                            centered
                            variant="contained"
                            color="primary"
                            className={''}
                            onClick={this.handleAddRow}>
                            New Row
                        </Button>
                    </Grid>
                    <Grid item xs={3}>
                        <Button
                            centered
                            variant="contained"
                            color="primary"
                            className={''}
                            onClick={this.setSortedRows}>
                            Sort
                        </Button>
                    </Grid>
                    <Grid item xs={3}>
                        <Button
                            centered
                            variant="contained"
                            color="primary"
                            className={''}
                            onClick={this.handleGetPlaying}>
                            Get Next
                        </Button>
                    </Grid>
                    <Grid item xs={3}>
                        <Button
                            centered
                            variant="contained"
                            color="primary"
                            className={''}
                            onClick={this.checkTimeOverlap}>
                            Check Overlap
                        </Button>
                    </Grid>
                </Grid>
        </CardContent> 
        < Paper className = "ScrollList" >
            <List component="nav" aria-label="main">
                    {this.state.rows && (
                        this.state.rows.map((d) => {
                            return (<PlaylistRow
                                key={d.id}
                                id={d.id}
                                name={d.name}
                                start_time={d.start_time}
                                end_time={d.end_time}
                                playlists={this.state.playlists}
                                onChange={this.handleChange.bind(this, d.id)}
                                onDelete={this.handleDelete.bind(this, d.id)} />)
                        }))}
            </List>
            </Paper>
       </Card>
   )};
}

export default Scheduler;