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

// const useStyles = makeStyles((theme) => ({
//     root: {
//         width: '100%',
//         maxWidth: 360,
//         backgroundColor: theme.palette.background.paper
//     },
// }));

function ListItemLink(props) {
  return <ListItem button component = "a" {...props}/>;
}

class PlaylistDisplay extends React.Component {

  constructor(props) {
    super(props);

    const items = props.data.map((d) =>
        <ListItemLink key={d.uri} href={d.external_urls.spotify}>
          <ListItemText primary={d.name}>{d.name}</ListItemText>
        </ListItemLink>
      );

    this.state = {
      start_time: "0",
      end_time: "0",
      name: "",
      playlists: items,
      uri: null
    };
  }

  componentDidMount() {
    
  }

  render() {
    return (
      <Card className="Card">
        <CardContent>
          <Typography gutterTop centered variant="h5" component="h1">
            Playlists
          </Typography>
        </CardContent>
        <Paper className="ScrollList">
          <List component="nav" aria-label="main">
            {this.state.playlists}
          </List>
        </Paper>
      </Card>
    )
  }
}

export default PlaylistDisplay