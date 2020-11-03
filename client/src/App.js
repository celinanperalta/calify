import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import ListItem from '@material-ui/core/List';
import ListItemText from '@material-ui/core/List';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';

import React, { Component } from 'react';
import './App.css';
import fetchPlayer from './fetchPlayer';
import spfetch from './spfetch';
import Firebase from 'firebase';

//Components
import Playlists from './components/Playlists';
import Scheduler from './components/Scheduler';
import Queue from './components/Queue';


class App extends Component {
  // We might be logged in on load if the token could be extracted from the url hash
  state = { isLoggedIn: spfetch.isLoggedIn() };

  //createCustomToken func here

  handleLoginClick = async () => {

    //somewhere call \login
    console.log("Login");
    // var isLoggedIn = await spfetch.login();

  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    /*
    local: 3000
    local: 8888 / login
    api spotify
    local: 3000 / accessToken
    */
    var isLoggedIn = await fetch("https://cors-anywhere.herokuapp.com/http://localhost:8888/login").then(res => console.log(res.text()));
    // var isLoggedIn = await fetch("http://localhost:8888/api/login").then(res => console.log(res.text()));

    console.log("Getting token");
    const accessToken = spfetch.getToken();
    //call createCustom Token

    const {
      display_name: name,
      href,
      images: [{
        url: imageUrl
      } = {}] = [],
      followers: {
        total: numFollowers
      }
    } = await spfetch('/v1/me');

    // createFirebaseAccount(href, name, imageUrl, accessToken).then(firebaseToken => {
    // // Serve an HTML page that signs the user in and updates the user profile.
    //   return signInFirebaseTemplate(firebaseToken, name, imageUrl, accessToken);
    // });

    this.setState({
      isLoggedIn: isLoggedIn
    });

  };

  render() {
    const { isLoggedIn } = this.state;
    return isLoggedIn ? (
      <LoggedInScreen />
    ) : (
      <div className="login">
        <Button
          variant="contained"
          color="primary"
          className={''}
          onClick={this.handleLoginClick}
        >
          Log In With Spotify
        </Button>
      </div>
    );
  }
}

class LoggedInScreen extends Component {


  state = {
    name: null,
    href: null,
    imageUrl: null,
    numFollowers: null,
    player: null,
    playerState: {},
    playlists: null,
    rows: []
  };

  async componentDidMount() {
    await this.getMe();
    await this.getPlaylists();
    this.initPlayer();
  }

  async initPlayer() {
    // Let's fetch a connected player instance and also add it to `window` for debugging purposes
    const player = (global.player = await fetchPlayer());
    this.setState({ player });
    player.addListener('player_state_changed', playerState =>
      this.setState({
        playerState
      })
    );
  }

  async getMe() {
    const {
      display_name: name,
      href,
      images: [{ url: imageUrl } = {}] = [],
      followers: { total: numFollowers }
    } = await spfetch('/v1/me'); 

    this.setState({ name, href, imageUrl, numFollowers });
    return true;
  }

  async getPlaylists() {
    const {
      items: playlists
    } = await spfetch('/v1/me/playlists');
    
    this.setState({playlists});
  }


  handlePlayTopTracks = async () => {
    const { items } = await spfetch('/v1/me/top/tracks');
    this.state.player.play(items.map(({ uri }) => uri));
  };

  handlePlayPlaylist = async (uri) => {
    this.state.player.play(uri);
  };

  handlePlayPreviousTrack = () => this.state.player.previousTrack();
  handlePlayNextTrack = () => this.state.player.nextTrack();
  handleResume = () => this.state.player.resume();
  handlePause = () => this.state.player.pause();

  render() {
    const {
      name,
      imageUrl,
      numFollowers,
      player,
      playerState: {
        paused = true,
        context,
        track_window: { current_track: { name: currentTrackName } = {} } = {},
        restrictions: {
          disallow_pausing_reasons: [pauseRestrictedReason] = [],
          disallow_skipping_prev_reasons: [skipPreviousRestrictedReason] = [],
          disallow_skipping_next_reasons: [skipNextRestrictedReason] = []
        } = {}
      },
      playlists
    } = this.state;

    const hasPlayer = !!player;
    const hasContext = context;

    return (
      <div className="App">
        <CssBaseline/>

        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              {currentTrackName || 'Not playing anything'}
            </Typography>

            <div className="grow"/>

            <IconButton
              color="inherit"
              disabled={
                !hasPlayer || !hasContext || !!skipPreviousRestrictedReason
              }
              onClick={this.handlePlayPreviousTrack}
            >
              <SkipPreviousIcon />
            </IconButton>

            {paused ? (
              <IconButton
                color="inherit"
                disabled={!hasPlayer || !hasContext}
                onClick={this.handleResume}
              >
                <PlayArrowIcon />
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                disabled={!hasPlayer || !hasContext || !!pauseRestrictedReason}
                onClick={this.handlePause}
              >
                <PauseIcon />
              </IconButton>
            )}

            <IconButton
              color="inherit"
              disabled={!hasPlayer || !hasContext || !!skipNextRestrictedReason}
              onClick={this.handlePlayNextTrack}
            >
              <SkipNextIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Grid
        container
        direction = "row"
        justify = "center"
        alignItems="center"
        spacing = {3}>
        
          {false && (
            <Grid item xs={2}>
          <Card className="Card">
            <CardActionArea>
              <CardMedia className="CardMedia" image={imageUrl} title={name} />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {name}
                </Typography>
                <Typography component="p">Followers: {numFollowers}</Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button
                size="small"
                color="primary"
                onClick={this.handlePlayTopTracks}>
                Play Top Tracks
              </Button>
            </CardActions>
          </Card>
            </Grid>
          )}
          
          <Grid container item xs={4} spacing={3} direction="column">
            {playlists && (
            <Grid item>
              <Playlists data={playlists}/>
            </Grid>
            )}
            {playlists && (
            <Grid item>
              {/* <Queue data={playlists}/> */}
            </Grid>
          )}
          
          </Grid>
          
          {playlists && (
            <Grid item xs={8}>
              <Scheduler data={playlists} player={player} handlePlayPlaylist={this.handlePlayPlaylist} handlePause={this.handlePause}/>
            </Grid>
          )}
            
        </ Grid>
        </div>
    );
  }
}

export default App;
