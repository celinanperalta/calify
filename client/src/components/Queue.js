import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'
import '../App.css';

function ListItemLink(props) {
  return <ListItem button component = "a" {...props}/>;
}

class Queue extends React.Component {

  constructor(props) {
    super(props);

  const items = props.data.map((d) =>
      <ListItemLink key={d.uri} href={d.external_urls.spotify}>
        <ListItemText primary={d.name}>{d.name}</ListItemText>
      </ListItemLink>
    );

    this.state = {
        curr_playlist: "",
        time: new Date(),
        curr_uri: "",
        queue: []
    };
  }

  componentDidMount() {
    this.intervalID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  tick() {
    this.setState({
      time: new Date()
    });
  }

  render() {
    return (
      <Card className="Card">
        <CardContent>
          <Typography gutterTop centered variant="h5" component="h1">
            Now Playing
          </Typography>
          <Typography gutterTop centered variant="h5" component="h2"> {this.state.time.toLocaleTimeString()} </Typography>
        <Typography gutterTop centered variant="h5" component="h2">
            {this.state.curr_playlist}
          </Typography>
        </CardContent>
      </Card>
    )
  }
}

export default Queue